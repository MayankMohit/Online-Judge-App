import { spawn } from "child_process";
import fs from "fs";

/**
 * Runs a command in a sandboxed environment.
 * 
 * @param {Object} options
 * @param {string} options.command - Command to run (e.g., node, python3).
 * @param {string[]} options.args - Arguments for the command.
 * @param {string} options.input - Input to be fed to stdin.
 * @param {string} [options.cwd] - Working directory.
 * @param {number} [options.timeout=3000] - Max execution time (ms).
 * @returns {Promise<Object>} - { success, output, error, time }
 */
export const runInSandbox = ({ command, args, input = "", cwd, timeout = 3000 }) => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const child = spawn(command, args, { cwd });

    let output = "";
    let errorOutput = "";
    let isTimeout = false;

    // Write input only if non-empty
    if (input && input.length > 0) {
      child.stdin.write(input);
    }
    child.stdin.end();

    child.stdout.on("data", (data) => {
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
      clearTimeout(timer);
      return resolve({
        success: false,
        output: null,
        error: `Spawn error: ${err.message}`,
        time: Date.now() - startTime,
      });
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      const executionTime = Date.now() - startTime;

      if (isTimeout) {
        return resolve({
          success: false,
          output: null,
          error: "Time Limit Exceeded",
          time: executionTime,
        });
      }

      // If process exits with non-zero code and there's stderr output
      if (code !== 0 && errorOutput.trim()) {
        return resolve({
          success: false,
          output: null,
          error: errorOutput.trim(),
          time: executionTime,
        });
      }

      return resolve({
        success: true,
        output: output.length > 0 ? output.trimEnd() : "",
        error: null,
        time: executionTime,
      });
    });
  });
};
