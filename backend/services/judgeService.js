import axios from "axios";
import { Problem } from "../models/problemModel.js";
import { Submission } from "../models/submissionModel.js";
import { User } from "../models/userModel.js";
import { Contest } from "../models/contestModel.js";
import { ContestParticipation } from "../models/contestParticipationModel.js";
import { MockParticipation } from "../models/mockParticipationModel.js";

const BASE_URL = process.env.COMPILER_URL || "http://localhost:5001";

/**
 * Judges an already-persisted submission: compiles+runs it against the problem's
 * test cases, records the verdict, updates the user's solved stats, and applies
 * contest scoring. Shared by the synchronous path and the background worker so
 * both behave identically.
 *
 * Contest validation (window / participation) is intentionally NOT done here — it
 * must happen at request arrival time in the controller before enqueueing.
 *
 * @param {string} submissionId
 * @returns {Promise<{ verdict, averageTime, failedCase, contestUpdate }>}
 */
export const processSubmissionJudgement = async (submissionId) => {
  const submission = await Submission.findById(submissionId);
  if (!submission) throw new Error("Submission not found");

  const problem = await Problem.findById(submission.problem);
  if (!problem) throw new Error("Problem not found");

  const testCases = problem.testCases || [];

  // Compile once, run every test case in a single call to the compiler service.
  const { data: judge } = await axios.post(`${BASE_URL}/compiler/judge/`, {
    code: submission.code,
    language: submission.language,
    testCases: testCases.map((tc) => ({
      input: tc.input,
      expectedOutput: tc.expectedOutput,
    })),
    comparisonMode: problem.judgeConfig?.mode || "trimmed",
    limits: problem.limits || {},
  });

  const verdict = judge.verdict;
  let failedCase = null;

  if (verdict === "compilation_error") {
    failedCase = {
      input: testCases[0]?.input ?? "",
      expectedOutput: testCases[0]?.expectedOutput ?? "",
      actualOutput: judge.compile?.error || "Compilation failed.",
    };
  } else if (judge.failedCaseIndex != null) {
    const idx = judge.failedCaseIndex;
    const failedResult = judge.results[idx] || {};
    const tc = testCases[idx] || {};
    failedCase = {
      input: tc.input ?? "",
      expectedOutput: tc.expectedOutput ?? "",
      actualOutput:
        verdict === "wrong_answer"
          ? failedResult.output ?? ""
          : failedResult.error || "Runtime failed.",
    };
  }

  const averageTime = Number(judge.avgTimeMs || 0).toFixed(2);

  // Persist the verdict on the submission.
  submission.verdict = verdict;
  submission.averageTime = averageTime;
  submission.failedCase = verdict !== "accepted" ? failedCase : undefined;
  submission.status = "completed";

  // Update the user's aggregate stats.
  const user = await User.findById(submission.user);
  if (user) {
    user.submissions.push(submission._id);
    user.totalSubmissions++;

    const alreadySolved = user.solvedProblems.some(
      (p) =>
        p.problemId.toString() === submission.problem.toString() &&
        p.status === "accepted"
    );

    if (verdict === "accepted" && !alreadySolved) {
      user.solvedProblems.push({
        problemId: submission.problem,
        status: "accepted",
        submissionId: submission._id,
        solvedAt: new Date(),
      });
      user.totalProblemsSolved++;
    }
    await user.save();
  }

  // Contest scoring — mirror of the previous inline logic. Mock runs score into
  // MockParticipation, live runs into ContestParticipation; same shape either way.
  let contestUpdate = null;
  if (submission.contest) {
    const contest = await Contest.findById(submission.contest);
    const entry = contest?.problems.find(
      (p) => p.problem.toString() === submission.problem.toString()
    );
    const contestProblemPoints = entry?.points ?? 0;

    const participation = submission.mock
      ? await MockParticipation.findOne({
          contest: submission.contest,
          user: submission.user,
        })
      : await ContestParticipation.findOne({
          contest: submission.contest,
          user: submission.user,
        });

    if (participation) {
      let stats = participation.problemStats.find(
        (s) => s.problem.toString() === submission.problem.toString()
      );
      if (!stats) {
        participation.problemStats.push({ problem: submission.problem });
        stats = participation.problemStats[participation.problemStats.length - 1];
      }

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

  submission.contestResult = contestUpdate || undefined;
  await submission.save();

  return {
    verdict,
    averageTime,
    failedCase: verdict !== "accepted" ? failedCase : null,
    contestUpdate,
  };
};

/**
 * Marks a submission as errored (compiler unreachable, internal failure, …) so the
 * client stops polling and can surface a message.
 */
export const markSubmissionError = async (submissionId, message) => {
  await Submission.findByIdAndUpdate(submissionId, {
    status: "error",
    judgeError: message,
  });
};
