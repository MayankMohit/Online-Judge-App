import { Problem } from "../models/problemModel.js";
import { User } from "../models/userModel.js";
import { getNextProblemNumber } from "../utils/getNextProblemNumber.js";

export const getAllProblems = async (req, res) => { 
    try {
        const problems = await Problem.find().select("-testCases").sort({ problemNumber: 1 });
        res.status(200).json({ success: true, problems });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch problems" });
    }
}

export const getProblemByNumber = async (req, res) => {
  try {
    const problem = await Problem.findOne({ problemNumber: req.params.number });
    if (!problem) {
      return res.status(404).json({ success: false, message: "Problem not found" });
    }

    const visibleTestCases = problem.testCases.filter(tc => !tc.isHidden);
    const problemToSend = { ...problem.toObject(), testCases: visibleTestCases };

    res.status(200).json({ success: true, problem: problemToSend });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch problem" });
  }
};

export const createProblem = async (req, res) => {
  const {
    title,
    statement,
    difficulty,
    tags,
    inputFormat,
    outputFormat,
    constraints,
    sampleInput,
    sampleOutput,
    testCases,
  } = req.body;

  try {
    const exists = await Problem.findOne({ title });
    if (exists) {
      return res.status(400).json({ success: false, message: "Problem with this title already exists" });
    }

    const problemNumber = await getNextProblemNumber();

    const problem = new Problem({
      problemNumber,
      title,
      statement,
      difficulty,
      tags,
      inputFormat,
      outputFormat,
      constraints,
      sampleInput,
      sampleOutput,
      testCases,
      createdBy: req.userId,
    });

    await problem.save();
    res.status(201).json({ success: true, problem });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to create problem" });
  }
};

export const updateProblem = async (req, res) => {
  try {
    const updated = await Problem.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Problem not found" });
    }

    res.status(200).json({ success: true, problem: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update problem" });
  }
};

export const deleteProblem = async (req, res) => {
  try {
    const deleted = await Problem.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Problem not found" });
    }

    res.status(200).json({ success: true, message: "Problem deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete problem" });
  }
};

export const addFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user.favoriteProblems.includes(req.params.id)) {
      user.favoriteProblems.push(req.params.id);
      await user.save();
    }

    res.status(200).json({ success: true, message: "Added to favorites" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to add favorite" });
  }
};

export const removeFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    user.favoriteProblems = user.favoriteProblems.filter(
      pid => pid.toString() !== req.params.id
    );
    await user.save();

    res.status(200).json({ success: true, message: "Removed from favorites" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to remove favorite" });
  }
};

export const searchProblems = async (req, res) => {
  try {
    const { tag, difficulty, query, sort, page = 1, limit = 20 } = req.query;

    const filter = {};

    // Fast search by problemNumber OR title
    if (query) {
      const numberQuery = Number(query);
      if (!isNaN(numberQuery)) {
        filter.problemNumber = numberQuery;
      } else {
        filter.title = { $regex: query, $options: "i" };
      }
    }

    // Filter by multiple tags using $in
    if (tag) {
      const tagArray = tag.split(",").map((t) => t.trim());
      filter.tags = { $in: tagArray };
    }

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    // Sorting logic
    let sortOption = { problemNumber: 1 }; 
    if (sort) {
      const [field, direction] = sort.split("_");
      sortOption = { [field]: direction === "desc" ? -1 : 1 };
    }

    // Pagination
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // Query DB
    const problems = await Problem.find(filter)
      .select("problemNumber title difficulty tags") // Only needed fields
      .lean() // Faster than full Mongoose docs
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({ success: true, problems });
  } catch (err) {
    console.error("Search failed:", err);
    res.status(500).json({ success: false, message: "Search failed" });
  }
};

export const getUniqueTags = async (req, res) => {
  try {
    const tags = await Problem.distinct("tags");
    res.status(200).json({ success: true, tags });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch tags" });
  }
};

export const getProblemsByAdmin = async (req, res) => {
  try {
    const adminId = req.params.adminId;

    const problems = await Problem.find({ createdBy: adminId })
      .select("problemNumber title difficulty tags createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, problems });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch problems by admin" });
  }
};
