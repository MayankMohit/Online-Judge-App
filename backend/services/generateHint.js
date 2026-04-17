import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

const TIER_PROMPTS = {
  1: (problem) => `
You are a coding mentor helping a student solve a competitive programming problem.
Give a TIER 1 hint — a gentle nudge only. Do NOT reveal the approach or algorithm.
Just guide their thinking with a question or point them toward what concept to think about.
Keep it to 2-3 sentences max.

Problem Title: ${problem.title}
Difficulty: ${problem.difficulty}
Tags: ${problem.tags?.join(", ") || "None"}
Problem Statement: ${problem.statement}
${problem.constraints ? `Constraints: ${problem.constraints}` : ""}

Respond with ONLY the hint text. No preamble, no "Here's your hint:", just the hint.
`,

  2: (problem) => `
You are a coding mentor helping a student solve a competitive programming problem.
Give a TIER 2 hint — explain the approach or algorithm to use, but do NOT write any code or pseudocode.
Be concrete about the strategy.
Keep it to 3-5 sentences.

Problem Title: ${problem.title}
Difficulty: ${problem.difficulty}
Tags: ${problem.tags?.join(", ") || "None"}
Problem Statement: ${problem.statement}
${problem.constraints ? `Constraints: ${problem.constraints}` : ""}
${problem.inputFormat ? `Input Format: ${problem.inputFormat}` : ""}
${problem.outputFormat ? `Output Format: ${problem.outputFormat}` : ""}

Respond with ONLY the hint text. No preamble, no "Here's your hint:", just the hint.
`,

  3: (problem) => `
You are a coding mentor helping a student solve a competitive programming problem.
Give a TIER 3 hint — provide clear step-by-step pseudocode or logic breakdown.
Do NOT write actual code in any programming language. Use plain English steps.
Be detailed enough that the student can implement it themselves.

Problem Title: ${problem.title}
Difficulty: ${problem.difficulty}
Tags: ${problem.tags?.join(", ") || "None"}
Problem Statement: ${problem.statement}
${problem.constraints ? `Constraints: ${problem.constraints}` : ""}
${problem.inputFormat ? `Input Format: ${problem.inputFormat}` : ""}
${problem.outputFormat ? `Output Format: ${problem.outputFormat}` : ""}
${problem.sampleInput ? `Sample Input: ${problem.sampleInput}` : ""}
${problem.sampleOutput ? `Sample Output: ${problem.sampleOutput}` : ""}

Respond with ONLY the hint text. No preamble, no "Here's your hint:", just the hint.
`,
};

const hintCache = new Map();

export const generateHint = async (problem, tier) => {
  const cacheKey = `${problem._id}-${tier}`;

  if (hintCache.has(cacheKey)) {
    return { hint: hintCache.get(cacheKey), cached: true };
  }

  const promptFn = TIER_PROMPTS[tier];
  if (!promptFn) throw new Error("Invalid hint tier");

  const prompt = promptFn(problem);
  const result = await model.generateContent(prompt);
  const hint = result.response.text().trim();

  hintCache.set(cacheKey, hint);

  return { hint, cached: false };
};