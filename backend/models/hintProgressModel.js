import mongoose from "mongoose";

const hintProgressSchema = new mongoose.Schema({
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
  unlockedUpTo: {
    type: Number,
    default: 0,
    min: 0,
    max: 3,
  },
  hints: {
    1: { type: String, default: null },
    2: { type: String, default: null },
    3: { type: String, default: null },
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// One document per user-problem pair
hintProgressSchema.index({ user: 1, problem: 1 }, { unique: true });

export const HintProgress = mongoose.model("HintProgress", hintProgressSchema);