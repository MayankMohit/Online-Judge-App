import { Problem } from "../models/problemModel.js";

export const getContestStatus = (contest, now = new Date()) => {
  if (now < contest.startTime) return "upcoming";
  if (now <= contest.endTime) return "running";
  return "ended";
};

// Lazy release: once a contest has ended, flip its problems public.
// Idempotent — safe to call on every contest read.
export const maybeReleaseContestProblems = async (contest) => {
  if (contest.problemsReleased) return;
  if (getContestStatus(contest) !== "ended") return;

  await Problem.updateMany({ contest: contest._id }, { isPublic: true });
  contest.problemsReleased = true;
  await contest.save();
};

export const STANDINGS_SORT = {
  score: -1,
  lastAcceptedAt: 1,
  totalAttempts: 1,
  registeredAt: 1,
};

// Rank = 1 + number of participants strictly better under STANDINGS_SORT.
// Note: lastAcceptedAt is null iff score is 0, so at equal score the null
// case never needs a "$lt null" comparison.
export const buildStrictlyBetterFilter = (contestId, row) => {
  const or = [{ score: { $gt: row.score } }];

  if (row.lastAcceptedAt !== null) {
    or.push({ score: row.score, lastAcceptedAt: { $lt: row.lastAcceptedAt } });
  }
  or.push({
    score: row.score,
    lastAcceptedAt: row.lastAcceptedAt,
    totalAttempts: { $lt: row.totalAttempts },
  });
  or.push({
    score: row.score,
    lastAcceptedAt: row.lastAcceptedAt,
    totalAttempts: row.totalAttempts,
    registeredAt: { $lt: row.registeredAt },
  });

  return { contest: contestId, $or: or };
};
