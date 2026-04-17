import { Problem } from "../models/problemModel.js";
import { HintProgress } from "../models/hintProgressModel.js";
import { generateHint } from "../services/generateHint.js";

export const getHint = async (req, res) => {
  try {
    const { problemId, tier } = req.body;
    const userId = req.userId;
 
    if (!problemId || !tier) {
      return res.status(400).json({
        success: false,
        message: "problemId and tier are required",
      });
    }
 
    const tierNum = parseInt(tier, 10);
    if (![1, 2, 3].includes(tierNum)) {
      return res.status(400).json({
        success: false,
        message: "Tier must be 1, 2, or 3",
      });
    }
 
    let progress = await HintProgress.findOne({ user: userId, problem: problemId });
 
    if (!progress) {
      progress = new HintProgress({ user: userId, problem: problemId });
    }
 
    if (tierNum > progress.unlockedUpTo + 1) {
      return res.status(403).json({
        success: false,
        message: `You must unlock Tier ${tierNum - 1} before accessing Tier ${tierNum}`,
        unlockedUpTo: progress.unlockedUpTo,
      });
    }
 
    if (progress.hints[tierNum]) {
      return res.status(200).json({
        success: true,
        tier: tierNum,
        hint: progress.hints[tierNum],
        unlockedUpTo: progress.unlockedUpTo,
        fromCache: true,
      });
    }
 
    const problem = await Problem.findById(problemId).select(
      "title statement difficulty tags constraints inputFormat outputFormat sampleInput sampleOutput"
    );
 
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }
 
    const { hint } = await generateHint(problem, tierNum);
 
    progress.hints[tierNum] = hint;
    progress.unlockedUpTo = Math.max(progress.unlockedUpTo, tierNum);
    progress.updatedAt = Date.now();
    await progress.save();
 
    return res.status(200).json({
      success: true,
      tier: tierNum,
      hint,
      unlockedUpTo: progress.unlockedUpTo,
      fromCache: false,
    });
  } catch (err) {
    console.error("Hint generation failed:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to generate hint",
      error: err.message,
    });
  }
};
 
export const getUnlockedTiers = async (req, res) => {
  try {
    const { problemId } = req.params;
    const userId = req.userId;
 
    const progress = await HintProgress.findOne({ user: userId, problem: problemId });
 
    if (!progress) {
      return res.status(200).json({
        success: true,
        unlockedUpTo: 0,
        hints: {},
      });
    }

    const hints = {};
    for (let t = 1; t <= progress.unlockedUpTo; t++) {
      if (progress.hints[t]) hints[t] = progress.hints[t];
    }
 
    return res.status(200).json({
      success: true,
      unlockedUpTo: progress.unlockedUpTo,
      hints,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch unlocked tiers",
    });
  }
};