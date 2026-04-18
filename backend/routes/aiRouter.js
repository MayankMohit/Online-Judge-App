import express from "express";
const router = express.Router();

import { getHint, getUnlockedTiers, getCodeFeedback } from "../controllers/aiController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

// All AI routes require authentication
router.post("/hint", verifyToken, getHint);
router.get("/hint/unlocked/:problemId", verifyToken, getUnlockedTiers);
router.post("/feedback", verifyToken, getCodeFeedback);

export default router;