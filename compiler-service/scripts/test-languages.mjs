/**
 * End-to-end language test: submits a real "sum of two integers" program in each
 * supported language through /compiler/judge and asserts the verdict. Also checks
 * a Java runtime-error and a Java compile-error to exercise the isolated-source path.
 *
 * Run against the multilang container:
 *   docker run -d --rm -p 5002:5001 --name ojml oj-compiler-multilang
 *   COMPILER_URL=http://localhost:5002 node scripts/test-languages.mjs
 */
const URL = process.env.COMPILER_URL || "http://localhost:5001";

const sumTests = [
  { input: "2 3\n", expectedOutput: "5" },
  { input: "10 20\n", expectedOutput: "30" },
];

const cases = [
  { lang: "cpp",  want: "accepted", tests: sumTests, code: `#include <bits/stdc++.h>\nusing namespace std;\nint main(){int a,b;cin>>a>>b;cout<<a+b<<endl;}` },
  { lang: "c",    want: "accepted", tests: sumTests, code: `#include <stdio.h>\nint main(){int a,b;scanf("%d %d",&a,&b);printf("%d\\n",a+b);return 0;}` },
  { lang: "py",   want: "accepted", tests: sumTests, code: `a,b=map(int,input().split())\nprint(a+b)` },
  { lang: "js",   want: "accepted", tests: sumTests, code: `const [a,b]=input.split(/\\s+/).map(Number);\nconsole.log(a+b);` },
  { lang: "java", want: "accepted", tests: sumTests, code: `import java.util.*;\npublic class Main{public static void main(String[] x){Scanner s=new Scanner(System.in);System.out.println(s.nextInt()+s.nextInt());}}` },
  // go/rust are gated off in the prod image (1GB host). Set TEST_GO_RUST=1 to test
  // them after restoring the toolchains in the Dockerfile.
  ...(process.env.TEST_GO_RUST ? [
    { lang: "go",   want: "accepted", tests: sumTests, code: `package main\nimport "fmt"\nfunc main(){var a,b int;fmt.Scan(&a,&b);fmt.Println(a+b)}` },
    { lang: "rust", want: "accepted", tests: sumTests, code: `use std::io::*;\nfn main(){let mut s=String::new();stdin().read_to_string(&mut s).unwrap();let v:Vec<i64>=s.split_whitespace().map(|x|x.parse().unwrap()).collect();println!("{}",v[0]+v[1]);}` },
  ] : []),
  // Isolated-source error paths:
  { lang: "java", want: "runtime_error", tests: [{ input: "1 0\n", expectedOutput: "x" }], code: `public class Main{public static void main(String[] a){int[] z=new int[1];System.out.println(z[5]);}}` },
  { lang: "java", want: "compilation_error", tests: [{ input: "", expectedOutput: "" }], code: `public class Main{public static void main(String[] a){ this is not valid java }}` },
];

const judge = async (c) => {
  const body = JSON.stringify({
    language: c.lang,
    code: c.code,
    comparisonMode: "trimmed",
    testCases: c.tests,
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
      await new Promise((r) => setTimeout(r, 800));
    }
  }
};

let pass = 0, fail = 0;
for (const c of cases) {
  let got, detail = "";
  try {
    const r = await judge(c);
    got = r.verdict;
    if (got !== c.want) {
      if (r.compile && r.compile.success === false) detail = ` compileErr="${(r.compile.error || "").split("\n")[0]}"`;
      const bad = (r.results || []).find((x) => !x.passed);
      if (bad) detail += ` [status=${bad.status} out=${JSON.stringify(bad.output)} err="${(bad.error || "").split("\n")[0]}"]`;
    }
  } catch (e) {
    got = `ERROR(${e.message})`;
  }
  const ok = got === c.want;
  ok ? pass++ : fail++;
  console.log(`  ${ok ? "✓" : "✗"} ${c.lang.padEnd(5)} → ${got}${ok ? "" : ` (want ${c.want})${detail}`}`);
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
