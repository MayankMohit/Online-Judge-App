import express from "express";
const router = express.Router();

import { runCodeMock } from "../controllers/runController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { limiter } from "../middlewares/rateLimiter.js";

router.post("/", verifyToken, limiter, runCodeMock);

export default router;