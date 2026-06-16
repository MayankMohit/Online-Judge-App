import { Contest } from "../models/contestModel.js";
import { ContestParticipation } from "../models/contestParticipationModel.js";
import { MockParticipation } from "../models/mockParticipationModel.js";
import { Problem } from "../models/problemModel.js";
import { User } from "../models/userModel.js";
import {
  getContestStatus,
  maybeReleaseContestProblems,
  STANDINGS_SORT,
  buildStrictlyBetterFilter,
} from "../utils/contestHelpers.js";

const isAdminUser = async (userId) => {
  if (!userId) return false;
  const user = await User.findById(userId).select("role");
  return user?.role === "admin";
};

export const getContests = async (req, res) => {
  try {
    const { status } = req.query;
    const now = new Date();

    const filter = {};
    if (status === "upcoming") filter.startTime = { $gt: now };
    else if (status === "running") {
      filter.startTime = { $lte: now };
      filter.endTime = { $gte: now };
    } else if (status === "past") filter.endTime = { $lt: now };

    const contests = await Contest.find(filter)
      .select("title description startTime endTime problems")
      .sort({ startTime: status === "past" ? -1 : 1 });

    const myParticipations = req.userId
      ? await ContestParticipation.find({ user: req.userId }).select("contest")
      : [];
    const registeredSet = new Set(
      myParticipations.map((p) => p.contest.toString())
    );

    const result = await Promise.all(
      contests.map(async (contest) => {
        const registeredCount = await ContestParticipation.countDocuments({
          contest: contest._id,
        });
        return {
          _id: contest._id,
          title: contest.title,
          description: contest.description,
          startTime: contest.startTime,
          endTime: contest.endTime,
          status: getContestStatus(contest, now),
          problemCount: contest.problems.length,
          registeredCount,
          isRegistered: registeredSet.has(contest._id.toString()),
        };
      })
    );

    res.status(200).json({
      success: true,
      contests: result,
      serverTime: Date.now(),
    });
  } catch (err) {
    console.error("Failed to fetch contests:", err);
    res.status(500).json({ success: false, message: "Failed to fetch contests" });
  }
};

export const getContestById = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id).populate(
      "problems.problem",
      "problemNumber title difficulty"
    );
    if (!contest) {
      return res
        .status(404)
        .json({ success: false, message: "Contest not found" });
    }

    await maybeReleaseContestProblems(contest);

    const now = new Date();
    const status = getContestStatus(contest, now);

    const participation = req.userId
      ? await ContestParticipation.findOne({
          contest: contest._id,
          user: req.userId,
        })
      : null;
    const isRegistered = !!participation;

    const admin = await isAdminUser(req.userId);
    const canSeeProblems =
      admin || status === "ended" || (status === "running" && isRegistered);

    const registeredCount = await ContestParticipation.countDocuments({
      contest: contest._id,
    });

    res.status(200).json({
      success: true,
      contest: {
        _id: contest._id,
        title: contest.title,
        description: contest.description,
        startTime: contest.startTime,
        endTime: contest.endTime,
        status,
        registeredCount,
        problems: canSeeProblems
          ? contest.problems.map((p) => ({
              problem: p.problem,
              points: p.points,
            }))
          : [],
        problemCount: contest.problems.length,
      },
      isRegistered,
      myStats: participation
        ? {
            score: participation.score,
            totalAttempts: participation.totalAttempts,
            problemStats: participation.problemStats,
          }
        : null,
      serverTime: Date.now(),
    });
  } catch (err) {
    console.error("Failed to fetch contest:", err);
    res.status(500).json({ success: false, message: "Failed to fetch contest" });
  }
};

export const createContest = async (req, res) => {
  try {
    const { title, description, startTime, endTime } = req.body;
    if (!title || !startTime || !endTime) {
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }
    if (new Date(endTime) <= new Date(startTime)) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }

    const contest = await Contest.create({
      title,
      description,
      startTime,
      endTime,
      createdBy: req.userId,
    });

    res.status(201).json({ success: true, contest });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A contest with this title already exists",
      });
    }
    console.error("Failed to create contest:", err);
    res.status(500).json({ success: false, message: "Failed to create contest" });
  }
};

export const updateContest = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return res
        .status(404)
        .json({ success: false, message: "Contest not found" });
    }

    const status = getContestStatus(contest);
    const { title, description, startTime, endTime, problems } = req.body;

    if (title !== undefined) contest.title = title;
    if (description !== undefined) contest.description = description;
    if (endTime !== undefined) contest.endTime = endTime;

    if (startTime !== undefined) {
      if (status !== "upcoming") {
        return res.status(400).json({
          success: false,
          message: "Cannot change start time after the contest has started",
        });
      }
      contest.startTime = startTime;
    }

    // problems: array of { problem: <id>, points } — only editable before start
    if (problems !== undefined) {
      if (status !== "upcoming") {
        return res.status(400).json({
          success: false,
          message: "Cannot modify problems after the contest has started",
        });
      }
      const existingIds = contest.problems.map((p) => p.problem.toString());
      const newIds = problems.map((p) => p.problem.toString());
      if (!newIds.every((id) => existingIds.includes(id))) {
        return res.status(400).json({
          success: false,
          message: "Problems must be added via problem creation",
        });
      }
      // Removed problems get detached and stay hidden drafts
      const removedIds = existingIds.filter((id) => !newIds.includes(id));
      if (removedIds.length > 0) {
        await Problem.updateMany(
          { _id: { $in: removedIds } },
          { contest: null }
        );
      }
      contest.problems = problems;
    }

    await contest.save();
    res.status(200).json({ success: true, contest });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A contest with this title already exists",
      });
    }
    console.error("Failed to update contest:", err);
    res.status(500).json({ success: false, message: "Failed to update contest" });
  }
};

export const deleteContest = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return res
        .status(404)
        .json({ success: false, message: "Contest not found" });
    }

    const status = getContestStatus(contest);
    if (status === "running") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete a running contest",
      });
    }

    if (status === "upcoming") {
      // Unreleased problems were created for this contest — remove them too
      await Problem.deleteMany({ contest: contest._id, isPublic: false });
      await Problem.updateMany({ contest: contest._id }, { contest: null });
    } else {
      // Ended: problems are (or will be) public — just detach
      await Problem.updateMany(
        { contest: contest._id },
        { contest: null, isPublic: true }
      );
    }

    await ContestParticipation.deleteMany({ contest: contest._id });
    await contest.deleteOne();

    res.status(200).json({ success: true, message: "Contest deleted" });
  } catch (err) {
    console.error("Failed to delete contest:", err);
    res.status(500).json({ success: false, message: "Failed to delete contest" });
  }
};

export const registerForContest = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return res
        .status(404)
        .json({ success: false, message: "Contest not found" });
    }

    if (getContestStatus(contest) === "ended") {
      return res.status(400).json({
        success: false,
        message: "Contest has already ended",
      });
    }

    const participation = await ContestParticipation.findOneAndUpdate(
      { contest: contest._id, user: req.userId },
      { $setOnInsert: { registeredAt: new Date() } },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, participation });
  } catch (err) {
    console.error("Failed to register:", err);
    res.status(500).json({ success: false, message: "Failed to register" });
  }
};

export const unregisterFromContest = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return res
        .status(404)
        .json({ success: false, message: "Contest not found" });
    }

    if (getContestStatus(contest) !== "upcoming") {
      return res.status(400).json({
        success: false,
        message: "Cannot unregister after the contest has started",
      });
    }

    await ContestParticipation.deleteOne({
      contest: contest._id,
      user: req.userId,
      score: 0,
    });

    res.status(200).json({ success: true, message: "Unregistered" });
  } catch (err) {
    console.error("Failed to unregister:", err);
    res.status(500).json({ success: false, message: "Failed to unregister" });
  }
};

export const getStandings = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id).populate(
      "problems.problem",
      "problemNumber title"
    );
    if (!contest) {
      return res
        .status(404)
        .json({ success: false, message: "Contest not found" });
    }

    await maybeReleaseContestProblems(contest);

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = 50;
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      ContestParticipation.find({ contest: contest._id })
        .sort(STANDINGS_SORT)
        .skip(skip)
        .limit(limit)
        .populate("user", "name"),
      ContestParticipation.countDocuments({ contest: contest._id }),
    ]);

    const standings = rows.map((row, i) => ({
      rank: skip + i + 1,
      user: row.user,
      score: row.score,
      lastAcceptedAt: row.lastAcceptedAt,
      totalAttempts: row.totalAttempts,
      problemStats: row.problemStats,
    }));

    let myRow = null;
    if (req.userId) {
      const mine = await ContestParticipation.findOne({
        contest: contest._id,
        user: req.userId,
      }).populate("user", "name");
      if (mine) {
        const better = await ContestParticipation.countDocuments(
          buildStrictlyBetterFilter(contest._id, mine)
        );
        myRow = {
          rank: better + 1,
          user: mine.user,
          score: mine.score,
          lastAcceptedAt: mine.lastAcceptedAt,
          totalAttempts: mine.totalAttempts,
          problemStats: mine.problemStats,
        };
      }
    }

    res.status(200).json({
      success: true,
      standings,
      myRow,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      problems: contest.problems.map((p) => ({
        problem: p.problem,
        points: p.points,
      })),
      contestStatus: getContestStatus(contest),
      serverTime: Date.now(),
    });
  } catch (err) {
    console.error("Failed to fetch standings:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch standings" });
  }
};

export const getMyParticipation = async (req, res) => {
  try {
    const participation = await ContestParticipation.findOne({
      contest: req.params.id,
      user: req.userId,
    });
    res.status(200).json({
      success: true,
      participation,
      serverTime: Date.now(),
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch participation" });
  }
};

// ─── Mock (virtual) contest ──────────────────────────────────────────────────
// A personal, timed re-run of an ended contest. Same duration as the original,
// personal score only (no global standings). One mock per (contest, user).

export const startMock = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return res
        .status(404)
        .json({ success: false, message: "Contest not found" });
    }

    if (getContestStatus(contest) !== "ended") {
      return res.status(400).json({
        success: false,
        message: "Mock contests are available only after the contest has ended",
      });
    }

    // Idempotent: if a mock already exists, return it unchanged.
    let mock = await MockParticipation.findOne({
      contest: contest._id,
      user: req.userId,
    });

    if (!mock) {
      const duration =
        new Date(contest.endTime).getTime() -
        new Date(contest.startTime).getTime();
      const start = new Date();
      const end = new Date(start.getTime() + duration);
      mock = await MockParticipation.create({
        contest: contest._id,
        user: req.userId,
        startTime: start,
        endTime: end,
      });
    }

    res.status(201).json({ success: true, mock, serverTime: Date.now() });
  } catch (err) {
    console.error("Failed to start mock:", err);
    res.status(500).json({ success: false, message: "Failed to start mock" });
  }
};

export const getMyMock = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id).populate(
      "problems.problem",
      "problemNumber title difficulty"
    );
    if (!contest) {
      return res
        .status(404)
        .json({ success: false, message: "Contest not found" });
    }

    const mock = await MockParticipation.findOne({
      contest: contest._id,
      user: req.userId,
    });

    res.status(200).json({
      success: true,
      mock,
      contest: {
        _id: contest._id,
        title: contest.title,
        problems: contest.problems.map((p) => ({
          problem: p.problem,
          points: p.points,
        })),
      },
      serverTime: Date.now(),
    });
  } catch (err) {
    console.error("Failed to fetch mock:", err);
    res.status(500).json({ success: false, message: "Failed to fetch mock" });
  }
};

export const resetMock = async (req, res) => {
  try {
    await MockParticipation.deleteOne({
      contest: req.params.id,
      user: req.userId,
    });
    res.status(200).json({ success: true, message: "Mock reset" });
  } catch (err) {
    console.error("Failed to reset mock:", err);
    res.status(500).json({ success: false, message: "Failed to reset mock" });
  }
};

export const getMyContestHistory = async (req, res) => {
  try {
    const participations = await ContestParticipation.find({
      user: req.userId,
    }).populate("contest", "title startTime endTime problems");

    const now = new Date();
    const ended = participations.filter(
      (p) => p.contest && p.contest.endTime < now
    );

    const history = await Promise.all(
      ended.map(async (p) => {
        const better = await ContestParticipation.countDocuments(
          buildStrictlyBetterFilter(p.contest._id, p)
        );
        const total = await ContestParticipation.countDocuments({
          contest: p.contest._id,
        });
        return {
          contestId: p.contest._id,
          title: p.contest.title,
          startTime: p.contest.startTime,
          endTime: p.contest.endTime,
          score: p.score,
          rank: better + 1,
          totalParticipants: total,
          problemsSolved: p.problemStats.filter((s) => s.solved).length,
          problemCount: p.contest.problems.length,
        };
      })
    );

    history.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

    res.status(200).json({ success: true, history });
  } catch (err) {
    console.error("Failed to fetch contest history:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch contest history" });
  }
};
