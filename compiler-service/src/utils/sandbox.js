import { spawn } from "child_process";

export const runInSandbox = ({ command, args, cwd, input = "", timeout = 3000 }) => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const process = spawn(command, args, { cwd });

    let output = "";
    let errorOutput = "";
    let isTimeout = false;

    process.stdin.write(input ?? "");
    process.stdin.end();

    process.stdout.on("data", (data) => {
      output += data.toString();
    });

    process.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    const timer = setTimeout(() => {
      isTimeout = true;
      process.kill("SIGKILL");
    }, timeout);

    process.on("close", (code) => {
      clearTimeout(timer);
      const executionTime = `${Date.now() - startTime}ms`;

      if (isTimeout) {
        return resolve({
          success: false,
          output: null,
          error: "Time Limit Exceeded",
          time: executionTime,
        });
      }

      if (code !== 0 && errorOutput) {
        return resolve({
          success: false,
          output: null,
          error: errorOutput.trim() || `Exited with code ${code}`,
          time: executionTime,
        });
      }

      return resolve({
        success: true,
        output: output.trim(),
        error: null,
        time: executionTime,
      });
    });
  });
};
