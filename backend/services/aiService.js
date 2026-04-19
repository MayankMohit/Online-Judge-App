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

// ─── Explanation Prompt ───────────────────────────────────────────────────────
 
const EXPLANATION_PROMPT = (problem, language) => `
You are a friendly coding teacher explaining a competitive programming problem to a beginner.
Explain the problem in ${language} language in simple, everyday terms.
 
Return a JSON object with EXACTLY this structure — no markdown, no backticks, raw JSON only:
 
{
  "analogy": "A real-world analogy that makes the problem instantly clear (2-3 sentences)",
  "breakdown": [
    "Step 1: plain English explanation of what the problem is asking",
    "Step 2: what the input looks like and what we need to do with it",
    "Step 3: what the output should be and why"
  ],
  "keyInsight": "The single most important 'aha moment' to understand this problem (1-2 sentences)",
  "example": "Walk through the sample input/output in plain language, no code"
}
 
Rules:
- Write everything in ${language} language — including all field values
- Use simple vocabulary, avoid jargon
- The analogy must be relatable (food, sports, everyday life)
- breakdown should have exactly 3 steps
- Keep keyInsight punchy and memorable
- No code, no pseudocode anywhere in the response
 
Problem Title: ${problem.title}
Difficulty: ${problem.difficulty}
Problem Statement: ${problem.statement}
${problem.inputFormat ? `Input Format: ${problem.inputFormat}` : ""}
${problem.outputFormat ? `Output Format: ${problem.outputFormat}` : ""}
${problem.constraints ? `Constraints: ${problem.constraints}` : ""}
${problem.sampleInput ? `Sample Input: ${problem.sampleInput}` : ""}
${problem.sampleOutput ? `Sample Output: ${problem.sampleOutput}` : ""}
`;

// ─── Autocomplete Prompt ──────────────────────────────────────────────────────
 
const AUTOCOMPLETE_PROMPT = (title, statement) => `
You are an expert competitive programming problem setter. Given a problem title and partial or full statement, generate a complete, well-formed competitive programming problem.
 
Return a JSON object with EXACTLY this structure — no markdown, no backticks, raw JSON only:
 
{
  "statement": "Complete, clear problem statement (improve/expand the given one if needed)",
  "difficulty": "Easy" | "Medium" | "Hard",
  "tags": ["tag1", "tag2"],
  "inputFormat": "Description of input format",
  "outputFormat": "Description of output format",
  "constraints": "All constraints e.g. 1 <= n <= 10^5",
  "sampleInput": "One representative sample input",
  "sampleOutput": "Correct output for the sample input",
  "testCases": [
    { "input": "...", "expectedOutput": "...", "isHidden": true },
    ...
  ]
}
 
STRICT RULES — violating any of these is unacceptable:
 
1. TEST CASES: Generate at least 10 test cases. Include:
   - Basic/small cases (2-3)
   - Medium complexity cases (3-4)
   - Edge cases: empty input, single element, max constraints, all same values, negative numbers if applicable (3-4)
   - First 2 test cases must have isHidden: false (sample cases), rest must have isHidden: true
 
2. INPUT/OUTPUT FORMAT: All input and output values must be raw strings or integers — NO quotes around values in the actual input/output fields. Write them exactly as they would appear in stdin/stdout.
   CORRECT:   { "input": "5\\n1 2 3 4 5", "expectedOutput": "15" }
   INCORRECT: { "input": "\\"5 1 2 3 4 5\\"", "expectedOutput": "\\"15\\"" }
 
3. STDOUT ONLY: The problem must ask users to PRINT to stdout. NEVER say "return", "return an array", "return true/false", "return the answer". Always say "print", "output", "write to stdout".
 
4. NO EMPTY OUTPUTS: No test case can have an empty expectedOutput. If the answer could be empty (e.g. no elements found), instruct users to print a dot (.) or empty brackets ([]) instead. Make this explicit in the outputFormat.
 
5. TAGS: Use standard competitive programming tags only: Array, String, HashMap, Two Pointers, Sliding Window, Binary Search, Sorting, Stack, Queue, Linked List, Tree, Graph, BFS, DFS, Dynamic Programming, Greedy, Math, Recursion, Backtracking, Bit Manipulation, Heap, Prefix Sum.
 
6. DIFFICULTY: Infer from complexity — Easy for O(n) brute force problems, Medium for O(n log n) or moderate DP, Hard for complex DP/Graph problems.
 
Problem Title: ${title}
Problem Statement (partial or full): ${statement}
`;
 
// ─── Helpers ──────────────────────────────────────────────────────────────────
 
const parseJSON = (raw) => {
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(cleaned);
};

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

export const generateExplanation = async (problem, language) => {
  const result = await model.generateContent(EXPLANATION_PROMPT(problem, language));
  const raw = result.response.text().trim();
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error("Gemini returned invalid JSON for explanation");
  }
};

export const generateAutocomplete = async (title, statement) => {
  const result = await model.generateContent(AUTOCOMPLETE_PROMPT(title, statement));
  try {
    return parseJSON(result.response.text().trim());
  } catch {
    throw new Error("Gemini returned invalid JSON for autocomplete");
  }
};