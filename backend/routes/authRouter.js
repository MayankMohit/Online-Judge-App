import express from "express";
const router = express.Router();
import { signup, login, logout, verifyEmail, forgotPassword, resetPassword, checkAuth } from "../controllers/authController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { authLimiter } from "../middlewares/rateLimiter.js";


router.get("/check-auth", verifyToken, checkAuth);

router.post("/signup", authLimiter, signup);

router.post("/login", authLimiter, login);

router.post("/logout", logout);

router.post("/verify-email", authLimiter, verifyEmail);

router.post("/forgot-password", authLimiter, forgotPassword);

router.post("/reset-password/:token", authLimiter, resetPassword);


export default router;