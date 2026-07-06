import { spawn } from "child_process";
import { cleanCompilerError } from "./cleanError.js";

// Compilation (esp. C++ -O2 with <bits/stdc++.h> on musl/Alpine and small VMs)
// can legitimately take well over 10s. Keep this generous — it caps a runaway
// compiler, it is NOT a user-facing latency budget. Overridable via env.
const COMPILE_TIMEOUT_MS = Number(process.env.COMPILE_TIMEOUT_MS) || 30000;

/**
 * Runs a compile command once and resolves with a structured result.
 *
 * IMPORTANT: compilation is considered failed ONLY when the compiler exits with
 * a non-zero code. Warnings printed to stderr no longer fail an otherwise-valid
 * build — they are returned separately as `warnings`.
 *
 * @returns {Promise<{ success, error, warnings, time }>}
 */
export const compileSource = ({ command, args }) => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let stderr = "";
    let settled = false;

    const child = spawn(command, args);

    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ ...result, time: Date.now() - startTime });
    };

    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      finish({
        success: false,
        error: "Compilation timed out",
        warnings: null,
      });
    }, COMPILE_TIMEOUT_MS);

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    // Drain stdout so a compiler that writes a lot to it can't fill the OS pipe
    // buffer and block (which would otherwise look like a timeout).
    child.stdout.on("data", () => {});

    child.on("error", (err) => {
      finish({
        success: false,
        error: `Compilation spawn error: ${err.message}`,
        warnings: null,
      });
    });

    child.on("close", (code) => {
      if (code !== 0) {
        return finish({
          success: false,
          error: cleanCompilerError(stderr) || `Compilation failed (code ${code})`,
          warnings: null,
        });
      }
      // Exit 0 => success; any stderr is warnings, not an error.
      finish({
        success: true,
        error: null,
        warnings: stderr.trim() ? cleanCompilerError(stderr) : null,
      });
    });
  });
};
