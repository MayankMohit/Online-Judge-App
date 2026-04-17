import express from "express";
const router = express.Router();
 
import { getHint, getUnlockedTiers } from "../controllers/aiController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
 
// All AI routes require authentication
router.post("/hint", verifyToken, getHint);
router.get("/hint/unlocked/:problemId", verifyToken, getUnlockedTiers);
 
export default router;
 