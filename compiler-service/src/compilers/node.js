import { spawn } from "child_process";
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
    return result;
  } catch (err) {
    unlink(filePath, () => {});
    throw err;
  }
};
