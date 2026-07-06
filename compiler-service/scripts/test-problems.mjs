/**
 * End-to-end test of the five comparison modes using realistic problems.
 * For each problem we submit three programs and assert the verdict:
 *   - reference        (canonical solution)      -> accepted
 *   - altAccepted      (differently-formatted OK) -> accepted BECAUSE of the mode
 *   - wrong            (genuinely incorrect)      -> wrong_answer
 *
 * Run: node scripts/test-problems.mjs   (compiler-service must be up on :5001)
 */
const URL = process.env.COMPILER_URL || "http://localhost:5001";
const LANG = "python";

const P = (s) => s; // readability helper for python source

const problems = [
  {
    title: "1) exact — single-space join",
    mode: "exact",
    tests: [
      { input: "hello world\n", expected: "hello world" },
      { input: "foo bar\n", expected: "foo bar" },
    ],
    submissions: [
      { name: "reference", want: "accepted", code: P(`a, b = input().split()\nprint(a, b)`) },
      { name: "wrong (double space)", want: "wrong_answer", code: P(`a, b = input().split()\nprint(a, " ", b)`) },
    ],
  },
  {
    title: "2) trimmed — sum of two integers",
    mode: "trimmed",
    tests: [
      { input: "2 3\n", expected: "5" },
      { input: "-4 10\n", expected: "6" },
    ],
    submissions: [
      { name: "reference", want: "accepted", code: P(`a, b = map(int, input().split())\nprint(a + b)`) },
      { name: "alt (trailing whitespace)", want: "accepted", code: P(`a, b = map(int, input().split())\nprint(str(a + b) + "   ")`) },
      { name: "wrong (product)", want: "wrong_answer", code: P(`a, b = map(int, input().split())\nprint(a * b)`) },
    ],
  },
  {
    title: "3) token — print 1..N",
    mode: "token",
    tests: [
      { input: "5\n", expected: "1 2 3 4 5" },
      { input: "1\n", expected: "1" },
    ],
    submissions: [
      { name: "reference (spaced)", want: "accepted", code: P(`n = int(input())\nprint(*range(1, n + 1))`) },
      { name: "alt (one per line)", want: "accepted", code: P(`n = int(input())\nfor i in range(1, n + 1):\n    print(i)`) },
      { name: "wrong (reversed)", want: "wrong_answer", code: P(`n = int(input())\nfor i in range(n, 0, -1):\n    print(i)`) },
    ],
  },
  {
    title: "4a) numeric — average, epsilon 1e-5",
    mode: "numeric",
    opts: { epsilon: 1e-5 },
    tests: [
      { input: "3\n1 2 2\n", expected: "1.6666666667" },
      { input: "2\n1 2\n", expected: "1.5000000000" },
    ],
    submissions: [
      { name: "reference (10 dp)", want: "accepted", code: P(`import sys\nd = sys.stdin.read().split()\nn = int(d[0]); nums = list(map(int, d[1:1+n]))\nprint(f"{sum(nums)/n:.10f}")`) },
      { name: "alt (rounded 5 dp)", want: "accepted", code: P(`import sys\nd = sys.stdin.read().split()\nn = int(d[0]); nums = list(map(int, d[1:1+n]))\nprint(round(sum(nums)/n, 5))`) },
      { name: "wrong (too coarse)", want: "wrong_answer", code: P(`import sys\nd = sys.stdin.read().split()\nn = int(d[0]); nums = list(map(int, d[1:1+n]))\nprint(round(sum(nums)/n, 1))`) },
    ],
  },
  {
    title: "4b) numeric — SAME rounded sol, epsilon 1e-9 (tighter) -> reject",
    mode: "numeric",
    opts: { epsilon: 1e-9 },
    tests: [{ input: "3\n1 2 2\n", expected: "1.6666666667" }],
    submissions: [
      { name: "rounded 5 dp vs tight eps", want: "wrong_answer", code: P(`import sys\nd = sys.stdin.read().split()\nn = int(d[0]); nums = list(map(int, d[1:1+n]))\nprint(round(sum(nums)/n, 5))`) },
    ],
  },
  {
    title: "5) unordered — divisors of N in any order",
    mode: "unordered",
    tests: [
      { input: "6\n", expected: "1\n2\n3\n6" },
      { input: "12\n", expected: "1\n2\n3\n4\n6\n12" },
    ],
    submissions: [
      { name: "reference (ascending)", want: "accepted", code: P(`n = int(input())\nfor d in range(1, n + 1):\n    if n % d == 0:\n        print(d)`) },
      { name: "alt (descending)", want: "accepted", code: P(`n = int(input())\nfor d in range(n, 0, -1):\n    if n % d == 0:\n        print(d)`) },
      { name: "wrong (skip d==n)", want: "wrong_answer", code: P(`n = int(input())\nfor d in range(1, n):\n    if n % d == 0:\n        print(d)`) },
    ],
  },
];

const judge = async (mode, opts, code, tests) => {
  const body = JSON.stringify({
    language: LANG,
    code,
    comparisonMode: mode,
    comparisonOptions: opts || {},
    testCases: tests.map((t) => ({ input: t.input, expectedOutput: t.expected })),
    stopOnFirstFailure: false,
  });
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`${URL}/compiler/judge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      const text = await res.text();
      if (!text) throw new Error("empty reply");
      return JSON.parse(text);
    } catch (e) {
      if (attempt === 2) throw e;
      await new Promise((r) => setTimeout(r, 600));
    }
  }
};

let pass = 0, fail = 0;
for (const prob of problems) {
  console.log(`\n${prob.title}  [mode=${prob.mode}${prob.opts ? `, eps=${prob.opts.epsilon}` : ""}]`);
  for (const sub of prob.submissions) {
    let got, detail = "";
    try {
      const r = await judge(prob.mode, prob.opts, sub.code, prob.tests);
      got = r.verdict;
      if (got !== sub.want && r.compile && r.compile.success === false) detail = ` compileErr: ${r.compile.error}`;
      if (got !== sub.want && Array.isArray(r.results)) {
        const bad = r.results.find((x) => !x.passed);
        if (bad) detail = ` [status=${bad.status} got=${JSON.stringify(bad.output)} err=${bad.error ? bad.error.split("\n")[0] : ""}]`;
      }
    } catch (e) {
      got = `ERROR(${e.message})`;
    }
    const ok = got === sub.want;
    ok ? pass++ : fail++;
    console.log(`  ${ok ? "✓" : "✗"} ${sub.name}: ${got}${ok ? "" : ` (want ${sub.want})${detail}`}`);
  }
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
