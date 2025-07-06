import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { getFavoriteProblems, getUserDashboard, getAllUsers } from "../controllers/userController.js";

const router = express.Router();

router.get("/", verifyToken, isAdmin, getAllUsers);

router.get("/favorites", verifyToken, getFavoriteProblems);

router.get("/dashboard", verifyToken, getUserDashboard);

export default router;