import { spawn } from "child_process";
import path from "path";
import os from "os";
import { mkdirSync, existsSync, unlink } from "fs";
import { runInSandbox } from "../utils/sandbox.js";
import { cleanCompilerError } from "../utils/cleanError.js";

const outputDir = path.join(path.resolve(), "temp", "outputs");

if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

export const executeCpp = async (filePath, input = "") => {
  const jobId = path.basename(filePath).split(".")[0];
  const isWindows = os.platform() === "win32";
  const outputFile = path.join(outputDir, isWindows ? `${jobId}.exe` : `${jobId}.out`);

  return new Promise((resolve) => {
    const startTime = Date.now();
    const compile = spawn("g++", [filePath, "-o", outputFile]);

    let compileError = "";

    compile.stderr.on("data", (data) => {
      compileError += data.toString();
    });

    compile.on("error", (err) => {
      return resolve({
        success: false,
        output: null,
        error: `Compilation spawn error: ${err.message}`,
        time: Date.now() - startTime,
      });
    });

    compile.on("close", async (code) => {
      if (code !== 0 || compileError.trim() !== "") {
        safeUnlink(outputFile);
        safeUnlink(filePath);
        return resolve({
          success: false,
          output: null,
          error: cleanCompilerError(compileError) || `Compilation failed (code ${code})`,
          time: Date.now() - startTime,
        });
      }

      try {
        const result = await runInSandbox({
          command: outputFile,
          args: [],
          cwd: outputDir,
          input,
          timeout: 3000,
        });

        safeUnlink(outputFile);
        safeUnlink(filePath);

        return resolve({
          ...result,
          time: result.time ?? Date.now() - startTime,
        });
      } catch (err) {
        safeUnlink(outputFile);
        safeUnlink(filePath);
        return resolve({
          success: false,
          output: null,
          error: cleanCompilerError(err?.message || "Runtime error"),
          time: Date.now() - startTime,
        });
      }
    });
  });
};

const safeUnlink = (file) => {
  if (!file) return;
  unlink(file, () => {});
};
