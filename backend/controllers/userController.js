import { User } from "../models/userModel.js";
import { Problem } from "../models/problemModel.js";
import { Submission } from "../models/submissionModel.js";
import bcrypt from "bcrypt";

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("name email role isVerified totalProblemsSolved favoriteProblems");
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch user" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("name email role totalProblemsSolved totalSubmissions createdAt");
    res.status(200).json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

export const getFilteredUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    const filter = {};

    if (role) filter.role = role;

    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { name: { $regex: regex } },
        { email: { $regex: regex } },
      ];
    }

    const users = await User.find(filter).select(
      "name email role totalProblemsSolved totalSubmissions createdAt"
    );

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

export const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find()
      .select("name totalProblemsSolved totalSubmissions")
      .sort({ totalProblemsSolved: -1 }) 
      .limit(20); 

    res.status(200).json({ success: true, users });
  } catch (err) {
    console.error("Leaderboard error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch leaderboard" });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { name, password } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (password) updates.password = await bcrypt.hash(password, 10);

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({ success: true, user: updatedUser });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
};

export const deleteUserAccount = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.userId);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Account deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete account" });
  }
};