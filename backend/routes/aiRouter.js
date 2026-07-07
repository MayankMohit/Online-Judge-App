import express from "express";
const router = express.Router();

import {
  getHint,
  getUnlockedTiers,
  getCodeFeedback,
  getExplanation,
  getAutocomplete,
} from "../controllers/aiController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { aiLimiter } from "../middlewares/rateLimiter.js";

router.post("/hint", verifyToken, aiLimiter, getHint);
router.get("/hint/unlocked/:problemId", verifyToken, getUnlockedTiers);
router.post("/feedback", verifyToken, aiLimiter, getCodeFeedback);
router.post("/explain", verifyToken, aiLimiter, getExplanation);
router.post("/autocomplete", verifyToken, isAdmin, getAutocomplete);  // admin only (has own cooldown)

export default router;