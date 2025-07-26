import fs from "fs";
import { runInSandbox } from "../utils/sandbox.js";
import { cleanCompilerError } from "../utils/cleanError.js";

export const executeNode = async (filePath, input = "") => {
  try {
    const result = await runInSandbox({
      command: "node",
      args: [filePath],
      input,
      timeout: 3000,
    });

    await fs.promises.unlink(filePath).catch(() => {});
    return result;
  } catch (err) {
    await fs.promises.unlink(filePath).catch(() => {});
    return {
      success: false,
      output: null,
      error: cleanCompilerError(err.error || "Runtime error"),
      time: null,
    };
  }
};
