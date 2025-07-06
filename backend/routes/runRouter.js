import express from "express";
const router = express.Router();

import { runCodeMock } from "../controllers/runController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

router.post("/", verifyToken, runCodeMock);

export default router;