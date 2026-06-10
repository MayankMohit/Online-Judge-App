// utils/getNextProblemNumber.js
import { Problem } from "../models/problemModel.js";

// Smallest positive integer not currently used as a problemNumber.
// Unlike a monotonic counter, this reuses numbers freed by deletions,
// so the visible numbering stays gap-free. The unique index on
// problemNumber guards against the (rare) concurrent-create race.
export const getNextProblemNumber = async () => {
  const numbers = await Problem.find()
    .select("problemNumber")
    .sort({ problemNumber: 1 })
    .lean();

  let expected = 1;
  for (const { problemNumber } of numbers) {
    if (problemNumber === expected) expected++;
    else if (problemNumber > expected) break;
  }
  return expected;
};
