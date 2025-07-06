import { User } from "../models/userModel.js";
import { Problem } from "../models/problemModel.js";
import { Submission } from "../models/submissionModel.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("name email role totalProblemsSolved totalSubmissions createdAt");
    res.status(200).json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

export const getFavoriteProblems = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("favoriteProblems");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, favorites: user.favoriteProblems });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getUserDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate({
        path: "submissions",
        populate: { path: "problem", select: "title difficulty problemNumber" },
      })
      .select("name email lastLogin totalProblemsSolved submissions");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Difficulty-wise breakdown
    const difficultyStats = { Easy: 0, Medium: 0, Hard: 0 };
    user.submissions.forEach((submission) => {
      if (
        submission.verdict === "accepted" &&
        submission.problem?.difficulty
      ) {
        difficultyStats[submission.problem.difficulty]++;
      }
    });

    res.status(200).json({
      success: true,
      name: user.name,
      email: user.email,
      lastLogin: user.lastLogin,
      totalProblemsSolved: user.totalProblemsSolved,
      submissions: user.submissions,
      difficultyStats,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch dashboard" });
  }
};
