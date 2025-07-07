import { spawn } from "child_process";
import path from "path";
import os from "os";
import { mkdirSync, existsSync, unlink } from "fs";
import { runInSandbox } from "../utils/sandbox.js";

const outputDir = path.join(path.resolve(), "temp", "outputs");

if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

export const executeCpp = async (filePath, input = "") => {
  const jobId = path.basename(filePath).split(".")[0];
  const isWindows = os.platform() === "win32";
  const outputFile = path.join(outputDir, isWindows ? `${jobId}.exe` : `${jobId}.out`);

  return new Promise((resolve) => {
    const compile = spawn("g++", [filePath, "-o", outputFile]);

    let compileError = "";

    compile.stderr.on("data", (data) => {
      compileError += data.toString();
    });

    compile.on("close", async (code) => {
      if (code !== 0 || compileError) {
        unlink(outputFile, () => {});
        unlink(filePath, () => {});
        return resolve({
          success: false,
          output: null,
          error: compileError || `Compilation failed with code ${code}`,
          time: null
        });
      }

      const result = await runInSandbox({
        command: outputFile,
        args: [],
        cwd: outputDir,
        input,
        timeout: 3000,
      });

      unlink(outputFile, () => {});
      unlink(filePath, () => {});
      return resolve(result);
    });
  });
};

