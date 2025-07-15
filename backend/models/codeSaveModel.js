import mongoose from "mongoose";

const codeSaveSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  language: { type: String, required: true },
  code: { type: String, required: true },
}, { timestamps: true });

codeSaveSchema.index({ user: 1, problem: 1, language: 1 }, { unique: true });

export const CodeSave = mongoose.model("CodeSave", codeSaveSchema);