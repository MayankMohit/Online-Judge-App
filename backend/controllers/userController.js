import { User } from "../models/userModel.js";
import { Problem } from "../models/problemModel.js";
import { Submission } from "../models/submissionModel.js";
import bcrypt from "bcrypt";

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      "name email role isVerified totalProblemsSolved favoriteProblems"
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch user" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select(
      "name email role totalProblemsSolved totalSubmissions createdAt"
    );
    res.status(200).json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};
 
export const getFilteredUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (role) filter.role = role;

    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [{ name: { $regex: regex } }, { email: { $regex: regex } }];
    }

    const sortOption = { totalProblemsSolved: -1 };
    const skip = (Number(page) - 1) * Number(limit);

    const users = await User.find(filter)
      .select("name email role totalProblemsSolved createdAt")
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    const totalUsers = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      users,
      total: totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: Number(page),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

export const getFavoriteProblems = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("favoriteProblems");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

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
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const difficultySets = {
      Easy: new Set(),
      Medium: new Set(),
      Hard: new Set(),
    };

    user.submissions.forEach((submission) => {
      if (submission.verdict === "accepted" && submission.problem?.difficulty) {
        difficultySets[submission.problem.difficulty].add(
          submission.problem._id.toString()
        );
      }
    });

    const difficultyStats = {
      Easy: difficultySets.Easy.size,
      Medium: difficultySets.Medium.size,
      Hard: difficultySets.Hard.size,
    };

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
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch dashboard" });
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
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch leaderboard" });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { name, password, oldPassword } = req.body;
    const user = await User.findById(req.userId);
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Old password is incorrect" });
    }

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
    res
      .status(500)
      .json({ success: false, message: "Failed to update profile" });
  }
};

export const deleteUserAccount = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.userId);

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Account deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to delete account" });
  }
};

export const getUserDashboardForAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .populate({
        path: "submissions",
        populate: {
          path: "problem",
          select: "title difficulty problemNumber",
        },
      })
      .select(
        "name email role createdAt lastLogin totalProblemsSolved submissions"
      );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const difficultySets = {
      Easy: new Set(),
      Medium: new Set(),
      Hard: new Set(),
    };

    const solvedProblemsMap = new Map();

    user.submissions.forEach((submission) => {
      const problem = submission.problem;
      if (
        submission.verdict === "accepted" &&
        problem &&
        problem.difficulty
      ) {
        difficultySets[problem.difficulty].add(problem._id.toString());
        solvedProblemsMap.set(problem._id.toString(), problem); 
      }
    });

    const difficultyStats = {
      Easy: difficultySets.Easy.size,
      Medium: difficultySets.Medium.size,
      Hard: difficultySets.Hard.size,
    };

    const recentSubmissions = [...user.submissions]
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
      .slice(0, 10);

    const solvedProblemsList = Array.from(solvedProblemsMap.values());

    res.status(200).json({
      success: true,
      userData: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        totalProblemsSolved: user.totalProblemsSolved,
        difficultyStats,
      },
      submissionsList: recentSubmissions,
      problemsList: solvedProblemsList,
    });
  } catch (err) {
    console.error("Error in getUserDashboardForAdmin:", err);
    res.status(500).json({ success: false, message: "Failed to fetch user dashboard" });
  }
};

export const toggleUserRole = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = user.role === "admin" ? "user" : "admin";
    await user.save();

    res.status(200).json({ role: user.role, message: "Role updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};