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

    let result;
    switch (language) {
      case "cpp":
        result = await executeCpp(filePath, input);
        break;
      case "c":
        result = await executeC(filePath, input);
        break;
      case "py":
        result = await executePython(filePath, input);
        break;
      case "js":
        result = await executeNode(filePath, input);
        break;
    }
    
    return res.status(200).json(result);

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.error || error.message || "Unknown error",
      output: null,
      time: null
    });
  }
};

