import express from "express";
import { runRoute, submitRoute } from "../controllers/runController.js";
const router = express.Router();

router.post("/run", runRoute);

router.post("/submit", submitRoute);

export default router;