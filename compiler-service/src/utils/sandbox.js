import { spawn } from "child_process";

export const runInSandbox = ({ command, args, cwd, input = "", timeout = 3000 }) => {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, { cwd });

    let output = "";
    let errorOutput = "";

    if (input) {
      process.stdin.write(input);
    }
    process.stdin.end();

    process.stdout.on("data", (data) => {
      output += data.toString();
    });

    process.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    const timer = setTimeout(() => {
      process.kill("SIGTERM");
      reject({ error: "Execution timed out" });
    }, timeout);

    process.on("close", (code) => {
      clearTimeout(timer);
      if (code !== 0 && errorOutput) {
        return reject({ error: errorOutput });
      }
      resolve(output.trim());
    });
  });
};
