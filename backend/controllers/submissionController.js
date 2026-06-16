import axios from "axios";
import { Problem } from "../models/problemModel.js";
import { Submission } from "../models/submissionModel.js";
import { User } from "../models/userModel.js";
import { Contest } from "../models/contestModel.js";
import { ContestParticipation } from "../models/contestParticipationModel.js";
import { MockParticipation } from "../models/mockParticipationModel.js";
import { getContestStatus } from "../utils/contestHelpers.js";

const BASE_URL = process.env.COMPILER_URL || "http://localhost:5001";

export const createSubmission = async (req, res) => {
  const { problemId, code, language, contestId, mock } = req.body;

  if (!problemId || !code || !language) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  try {
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res
        .status(404)
        .json({ success: false, message: "Problem not found" });
    }

    // Contest validation — before judging, using arrival time
    let contestProblemPoints = null;
    let mockParticipation = null;
    if (contestId) {
      const receivedAt = new Date();
      const contest = await Contest.findById(contestId);
      if (!contest) {
        return res
          .status(404)
          .json({ success: false, message: "Contest not found" });
      }

      const entry = contest.problems.find(
        (p) => p.problem.toString() === problemId
      );
      if (!entry) {
        return res.status(400).json({
          success: false,
          message: "Problem is not part of this contest",
        });
      }

      if (mock) {
        // Mock (virtual) run — validate against the user's personal window
        if (getContestStatus(contest) !== "ended") {
          return res.status(403).json({
            success: false,
            message: "Mock contests are available only after the contest ends",
          });
        }
        mockParticipation = await MockParticipation.findOne({
          contest: contest._id,
          user: req.userId,
        });
        if (!mockParticipation) {
          return res.status(403).json({
            success: false,
            message: "Start a mock contest first",
          });
        }
        if (
          receivedAt < mockParticipation.startTime ||
          receivedAt > mockParticipation.endTime
        ) {
          return res.status(403).json({
            success: false,
            message: "Your mock window has closed",
          });
        }
      } else {
        // Live contest — validate against the contest's global window
        if (receivedAt < contest.startTime) {
          return res
            .status(403)
            .json({ success: false, message: "Contest has not started yet" });
        }
        if (receivedAt > contest.endTime) {
          return res
            .status(403)
            .json({ success: false, message: "Contest has ended" });
        }
        const isParticipant = await ContestParticipation.exists({
          contest: contest._id,
          user: req.userId,
        });
        if (!isParticipant) {
          return res.status(403).json({
            success: false,
            message: "You are not registered for this contest",
          });
        }
      }

      contestProblemPoints = entry.points;
    }

    const testCases = problem.testCases || [];
    let verdict = "accepted";
    let failedCase = null;
    let totalTime = 0;
    let testCaseCount = 0;

    for (const testCase of testCases) {
      const { data } = await axios.post(`${BASE_URL}/compiler/run/`, {
        code,
        language,
        input: testCase.input,
      });

      const { success, output, error, time } = data;

      // Fix: handle numeric or string time
      const timeMs =
        typeof time === "string"
          ? parseInt(time.replace("ms", ""), 10)
          : Number(time || 0);

      totalTime += timeMs;
      testCaseCount++;

      if (!success) {
        const lowerError = (error || "").toLowerCase();

        if (lowerError.includes("time limit")) {
          verdict = "time_limit_exceeded";
        } else if (
          (language === "cpp" || language === "c") &&
          (lowerError.includes("error:") || lowerError.includes("expected"))
        ) {
          verdict = "compilation_error";
        } else if (
          (language === "py" || language === "js") &&
          lowerError.includes("syntax")
        ) {
          verdict = "compilation_error";
        } else {
          verdict = "runtime_error";
        }

        failedCase = {
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: error || "Compilation/Runtime failed.",
        };
        break;
      }

      const cleanOutput = (output ?? "").trim();
      const expectedOutput = testCase.expectedOutput.trim();

      if (cleanOutput !== expectedOutput) {
        verdict = "wrong_answer";
        failedCase = {
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: cleanOutput,
        };
        break;
      }
    }

    const averageTime =
      testCaseCount > 0 ? (totalTime / testCaseCount).toFixed(2) : 0;

    const submission = new Submission({
      user: req.userId,
      problem: problemId,
      code,
      language,
      verdict,
      averageTime,
      contest: contestId || null,
      mock: !!mock,
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
        solvedAt: new Date(),
      });
      user.totalProblemsSolved++;
    }

    await user.save();

    // Contest scoring — incremental update on the participation doc.
    // Mock runs score into MockParticipation; live runs into ContestParticipation.
    // Both share the same problemStats/score shape, so the update logic is identical.
    let contestUpdate = null;
    if (contestId) {
      const participation = mock
        ? mockParticipation
        : await ContestParticipation.findOne({
            contest: contestId,
            user: req.userId,
          });

      if (participation) {
        let stats = participation.problemStats.find(
          (s) => s.problem.toString() === problemId
        );
        if (!stats) {
          participation.problemStats.push({ problem: problemId });
          stats = participation.problemStats[participation.problemStats.length - 1];
        }

        // awarded = points were earned on THIS submission (first solve only),
        // so the client knows when to show the "+X points" toast.
        let awarded = false;
        if (!stats.solved) {
          if (verdict === "accepted") {
            stats.solved = true;
            stats.solvedAt = submission.submittedAt;
            stats.pointsEarned = contestProblemPoints;
            participation.score += contestProblemPoints;
            participation.lastAcceptedAt = submission.submittedAt;
            awarded = true;
          } else {
            stats.attempts += 1;
            participation.totalAttempts += 1;
          }
          await participation.save();
        }

        contestUpdate = {
          score: participation.score,
          solved: stats.solved,
          pointsEarned: stats.pointsEarned,
          awarded,
        };
      }
    }

    return res.status(201).json({
      success: true,
      submissionId: submission._id,
      message: "Submission created successfully",
      verdict,
      averageTime,
      failedCase: verdict !== "accepted" ? failedCase : null,
      contestUpdate,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to submit",
      error: error.response?.data?.error || error.message || "Unknown error",
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
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch submissions" });
  }
};

export const getSubmissionById = async (req, res) => {
  try {
    const submissionId = req.params.id;

    const submission = await Submission.findById(submissionId)
      .populate("problem", "problemNumber title statement difficulty tags")
      .populate("user", "name email");

    if (!submission) {
      return res
        .status(404)
        .json({ success: false, message: "Submission not found" });
    }
    const user = await User.findById(req.userId);
    if (
      submission.user._id.toString() !== req.userId &&
      user.role !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.status(200).json({ success: true, submission });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch submission" });
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
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch submissions" });
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
      Submission.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      submissions,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error("Admin fetch all submissions failed:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch all submissions" });
  }
};

export const getUserSubmissionsForProblem = async (req, res) => {
  try {
    const userId = req.userId;
    const problemNumber = req.params.number;

    const problem = await Problem.findOne({ problemNumber });

    if (!problem) {
      return res
        .status(404)
        .json({ success: false, message: "Problem not found." });
    }

    const filter = { user: userId, problem: problem._id };
    if (req.query.contestId) filter.contest = req.query.contestId;

    const submissions = await Submission.find(filter).sort({ submittedAt: -1 });

    res.status(200).json({ success: true, submissions });
  } catch (error) {
    console.error("Error fetching user submissions for problem:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch submissions." });
  }
};

export const getUserSubmissionsForAdmin = async (req, res) => {
  const { userId } = req.params;
  try {
    const submissions = await Submission.find({ user: userId })
      .populate("problem", "title") // populate problem title
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (err) {
    console.error("Failed to fetch user submissions:", err);
    res.status(500).json({ message: "Server error" });
  }
};