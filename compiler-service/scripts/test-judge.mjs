/**
 * End-to-end test of the /compiler/judge endpoint across all comparison modes.
 * Runs REAL programs through the sandbox and checks the resulting verdict.
 *
 * Usage:  node scripts/test-judge.mjs   (compiler-service must be running on :5001)
 *
 * Uses proper JS strings (no shell escaping) and retries once on an empty reply,
 * so a dev nodemon reload between requests doesn't cause false failures.
 */
const URL = process.env.COMPILER_URL || "http://localhost:5001";

const cases = [
  { name: "exact — identical",            mode: "exact",     code: `console.log("42")`,                 expected: "42",       want: "accepted" },
  { name: "exact — internal spaces",      mode: "exact",     code: `console.log("a x")`,                expected: "a  x",     want: "wrong_answer" },
  { name: "trimmed — trailing newline",   mode: "trimmed",   code: `console.log("5")`,                  expected: "5",        want: "accepted" },
  { name: "trimmed — internal diff",      mode: "trimmed",   code: `console.log("1\\n3")`,              expected: "1\n2",     want: "wrong_answer" },
  { name: "token — collapses spacing",    mode: "token",     code: `console.log("1  2   3")`,           expected: "1 2 3",    want: "accepted" },
  { name: "token — order matters",        mode: "token",     code: `console.log("2 1")`,                expected: "1 2",      want: "wrong_answer" },
  { name: "numeric — within epsilon",     mode: "numeric",   code: `console.log("3.14159265")`,         expected: "3.1415926",want: "accepted",     opts: { epsilon: 1e-6 } },
  { name: "numeric — outside epsilon",    mode: "numeric",   code: `console.log("3.14159265")`,         expected: "3.1415926",want: "wrong_answer", opts: { epsilon: 1e-9 } },
  { name: "unordered — any order",        mode: "unordered", code: `console.log("c\\nb\\na")`,          expected: "a\nb\nc",  want: "accepted" },
  { name: "unordered — multiset diff",    mode: "unordered", code: `console.log("a\\na")`,              expected: "a",        want: "wrong_answer" },
];

const judge = async (c) => {
  const body = JSON.stringify({
    language: "js",
    code: c.code,
    comparisonMode: c.mode,
    comparisonOptions: c.opts || {},
    testCases: [{ input: "", expectedOutput: c.expected }],
  });
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`${URL}/compiler/judge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      const text = await res.text();
      if (!text) throw new Error("empty reply (server reloading?)");
      return JSON.parse(text).verdict;
    } catch (e) {
      if (attempt === 2) throw e;
      await new Promise((r) => setTimeout(r, 600)); // ride out a nodemon reload
    }
  }
};

let pass = 0, fail = 0;
for (const c of cases) {
  const got = await judge(c);
  const ok = got === c.want;
  ok ? pass++ : fail++;
  console.log(`  ${ok ? "✓" : "✗"} [${c.mode}] ${c.name}  → ${got}${ok ? "" : ` (want ${c.want})`}`);
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
