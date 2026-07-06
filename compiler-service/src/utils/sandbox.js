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
      // ulimit -t is CPU seconds; ulimit -v is virtual memory in KB.
      const cpuSeconds = Math.ceil(timeout / 1000) + 1;
      const quoted = [command, ...args]
        .map((a) => `'${String(a).replace(/'/g, "'\\''")}'`)
        .join(" ");
      const limits = [`ulimit -t ${cpuSeconds}`];
      if (useAddressSpaceLimit) {
        const memKb = Math.max(memoryLimitMb, 32) * 1024;
        limits.push(`ulimit -v ${memKb}`);
      }
      const wrapped = `${limits.join("; ")}; exec ${quoted}`;
      child = spawn("sh", ["-c", wrapped], { cwd, env: childEnv });
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
        child.kill("SIGKILL");
        return;
      }
      output += data.toString();
    });

    child.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    const timer = setTimeout(() => {
      isTimeout = true;
      child.kill("SIGKILL");
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
