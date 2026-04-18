import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

// ─── Hint Prompts ────────────────────────────────────────────────────────────

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
Be concrete about the strategy. Keep it to 3-5 sentences.

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

// ─── Feedback Prompt ─────────────────────────────────────────────────────────

const FEEDBACK_PROMPT = (submission, problem) => `
You are an expert competitive programming mentor reviewing an accepted solution.
Analyze the code and return a JSON object with EXACTLY this structure — no markdown, no backticks, raw JSON only:

{
  "approach": "Name of the algorithm/pattern used (e.g. Two Pointers, Dynamic Programming, BFS, Greedy)",
  "timeComplexity": "e.g. O(n log n)",
  "spaceComplexity": "e.g. O(n)",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["suggestion 1", "suggestion 2"],
  "summary": "2-3 sentence overall assessment of the solution quality and style",
  "score": 8
}

Rules:
- "strengths": 2-4 short bullet points on what was done well
- "improvements": 1-3 concrete, actionable suggestions (even for great solutions)
- "score": integer from 1-10 based on correctness, efficiency, and code quality
- Keep all strings concise — no markdown formatting inside values

Problem: ${problem.title} (${problem.difficulty})
Tags: ${problem.tags?.join(", ") || "None"}
Problem Statement: ${problem.statement}
${problem.constraints ? `Constraints: ${problem.constraints}` : ""}

Language: ${submission.language}
Average Runtime: ${submission.averageTime}ms

Code:
${submission.code}
`;

// ─── Exports ─────────────────────────────────────────────────────────────────

export const generateHint = async (problem, tier) => {
  const promptFn = TIER_PROMPTS[tier];
  if (!promptFn) throw new Error("Invalid hint tier");

  const result = await model.generateContent(promptFn(problem));
  const hint = result.response.text().trim();
  return { hint };
};

export const generateFeedback = async (submission, problem) => {
  const prompt = FEEDBACK_PROMPT(submission, problem);
  const result = await model.generateContent(prompt);
  const raw = result.response.text().trim();

  // Strip any accidental markdown fences Gemini might add
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error("Gemini returned invalid JSON for feedback");
  }
};