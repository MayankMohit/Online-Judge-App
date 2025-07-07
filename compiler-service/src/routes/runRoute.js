import express from "express";
import { runRoute } from "../controllers/runController.js";
const router = express.Router();

router.post("/run", runRoute);

export default router;