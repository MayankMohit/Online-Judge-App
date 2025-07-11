import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import { Problem } from "../models/problemModel.js";

// Connect to MongoDB
await mongoose.connect(process.env.MONGODB_URI);
console.log("✅ Connected to MongoDB");

const seedProblems = async () => {
  const existing = await Problem.countDocuments();
  if (existing >= 1000) {
    console.log("⚠️ Skipping seeding — 10,00+ problems already exist.");
    return;
  }

  console.log("🌱 Seeding 10,00 dummy problems...");

  const problems = [];
  for (let i = 12; i <= 1000; i++) {
    problems.push({
      problemNumber: i,
      title: `Problem ${i}`,
      statement: "Dummy statement",
      difficulty: ["Easy", "Medium", "Hard"][i % 3],
      tags: ["array", "dp", "math", "greedy", "graph"][i % 5],
    });
  }

  await Problem.insertMany(problems);
  console.log("✅ Seeding complete.");
};

const createIndexes = async () => {
  console.log("🔧 Creating indexes...");
  try {
    await Problem.collection.createIndex({ title: "text" });
    await Problem.collection.createIndex({ tags: 1 });
    await Problem.collection.createIndex({ difficulty: 1 });
    console.log("✅ Indexes created.");
  } catch (error) {
    console.error("❌ Index creation failed:", error.message);
  }
};

const benchmark = async () => {
  const queryTitle = "Problem 900";

  const result1 = await Problem.collection.find({
    title: { $regex: queryTitle, $options: "i" },
  }).explain("executionStats");

  console.log("\n🔍 Regex Search (no text index used):");
  console.log(`⏱️ Time: ${result1.executionStats.executionTimeMillis} ms`);
  console.log(`📄 Docs Scanned: ${result1.executionStats.totalDocsExamined}`);
  console.log(`📚 Index Used: ${result1.queryPlanner.winningPlan.inputStage?.indexName || "None"}`);

  const result2 = await Problem.collection.find({
    $text: { $search: queryTitle },
  }).explain("executionStats");

  console.log("\n🔎 Text Search (uses text index):");
  console.log(`⏱️ Time: ${result2.executionStats.executionTimeMillis} ms`);
  console.log(`📄 Docs Scanned: ${result2.executionStats.totalDocsExamined}`);
  console.log(`📚 Index Used: ${result2.queryPlanner.winningPlan.inputStage?.indexName}`);
};

const runAll = async () => {
  try {
    await seedProblems();
    await createIndexes();
    await benchmark();
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    mongoose.connection.close();
  }
};

runAll();
