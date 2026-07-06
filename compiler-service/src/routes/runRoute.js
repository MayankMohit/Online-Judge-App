import express from "express";
import { runRoute, judgeRoute } from "../controllers/judgeController.js";

const router = express.Router();

router.post("/run", runRoute);
router.post("/judge", judgeRoute);

export default router;
