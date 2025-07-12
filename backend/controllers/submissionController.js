import axios from "axios";
import { Problem } from "../models/problemModel.js";
import { Submission } from "../models/submissionModel.js";
import { User } from "../models/userModel.js";

const BASE_URL = process.env.COMPILER_URL || "http://localhost:5001";

export const createSubmission = async (req, res) => {
  const { problemId, code, language } = req.body;

  if (!problemId || !code || !language) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  try {
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ success: false, message: "Problem not found" });
    }

    const testCases = problem.testCases;
    let verdict = "accepted";
    let failedCase = null;
    let totalTime = 0;
    let testCaseCount = 0;

    for (const testCase of testCases) {
      const { data } = await axios.post(`${BASE_URL}/api/run/`, {
        code,
        language,
        input: testCase.input
      });

      const { success, output, error, time } = data;

      const timeMs = parseInt(time?.replace("ms", "") || "0", 10);
      totalTime += timeMs;
      testCaseCount++;

      if (!success) {
        if (error === "time_limit_exceeded") {
          verdict = "time_limit_exceeded";
        } else {
          verdict = "compilation_error";
        }
        failedCase = testCase;
        break;
      }

      const cleanOutput = (output ?? "").trim();
      const expectedOutput = testCase.expectedOutput.trim();

      if (cleanOutput !== expectedOutput) {
        verdict = "wrong_answer";
        failedCase = testCase;
        break;
      }
    }

    const averageTime = testCaseCount > 0 ? `${(totalTime / testCaseCount).toFixed(2)}ms` : "0ms";

    const submission = new Submission({
      user: req.userId,
      problem: problemId,
      code,
      language,
      verdict,
      averageTime
    });

    await submission.save();

    const user = await User.findById(req.userId);
    user.submissions.push(submission._id);
    user.totalSubmissions++;

    const alreadySolved = user.solvedProblems.some(
      (p) => p.problemId.toString() === problemId && p.status === "accepted"
    );

    if (verdict === "accepted" && !alreadySolved) {
      user.solvedProblems.push({
        problemId,
        status: "accepted",
        submissionId: submission._id,
        solvedAt: new Date()
      });
      user.totalProblemsSolved++;
    }

    await user.save();

    return res.status(201).json({
      success: true,
      message: "Submission created successfully",
      verdict,
      averageTime,
      failedCase: verdict !== "accepted" ? failedCase : null
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to submit",
      error: error.response?.data?.error || error.message || "Unknown error"
    });
  }
};

export const getUserSubmissions = async (req, res) => {
  try {
    const userId = req.userId;

    const submissions = await Submission.find({ user: userId })
      .populate("problem", "problemNumber title difficulty")
      .sort({ submittedAt: -1 });

    res.status(200).json({ success: true, submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch submissions" });
  }
};

export const getSubmissionById = async (req, res) => {
  try {
    const submissionId = req.params.id;

    const submission = await Submission.findById(submissionId)
      .populate("problem", "problemNumber title")
      .populate("user", "name email");

    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }

    if (submission.user._id.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.status(200).json({ success: true, submission });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch submission" });
  }
};

export const getSubmissionsByProblem = async (req, res) => {
  try {
    const problemId = req.params.id;

    const submissions = await Submission.find({ problem: problemId })
      .populate("user", "name email")
      .sort({ submittedAt: -1 });

    res.status(200).json({ success: true, submissions });
  } catch (error) {
    console.error("Fetch submissions by problem failed:", error);
    res.status(500).json({ success: false, message: "Failed to fetch submissions" });
  }
};

export const getAllSubmissions = async (req, res) => {
  try {
    const { userId, problemId, verdict, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (userId) filter.user = userId;
    if (problemId) filter.problem = problemId;
    if (verdict) filter.verdict = verdict;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [submissions, total] = await Promise.all([
      Submission.find(filter)
        .populate("user", "name email")
        .populate("problem", "problemNumber title")
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Submission.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      submissions,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    console.error("Admin fetch all submissions failed:", err);
    res.status(500).json({ success: false, message: "Failed to fetch all submissions" });
  }
};
