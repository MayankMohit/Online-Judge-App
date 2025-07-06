import express from "express";
const router = express.Router();

import {
  getAllProblems,
  getProblemByNumber,
  createProblem,
  updateProblem,
  deleteProblem,
  addFavorite,
  removeFavorite,
  searchProblems,
  getUniqueTags,
} from "../controllers/problemController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { isProblemCreator } from "../middlewares/isProblemCreator.js";

router.get("/", getAllProblems);

router.get("/number/:number", getProblemByNumber);

router.post("/", verifyToken, isAdmin, createProblem);

router.put("/:id", verifyToken, isAdmin, isProblemCreator, updateProblem);

router.delete("/:id", verifyToken, isAdmin, isProblemCreator, deleteProblem); 

router.post("/:id/favorite", verifyToken, addFavorite);

router.delete("/:id/favorite", verifyToken, removeFavorite);

router.get("/search", searchProblems);

router.get("/tags", getUniqueTags);

export default router;