import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import {
    getFavoriteProblems,
    getUserDashboard,
    getAllUsers,
    getFilteredUsers,
    getLeaderboard,
    getCurrentUser,
    updateUserProfile,
    deleteUserAccount
} from "../controllers/userController.js";

const router = express.Router();

router.get("/", verifyToken, isAdmin, getAllUsers);

router.get("/search", verifyToken, isAdmin, getFilteredUsers);

router.get("/me", verifyToken, getCurrentUser);

router.get("/favorites", verifyToken, getFavoriteProblems);

router.get("/dashboard", verifyToken, getUserDashboard);

router.get("/leaderboard", verifyToken, getLeaderboard);

router.put("/profile", verifyToken, updateUserProfile);

router.delete("/delete", verifyToken, deleteUserAccount);

export default router;