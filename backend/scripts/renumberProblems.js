// One-off maintenance: compact problemNumbers to 1..N preserving order.
// Safe because submissions, code saves, favorites, and contest problem sets
// all reference problems by ObjectId — only URLs use problemNumber.
// Run: node scripts/renumberProblems.js
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { compactProblemNumbers } from "../utils/renumberProblems.js";

const main = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const changes = await compactProblemNumbers();
  changes.forEach((c) => console.log(`#${c.from} -> #${c.to}  ${c.title}`));
  console.log(
    changes.length === 0
      ? "Already compact — nothing to do."
      : `Renumbered ${changes.length} problem(s).`
  );

  await mongoose.disconnect();
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
