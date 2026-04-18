import express from "express";
const router = express.Router();

import { getHint, getUnlockedTiers, getCodeFeedback, getExplanation } from "../controllers/aiController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

router.post("/hint", verifyToken, getHint);
router.get("/hint/unlocked/:problemId", verifyToken, getUnlockedTiers);
router.post("/feedback", verifyToken, getCodeFeedback);
router.post("/explain", verifyToken, getExplanation);

export default router;