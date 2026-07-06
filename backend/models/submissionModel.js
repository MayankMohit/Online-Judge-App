import mongoose from "mongoose";

const submissionSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Problem",
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    enum: ["cpp", "c", "py", "js"],
  },
  verdict: {
    type: String,
    enum: [
      "accepted",
      "wrong_answer",
      "time_limit_exceeded",
      "memory_limit_exceeded",
      "runtime_error",
      "compilation_error",
    ],
    default: "wrong_answer",
  },
  averageTime: {
    type: String,
    default: "0ms",
  },
  // Lifecycle for background judging: queued -> judging -> completed/error.
  // Defaults to "completed" so synchronously-judged/legacy submissions are unaffected.
  status: {
    type: String,
    enum: ["queued", "judging", "completed", "error"],
    default: "completed",
  },
  // Details of the first failing test case (persisted so the status endpoint can
  // return them after async judging).
  failedCase: {
    input: String,
    expectedOutput: String,
    actualOutput: String,
  },
  // Snapshot of contest scoring produced by this submission (for the client toast).
  contestResult: {
    score: Number,
    solved: Boolean,
    pointsEarned: Number,
    awarded: Boolean,
  },
  // Internal error message when status === "error".
  judgeError: String,
  contest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Contest",
    default: null,
  },
  mock: {
    type: Boolean,
    default: false,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

submissionSchema.index({ contest: 1, user: 1, submittedAt: -1 });

export const Submission = mongoose.model("Submission", submissionSchema);