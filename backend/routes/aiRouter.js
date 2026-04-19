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

router.post("/hint", verifyToken, getHint);
router.get("/hint/unlocked/:problemId", verifyToken, getUnlockedTiers);
router.post("/feedback", verifyToken, getCodeFeedback);
router.post("/explain", verifyToken, getExplanation);
router.post("/autocomplete", verifyToken, isAdmin, getAutocomplete);  // admin only

export default router;