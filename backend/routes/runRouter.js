import express from "express";
const router = express.Router();

import { runCode } from "../controllers/runController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { judgeLimiter } from "../middlewares/rateLimiter.js";

router.post("/", verifyToken, judgeLimiter, runCode);

export default router;