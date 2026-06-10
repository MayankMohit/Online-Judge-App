import mongoose from "mongoose";

const contestParticipationSchema = mongoose.Schema(
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
    registeredAt: {
      type: Date,
      default: Date.now,
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

contestParticipationSchema.index({ contest: 1, user: 1 }, { unique: true });
contestParticipationSchema.index({
  contest: 1,
  score: -1,
  lastAcceptedAt: 1,
  totalAttempts: 1,
});

export const ContestParticipation = mongoose.model(
  "ContestParticipation",
  contestParticipationSchema
);
