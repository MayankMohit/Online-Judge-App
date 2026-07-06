import { Problem } from "../models/problemModel.js";
import { Submission } from "../models/submissionModel.js";
import { User } from "../models/userModel.js";
import { Contest } from "../models/contestModel.js";
import { ContestParticipation } from "../models/contestParticipationModel.js";
import { MockParticipation } from "../models/mockParticipationModel.js";
import { getContestStatus } from "../utils/contestHelpers.js";
import { isQueueEnabled, enqueueJudge } from "../queues/judgeQueue.js";
import { processSubmissionJudgement } from "../services/judgeService.js";

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

    // Contest validation — MUST run at arrival time (before enqueueing), so that
    // async judging can't let a submission slip past a closed window.
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
        const mockParticipation = await MockParticipation.findOne({
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
    }

    // Persist the submission immediately (arrival time = submittedAt) so contest
    // ordering is preserved regardless of when judging actually completes.
    const submission = new Submission({
      user: req.userId,
      problem: problemId,
      code,
      language,
      contest: contestId || null,
      mock: !!mock,
      status: "queued",
    });
    await submission.save();

    // Background path: enqueue and return immediately; the client polls for status.
    // If Redis is unreachable, enqueue fails fast (commandTimeout) and we fall
    // through to synchronous judging so submissions still work.
    if (isQueueEnabled) {
      try {
        await enqueueJudge(submission._id.toString());
        return res.status(202).json({
          success: true,
          submissionId: submission._id,
          status: "judging",
          message: "Submission queued for judging",
        });
      } catch (err) {
        console.error(
          "Judge enqueue failed (Redis unreachable?) — judging synchronously:",
          err.message
        );
      }
    }

    // Synchronous path: no Redis configured, or enqueue failed. Judge inline.
    const result = await processSubmissionJudgement(submission._id);
    return res.status(201).json({
      success: true,
      submissionId: submission._id,
      status: "completed",
      message: "Submission created successfully",
      ...result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to submit",
      error: error.response?.data?.error || error.message || "Unknown error",
    });
  }
};

/**
 * GET /api/submissions/:id/status — polled by the client while a submission is
 * being judged in the background. Returns the verdict + details once completed.
 */
export const getSubmissionStatus = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id).select(
      "user status verdict averageTime failedCase contestResult judgeError"
    );
    if (!submission) {
      return res
        .status(404)
        .json({ success: false, message: "Submission not found" });
    }
    if (submission.user.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const done = submission.status === "completed";
    return res.status(200).json({
      success: true,
      status: submission.status,
      verdict: done ? submission.verdict : null,
      averageTime: done ? submission.averageTime : null,
      failedCase:
        done && submission.verdict !== "accepted"
          ? submission.failedCase || null
          : null,
      contestUpdate: done ? submission.contestResult || null : null,
      error:
        submission.status === "error"
          ? submission.judgeError || "Judging failed"
          : null,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch submission status" });
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