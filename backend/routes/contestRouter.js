import express from "express";
const router = express.Router();

import {
  getContests,
  getContestById,
  createContest,
  updateContest,
  deleteContest,
  registerForContest,
  unregisterFromContest,
  getStandings,
  getMyParticipation,
  getMyContestHistory,
} from "../controllers/contestController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { optionalAuth } from "../middlewares/optionalAuth.js";
import { isAdmin } from "../middlewares/isAdmin.js";

// Public (guest-aware)
router.get("/", optionalAuth, getContests);
router.get("/history/me", verifyToken, getMyContestHistory); // before /:id
router.get("/:id", optionalAuth, getContestById);
router.get("/:id/standings", optionalAuth, getStandings);

// Auth required
router.post("/:id/register", verifyToken, registerForContest);
router.delete("/:id/register", verifyToken, unregisterFromContest);
router.get("/:id/my-participation", verifyToken, getMyParticipation);

// Admin only
router.post("/", verifyToken, isAdmin, createContest);
router.put("/:id", verifyToken, isAdmin, updateContest);
router.delete("/:id", verifyToken, isAdmin, deleteContest);

export default router;
