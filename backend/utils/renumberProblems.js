import { Problem } from "../models/problemModel.js";

// Compact problemNumbers to 1..N preserving order. Returns the list of
// changes made. Safe: everything internal references problems by ObjectId;
// problemNumber is only used in URLs.
export const compactProblemNumbers = async () => {
  const problems = await Problem.find()
    .select("problemNumber title")
    .sort({ problemNumber: 1 });

  const changes = [];
  // Ascending order means each target number is already free (target <= current)
  for (let i = 0; i < problems.length; i++) {
    const target = i + 1;
    if (problems[i].problemNumber !== target) {
      changes.push({
        from: problems[i].problemNumber,
        to: target,
        title: problems[i].title,
      });
      problems[i].problemNumber = target;
      await problems[i].save();
    }
  }
  return changes;
};
