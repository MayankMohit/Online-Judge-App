import { Problem } from "../models/problemModel.js";

export const isProblemCreator = async (req, res, next) => {
  const problemId = req.params.id;
  const userId = req.userId;

  try {
    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ success: false, message: "Problem not found" });

    if (problem.createdBy.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Only the creator can perform this action" });
    }

    next();
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
