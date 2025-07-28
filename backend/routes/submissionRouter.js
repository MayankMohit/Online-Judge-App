import express from "express";
const router = express.Router();

import {
  createSubmission,
  getUserSubmissions,
  getSubmissionById,
  getSubmissionsByProblem,
  getAllSubmissions,
  getUserSubmissionsForProblem,
  getUserSubmissionsForAdmin,
} from "../controllers/submissionController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { limiter } from "../middlewares/rateLimiter.js";

router.post("/", verifyToken, limiter, createSubmission);

router.get("/", verifyToken, isAdmin, getAllSubmissions);

router.get("/user", verifyToken, getUserSubmissions);

router.get("/:id", verifyToken, getSubmissionById);

router.get("/problem/:id", verifyToken, isAdmin, getSubmissionsByProblem);

router.get("/user/problem/:number", verifyToken, getUserSubmissionsForProblem);

router.get("/user/:userId", verifyToken, isAdmin, getUserSubmissionsForAdmin);

export default router;