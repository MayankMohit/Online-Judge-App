import mongoose from "mongoose";

// A personal "virtual" run of a contest after it has ended. Mirrors
// ContestParticipation but carries a per-user window (startTime/endTime)
// instead of the contest's global window. One doc per (contest, user);
// resetting deletes it so a fresh run can be started.
const mockParticipationSchema = mongoose.Schema(
  {
    contest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contest",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    lastAcceptedAt: {
      type: Date,
      default: null,
    },
    totalAttempts: {
      type: Number,
      default: 0,
    },
    problemStats: [
      {
        problem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Problem",
          required: true,
        },
        solved: { type: Boolean, default: false },
        solvedAt: Date,
        pointsEarned: { type: Number, default: 0 },
        attempts: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

mockParticipationSchema.index({ contest: 1, user: 1 }, { unique: true });

export const MockParticipation = mongoose.model(
  "MockParticipation",
  mockParticipationSchema
);
