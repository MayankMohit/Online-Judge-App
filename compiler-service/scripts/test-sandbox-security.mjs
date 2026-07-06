/**
 * Verifies the sandbox hardening: submitted code runs unprivileged, cannot write
 * the container filesystem, and cannot flood the disk. Run against the hardened
 * container:
 *   docker run -d --rm -p 5002:5001 --name ojsec oj-compiler-sec
 *   COMPILER_URL=http://localhost:5002 node scripts/test-sandbox-security.mjs
 */
const URL = process.env.COMPILER_URL || "http://localhost:5001";

const judge = async ({ language = "py", code, tests, mode = "trimmed" }) => {
  const body = JSON.stringify({ language, code, comparisonMode: mode, testCases: tests });
  for (let a = 0; a < 3; a++) {
    try {
      const r = await fetch(`${URL}/compiler/judge`, { method: "POST", headers: { "Content-Type": "application/json" }, body });
      const t = await r.text();
      if (!t) throw 0;
      return JSON.parse(t);
    } catch { await new Promise((r) => setTimeout(r, 800)); }
  }
};

const checks = [
  {
    name: "runs as NON-root (uid == 1001, not 0)",
    run: async () => {
      const r = await judge({ code: `import os\nprint(os.getuid())`, tests: [{ input: "", expectedOutput: "1001" }] });
      return { pass: r.verdict === "accepted", detail: `uid output=${JSON.stringify(r.results?.[0]?.output)}` };
    },
  },
  {
    name: "cannot write the container filesystem (/app)",
    run: async () => {
      const r = await judge({ code: `open("/app/pwned.txt","w").write("x")\nprint("WROTE")`, tests: [{ input: "", expectedOutput: "WROTE" }] });
      // A hardened sandbox => PermissionError => runtime_error (NOT accepted/WROTE).
      return { pass: r.verdict === "runtime_error", detail: `verdict=${r.verdict}` };
    },
  },
  {
    name: "cannot write to the run working dir",
    run: async () => {
      const r = await judge({ code: `open("./pwned.txt","w").write("x")\nprint("WROTE")`, tests: [{ input: "", expectedOutput: "WROTE" }] });
      return { pass: r.verdict === "runtime_error", detail: `verdict=${r.verdict}` };
    },
  },
  {
    name: "disk-flood blocked by file-size limit (write 80MB to /tmp)",
    run: async () => {
      const r = await judge({ code: `f=open("/tmp/big","w")\nf.write("a"*(80*1024*1024))\nf.flush()\nprint("DONE")`, tests: [{ input: "", expectedOutput: "DONE" }] });
      // Should be killed (SIGXFSZ) => not accepted.
      return { pass: r.verdict !== "accepted", detail: `verdict=${r.verdict}` };
    },
  },
  {
    name: "normal solution still works (regression)",
    run: async () => {
      const r = await judge({ code: `a,b=map(int,input().split())\nprint(a+b)`, tests: [{ input: "2 3", expectedOutput: "5" }, { input: "10 20", expectedOutput: "30" }] });
      return { pass: r.verdict === "accepted", detail: `verdict=${r.verdict}` };
    },
  },
];

let pass = 0, fail = 0;
for (const c of checks) {
  let res;
  try { res = await c.run(); } catch (e) { res = { pass: false, detail: `ERROR ${e.message}` }; }
  res.pass ? pass++ : fail++;
  console.log(`  ${res.pass ? "✓" : "✗"} ${c.name}  [${res.detail}]`);
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
