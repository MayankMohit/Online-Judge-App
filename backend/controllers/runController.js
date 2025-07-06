import { Problem } from "../models/problemModel.js";
import { User } from "../models/userModel.js";
import { Submission } from "../models/submissionModel.js";

export const runCodeMock = async (req, res) => {
  const { code, language, input } = req.body;

  if (!code || !language) {
    return res.status(400).json({ success: false, message: "Code and language are required" });
  }

  // Simulate code execution delay
  setTimeout(() => {
    return res.status(200).json({
      success: true,
      output: `Simulated output for ${language} code.`,
      error: null,
      time: "23ms"
    });
  }, 100);
};
