import { Problem } from "../models/problemModel.js";
import { User } from "../models/userModel.js";
import { Contest } from "../models/contestModel.js";
import { ContestParticipation } from "../models/contestParticipationModel.js";
import { getNextProblemNumber } from "../utils/getNextProblemNumber.js";
import {
  getContestStatus,
  maybeReleaseContestProblems,
} from "../utils/contestHelpers.js";
import { escapeRegex } from "../utils/escapeRegex.js";
import { validateReferenceSolution } from "../services/validationService.js";
import {
  getCachedList,
  setCachedList,
  invalidateProblemCaches,
} from "../utils/caches.js";

const ALL_PROBLEMS_KEY = "all-problems";
const UNIQUE_TAGS_KEY = "unique-tags";

export const getAllProblems = async (req, res) => {
  try {
    const cached = getCachedList(ALL_PROBLEMS_KEY);
    if (cached) {
      return res.status(200).json({ success: true, problems: cached });
    }
    const problems = await Problem.find({ isPublic: { $ne: false } })
      .select("-testCases -referenceSolution")
      .sort({ problemNumber: 1 })
      .lean();
    setCachedList(ALL_PROBLEMS_KEY, problems);
    res.status(200).json({ success: true, problems });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch problems" });
  }
};

export const getProblemByNumber = async (req, res) => {
  try {
    const problem = await Problem.findOne({ problemNumber: req.params.number });
    if (!problem) {
      return res
        .status(404)
        .json({ success: false, message: "Problem not found" });
    }

    let contestMeta = null;

    // Unreleased contest problem — gate access
    if (problem.contest && problem.isPublic === false) {
      const contest = await Contest.findById(problem.contest).populate(
        "problems.problem",
        "problemNumber title"
      );
      if (contest) {
        const status = getContestStatus(contest);

        if (status === "ended") {
          await maybeReleaseContestProblems(contest);
        } else {
          const user = req.userId
            ? await User.findById(req.userId).select("role")
            : null;
          const isAdminUser = user?.role === "admin";

          if (!isAdminUser) {
            const isRegistered =
              status === "running" &&
              req.userId &&
              (await ContestParticipation.exists({
                contest: contest._id,
                user: req.userId,
              }));

            if (!isRegistered) {
              return res.status(403).json({
                success: false,
                message: "This problem is part of a contest",
                contestId: contest._id,
                contestStatus: status,
              });
            }
          }
        }

        const entry = contest.problems.find(
          (p) => p.problem._id.toString() === problem._id.toString()
        );
        contestMeta = {
          id: contest._id,
          title: contest.title,
          startTime: contest.startTime,
          endTime: contest.endTime,
          status: getContestStatus(contest),
          points: entry?.points ?? null,
          // full problem set so the banner can offer A/B/C switching
          problems: contest.problems.map((p) => ({
            problemNumber: p.problem.problemNumber,
            title: p.problem.title,
            points: p.points,
          })),
          serverTime: Date.now(),
        };
      }
    }

    const visibleTestCases = problem.testCases.filter((tc) => !tc.isHidden);
    const problemObj = problem.toObject();
    // Never expose the author's trusted solution to solvers.
    delete problemObj.referenceSolution;
    const problemToSend = {
      ...problemObj,
      testCases: visibleTestCases,
    };

    res.status(200).json({ success: true, problem: problemToSend, contestMeta });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch problem" });
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
    contestId,
    points,
    // Phase 6: test-case validation
    referenceCode,
    referenceLanguage,
    validationMode = "validate", // "validate" | "generate" | "skip"
    comparisonMode = "trimmed",
    comparisonEpsilon, // tolerance for numeric mode
    limits,
  } = req.body;

  try {
    const exists = await Problem.findOne({ title });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Problem with this title already exists",
      });
    }

    // Validate test cases against a trusted reference solution before persisting.
    // "skip" is an explicit admin override; otherwise a reference is required.
    let finalTestCases = testCases;
    if (validationMode !== "skip") {
      if (!referenceCode || !referenceLanguage) {
        return res.status(400).json({
          success: false,
          requiresReference: true,
          message: "A reference solution is required to validate the test cases.",
        });
      }
      const result = await validateReferenceSolution({
        referenceLanguage,
        referenceCode,
        testCases,
        mode: comparisonMode,
        epsilon: comparisonEpsilon,
        limits: limits || {},
        generate: validationMode === "generate",
      });
      if (!result.ok) {
        return res.status(400).json({
          success: false,
          message: result.message,
          validation: result,
        });
      }
      if (result.updatedTestCases) finalTestCases = result.updatedTestCases;
    }

    let contest = null;
    if (contestId) {
      contest = await Contest.findById(contestId);
      if (!contest) {
        return res
          .status(404)
          .json({ success: false, message: "Contest not found" });
      }
      if (getContestStatus(contest) === "ended") {
        return res.status(400).json({
          success: false,
          message: "Cannot add problems to an ended contest",
        });
      }
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
      testCases: finalTestCases,
      judgeConfig: { mode: comparisonMode, epsilon: comparisonEpsilon },
      limits: limits || undefined,
      referenceSolution:
        referenceCode && referenceLanguage
          ? { language: referenceLanguage, code: referenceCode }
          : undefined,
      createdBy: req.userId,
      contest: contest ? contest._id : null,
      isPublic: !contest,
    });

    await problem.save();

    if (contest) {
      contest.problems.push({
        problem: problem._id,
        points: Number(points) > 0 ? Number(points) : 100,
      });
      await contest.save();
    }

    invalidateProblemCaches(problem._id);
    res.status(201).json({ success: true, problem });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to create problem",
      error: err.message,
    });
  }
};

export const updateProblem = async (req, res) => {
  try {
    const {
      referenceCode,
      referenceLanguage,
      validationMode = "validate",
      comparisonMode,
      comparisonEpsilon,
      ...rest
    } = req.body;

    const update = { ...rest };
    const skipValidation = validationMode === "skip";

    // Only re-validate when the test cases actually change. A metadata-only edit
    // (statement, tags, …) that resends identical test cases skips the reference run.
    let existing = null;
    let testsChanged = false;
    if (Array.isArray(rest.testCases)) {
      existing = await Problem.findById(req.params.id).select(
        "referenceSolution judgeConfig testCases"
      );
      if (!existing) {
        return res
          .status(404)
          .json({ success: false, message: "Problem not found" });
      }
      const normalize = (tcs) =>
        JSON.stringify(
          (tcs || []).map((tc) => ({
            input: tc.input ?? "",
            expectedOutput: tc.expectedOutput ?? "",
            isHidden: !!tc.isHidden,
          }))
        );
      testsChanged = normalize(rest.testCases) !== normalize(existing.testCases);
    }

    if (testsChanged && !skipValidation) {

      const refLang = referenceLanguage || existing.referenceSolution?.language;
      const refCode = referenceCode || existing.referenceSolution?.code;
      if (!refCode || !refLang) {
        return res.status(400).json({
          success: false,
          requiresReference: true,
          message: "A reference solution is required to validate the test cases.",
        });
      }

      const mode = comparisonMode || existing.judgeConfig?.mode || "trimmed";
      const epsilon =
        comparisonEpsilon !== undefined
          ? comparisonEpsilon
          : existing.judgeConfig?.epsilon;
      const result = await validateReferenceSolution({
        referenceLanguage: refLang,
        referenceCode: refCode,
        testCases: rest.testCases,
        mode,
        epsilon,
        limits: rest.limits || {},
        generate: validationMode === "generate",
      });
      if (!result.ok) {
        return res.status(400).json({
          success: false,
          message: result.message,
          validation: result,
        });
      }
      if (result.updatedTestCases) update.testCases = result.updatedTestCases;
      update.referenceSolution = { language: refLang, code: refCode };
    } else if (referenceCode && referenceLanguage) {
      // Reference supplied without changing test cases — persist it as-is.
      update.referenceSolution = { language: referenceLanguage, code: referenceCode };
    }

    if (comparisonMode)
      update.judgeConfig = { mode: comparisonMode, epsilon: comparisonEpsilon };

    const updated = await Problem.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Problem not found" });
    }

    invalidateProblemCaches(req.params.id);
    res.status(200).json({ success: true, problem: updated });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to update problem" });
  }
};

/**
 * POST /problems/validate — dry-run the reference solution against the given
 * test cases without persisting anything. Powers the admin "Validate" button.
 */
export const validateProblemTestCases = async (req, res) => {
  try {
    const {
      referenceCode,
      referenceLanguage,
      testCases,
      comparisonMode = "trimmed",
      comparisonEpsilon,
      limits,
      validationMode = "validate",
    } = req.body;

    const result = await validateReferenceSolution({
      referenceLanguage,
      referenceCode,
      testCases,
      mode: comparisonMode,
      epsilon: comparisonEpsilon,
      limits: limits || {},
      generate: validationMode === "generate",
    });

    return res.status(200).json({ success: true, validation: result });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Validation failed",
      error: err.response?.data?.error || err.message || "Unknown error",
    });
  }
};

export const deleteProblem = async (req, res) => {
  try {
    const deleted = await Problem.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Problem not found" });
    }

    if (deleted.contest) {
      await Contest.updateOne(
        { _id: deleted.contest },
        { $pull: { problems: { problem: deleted._id } } }
      );
    }

    invalidateProblemCaches(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "Problem deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to delete problem" });
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
      (pid) => pid.toString() !== req.params.id
    );
    await user.save();

    res.status(200).json({ success: true, message: "Removed from favorites" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to remove favorite" });
  }
};

export const searchProblems = async (req, res) => {
  try {
    const { tag, difficulty, query, sort, page = 1, limit = 20 } = req.query;

    const filter = { isPublic: { $ne: false } };

    // ✅ Optimized $or query
    if (query) {
      const tokens = query.trim().split(/\s+/);
      const orConditions = [];

      for (const token of tokens) {
        const num = Number(token);
        if (!isNaN(num)) {
          orConditions.push({ problemNumber: num });
        } else {
          // Use anchored regex for faster match (starts with) instead of full text search
          orConditions.push({ title: { $regex: `^${escapeRegex(token)}`, $options: "i" } });
        }
      }

      if (orConditions.length > 0) filter.$or = orConditions;
    }

    // ✅ Use $in for tags
    if (tag) {
      const tagArray = tag
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (tagArray.length > 0) filter.tags = { $in: tagArray };
    }

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    // ✅ Sorting (ensure field is indexed)
    let sortOption = { problemNumber: 1 };
    if (sort) {
      const [field, direction] = sort.split("_");
      if (["problemNumber", "title", "difficulty"].includes(field)) {
        sortOption = { [field]: direction === "desc" ? -1 : 1 };
      }
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // ✅ Query with projection + lean
    const problems = await Problem.find(filter)
      .select("problemNumber title difficulty tags")
      .lean()
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
    const cached = getCachedList(UNIQUE_TAGS_KEY);
    if (cached) {
      return res.status(200).json({ success: true, tags: cached });
    }
    const tags = await Problem.distinct("tags", { isPublic: { $ne: false } });
    setCachedList(UNIQUE_TAGS_KEY, tags);
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
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch problems by admin" });
  }
};

export const getProblemByAdmin = async (req, res) => {
  try {
    const { problemNumber } = req.params;
    const problem = await Problem.findOne({ problemNumber });
    if (!problem) {
      return res
        .status(404)
        .json({ success: false, message: "Problem not found" });
    }
    res.status(200).json({ success: true, problem });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch problem" });
  }
};
