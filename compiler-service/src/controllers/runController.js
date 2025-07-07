import { executeCpp } from "../compilers/cpp.js";
import { executeC } from "../compilers/c.js";
import { executePython } from "../compilers/python.js";
import { executeNode } from "../compilers/node.js";
import { generateFile } from "../utils/generateFile.js";

export const runRoute = async (req, res) => {
  const { code, language, input = "" } = req.body;

  if (!code || !language) {
    return res.status(400).json({ success: false, message: "Code and language are required" });
  }

  try {
    const extensionMap = {
      cpp: "cpp",
      c: "c",
      py: "py",
      js: "js"
    };

    const extension = extensionMap[language];
    if (!extension) {
      return res.status(400).json({ success: false, message: "Unsupported language" });
    }

    const filePath = generateFile(extension, code);

    let output;
    switch (language) {
      case "cpp":
        output = await executeCpp(filePath, input);
        break;
      case "c":
        output = await executeC(filePath, input);
        break;
      case "py":
        output = await executePython(filePath, input);
        break;
      case "js":
        output = await executeNode(filePath, input);
        break;
    }

    return res.status(200).json({ success: true, output });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Execution failed",
      error: error.error || error.message || "Unknown error"
    });
  }
};

export const submitRoute = async (req, res) => {
  return res.status(200).json({ success: true, message: "Submit route will be implemented later." });
};
