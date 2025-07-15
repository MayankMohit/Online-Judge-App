import express from "express";
const router = express.Router();
import { saveCode, getSavedCode } from '../controllers/codeController.js';
import { verifyToken } from "../middlewares/verifyToken.js";

router.post("/save", verifyToken, saveCode);

router.get("/:id/:language", verifyToken, getSavedCode);

export default router;