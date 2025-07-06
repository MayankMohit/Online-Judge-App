import express from "express";
const router = express.Router();

import {
  createSubmission,
  getUserSubmissions,
  getSubmissionById,
  getSubmissionsByProblem,
} from "../controllers/submissionController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { isAdmin } from "../middlewares/isAdmin.js";

router.post("/", verifyToken, createSubmission);

router.get("/user", verifyToken, getUserSubmissions);

router.get("/:id", verifyToken, getSubmissionById);

router.get("/problem/:id", verifyToken, isAdmin, getSubmissionsByProblem);

export default router;