import path from "path";
import { unlink } from "fs";
import { runInSandbox } from "../utils/sandbox.js";

export const executeNode = async (filePath, input = "") => {
  try {
    const result = await runInSandbox({
      command: "node",
      args: [filePath],
      input,
      timeout: 3000,
    });

    unlink(filePath, () => {});
    return {
      success: true,
      output: result.output,
      error: null,
      time: result.time
    };
  } catch (err) {
    unlink(filePath, () => {});
    return {
      success: false,
      output: null,
      error: err.error || "Runtime error",
      time: null
    };
  }
};
