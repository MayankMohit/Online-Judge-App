import { spawn } from "child_process";
import os from "os";

const isWindows = os.platform() === "win32";

/**
 * Execution status codes returned by the sandbox. The backend maps these
 * directly to verdicts instead of string-matching error text.
 */
export const Status = {
  OK: "OK",
  RUNTIME_ERROR: "RUNTIME_ERROR",
  TLE: "TLE",
  MLE: "MLE",
  INTERNAL: "INTERNAL",
};

const DEFAULT_TIME_LIMIT_MS = 3000;
const DEFAULT_MEMORY_LIMIT_MB = 256;
const MAX_OUTPUT_BYTES = 1024 * 1024; // 1 MB cap to prevent output floods

// Submitted code executes as this unprivileged uid/gid when set (Docker provides
// them; unset in local dev, where no privilege drop is attempted). The Node server
// must be root for setuid to succeed.
const SANDBOX_UID = process.env.SANDBOX_UID ? Number(process.env.SANDBOX_UID) : null;
const SANDBOX_GID = process.env.SANDBOX_GID ? Number(process.env.SANDBOX_GID) : null;
// Largest file the process may create (KB), enforced via `ulimit -f`, to stop a
// submission from flooding the container disk. ulimit -f counts 512-byte blocks.
const MAX_FILE_SIZE_KB = Number(process.env.SANDBOX_FSIZE_KB) || 30720; // 30 MB
const MAX_FILE_SIZE_BLOCKS = MAX_FILE_SIZE_KB * 2;

/**
 * Runs a command with time + memory limits and returns a structured result.
 *
 * On Linux the command is wrapped in `sh -c 'ulimit -t <s>; [ulimit -v <kb>;] exec ...'`
 * so a runaway process is killed by the OS rather than taking down the container.
 * `ulimit -v` is applied only when `useAddressSpaceLimit` is set (unsafe for Node/JVM,
 * which reserve large virtual memory regardless of heap use). `sh` (not bash) is used
 * because the Alpine runtime image ships busybox ash, not bash.
 * On Windows (local dev) resource limits are skipped — only the wall-clock timer applies.
 *
 * @returns {Promise<{ status, output, error, time }>}
 */
export const runInSandbox = ({
  command,
  args = [],
  input = "",
  cwd,
  timeout = DEFAULT_TIME_LIMIT_MS,
  memoryLimitMb = DEFAULT_MEMORY_LIMIT_MB,
  useAddressSpaceLimit = true,
}) => {
  return new Promise((resolve) => {
    const startTime = Date.now();

    // Force plain, non-ANSI output regardless of the parent environment. Without
    // this, Node colorizes non-string console.log args (e.g. console.log(42) ->
    // "\x1b[33m42\x1b[39m") whenever FORCE_COLOR is inherited, which silently
    // breaks output comparison. NO_COLOR is the cross-tool standard; dropping
    // FORCE_COLOR ensures it isn't overridden.
    const childEnv = { ...process.env, NO_COLOR: "1" };
    delete childEnv.FORCE_COLOR;

    let child;
    if (isWindows) {
      child = spawn(command, args, { cwd, env: childEnv });
    } else {
      // ulimit -t is CPU seconds; ulimit -v is virtual memory in KB; ulimit -f is
      // the max file size (512-byte blocks) the process may write.
      const cpuSeconds = Math.ceil(timeout / 1000) + 1;
      const quoted = [command, ...args]
        .map((a) => `'${String(a).replace(/'/g, "'\\''")}'`)
        .join(" ");
      const limits = [
        `ulimit -t ${cpuSeconds}`,
        `ulimit -f ${MAX_FILE_SIZE_BLOCKS}`,
      ];
      if (useAddressSpaceLimit) {
        const memKb = Math.max(memoryLimitMb, 32) * 1024;
        limits.push(`ulimit -v ${memKb}`);
      }
      const wrapped = `${limits.join("; ")}; exec ${quoted}`;

      // Drop to the unprivileged sandbox user so submitted code can't touch the
      // container filesystem or run as root. Requires the server to be root.
      // detached:true makes the child a process-group leader so a runaway can be
      // killed as a group (parent + forked children) — see killTree().
      const spawnOpts = { cwd, env: childEnv, detached: true };
      if (SANDBOX_UID != null) {
        spawnOpts.uid = SANDBOX_UID;
        if (SANDBOX_GID != null) spawnOpts.gid = SANDBOX_GID;
      }
      child = spawn("sh", ["-c", wrapped], spawnOpts);
    }

    let output = "";
    let errorOutput = "";
    let outputBytes = 0;
    let killedForOutput = false;
    let isTimeout = false;
    let settled = false;

    const done = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ ...result, time: Date.now() - startTime });
    };

    // Kill the whole process group so forked children can't outlive the kill and
    // keep consuming CPU. On Linux the child leads its own group (detached:true);
    // on Windows (dev) fall back to a plain single-process kill.
    const killTree = () => {
      try {
        if (!isWindows && child.pid) {
          process.kill(-child.pid, "SIGKILL");
          return;
        }
      } catch {
        // group already gone — fall through to a direct kill.
      }
      try {
        child.kill("SIGKILL");
      } catch {
        // already exited.
      }
    };

    try {
      if (input && input.length > 0) child.stdin.write(input);
      child.stdin.end();
    } catch {
      // stdin may already be closed if the process died instantly; ignore.
    }

    child.stdout.on("data", (data) => {
      outputBytes += data.length;
      if (outputBytes > MAX_OUTPUT_BYTES) {
        killedForOutput = true;
        killTree();
        return;
      }
      output += data.toString();
    });

    child.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    const timer = setTimeout(() => {
      isTimeout = true;
      killTree();
    }, timeout);

    child.on("error", (err) => {
      done({
        status: Status.INTERNAL,
        output: null,
        error: `Spawn error: ${err.message}`,
      });
    });

    child.on("close", (code, signal) => {
      if (isTimeout) {
        return done({ status: Status.TLE, output: null, error: "Time Limit Exceeded" });
      }

      if (killedForOutput) {
        return done({
          status: Status.RUNTIME_ERROR,
          output: null,
          error: "Output limit exceeded",
        });
      }

      // ulimit -t sends SIGXCPU/SIGKILL when CPU time is exhausted -> treat as TLE.
      if (signal === "SIGXCPU") {
        return done({ status: Status.TLE, output: null, error: "Time Limit Exceeded" });
      }

      // Memory-limit hits usually surface as bad_alloc / non-zero exit; heuristically
      // flag common out-of-memory signatures as MLE, otherwise runtime error.
      if (code !== 0) {
        const lower = errorOutput.toLowerCase();
        const isMle =
          lower.includes("bad_alloc") ||
          lower.includes("out of memory") ||
          lower.includes("memoryerror") ||
          lower.includes("cannot allocate");
        return done({
          status: isMle ? Status.MLE : Status.RUNTIME_ERROR,
          output: null,
          error: errorOutput.trim() || `Process exited with code ${code}`,
        });
      }

      return done({
        status: Status.OK,
        output: output.length > 0 ? output.trimEnd() : "",
        error: null,
      });
    });
  });
};
