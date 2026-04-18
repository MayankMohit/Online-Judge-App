import mongoose from "mongoose";

const problemExplanationSchema = new mongoose.Schema({
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Problem",
    required: true,
    unique: true,
  },
  // explanations stored as a map: { "english": "...", "hindi": "...", etc. }
  explanations: {
    type: Map,
    of: String,
    default: {},
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export const ProblemExplanation = mongoose.model("ProblemExplanation", problemExplanationSchema);