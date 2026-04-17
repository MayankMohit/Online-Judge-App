import { Problem } from "../models/problemModel.js";
import { generateHint } from "../services/generateHint.js";

const unlockedTiers = new Map();

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

    const sessionKey = `${userId}-${problemId}`;
    const currentMaxTier = unlockedTiers.get(sessionKey) || 0;

    if (tierNum > currentMaxTier + 1) {
      return res.status(403).json({
        success: false,
        message: `You must unlock Tier ${tierNum - 1} before accessing Tier ${tierNum}`,
        unlockedUpTo: currentMaxTier,
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

    // --- Generate hint via Gemini ---
    const { hint, cached } = await generateHint(problem, tierNum);

    // --- Update unlocked tier for this user-problem session ---
    if (tierNum > currentMaxTier) {
      unlockedTiers.set(sessionKey, tierNum);
    }

    return res.status(200).json({
      success: true,
      tier: tierNum,
      hint,
      cached,
      unlockedUpTo: Math.max(tierNum, currentMaxTier),
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

    const sessionKey = `${userId}-${problemId}`;
    const unlockedUpTo = unlockedTiers.get(sessionKey) || 0;

    return res.status(200).json({
      success: true,
      unlockedUpTo,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch unlocked tiers",
    });
  }
};