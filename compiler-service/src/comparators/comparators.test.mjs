/**
 * Comparator tests. Run with:  node src/comparators/comparators.test.mjs
 * No test framework needed — plain assertions, non-zero exit on failure.
 */
import { compareOutput } from "./index.js";

let passed = 0;
let failed = 0;

const check = (name, mode, actual, expected, options, want) => {
  const got = compareOutput(mode, actual, expected, options);
  if (got === want) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.log(`  ✗ ${name}  (mode=${mode}, got=${got}, want=${want})`);
  }
};

console.log("exact:");
check("identical", "exact", "5\n", "5\n", {}, true);
check("trailing space differs", "exact", "5 ", "5", {}, false);
check("trailing newline differs", "exact", "5\n", "5", {}, false);

console.log("trimmed (default):");
check("trailing newline ignored", "trimmed", "5\n", "5", {}, true);
check("trailing spaces per line ignored", "trimmed", "1 \n2  \n", "1\n2", {}, true);
check("crlf normalized", "trimmed", "1\r\n2\r\n", "1\n2", {}, true);
check("internal difference caught", "trimmed", "1\n3", "1\n2", {}, false);
check("leading space NOT ignored", "trimmed", " 5", "5", {}, false);

console.log("token:");
check("collapses all whitespace", "token", "1  2\n3\t4", "1 2 3 4", {}, true);
check("order matters", "token", "2 1", "1 2", {}, false);
check("count mismatch", "token", "1 2", "1 2 3", {}, false);
check("leading/trailing ws ignored", "token", "  1 2  ", "1 2", {}, true);

console.log("numeric:");
check("within default epsilon", "numeric", "2.0000001", "2", {}, true);
check("within given epsilon", "numeric", "0.1000001", "0.1", { epsilon: 1e-5 }, true);
check("outside epsilon", "numeric", "0.11", "0.1", { epsilon: 1e-5 }, false);
check("relative tolerance (large)", "numeric", "1000000.5", "1000000.4", { epsilon: 1e-6 }, true);
check("integer exact", "numeric", "42", "42", {}, true);
check("non-numeric falls back to exact", "numeric", "yes 3.0", "yes 3.0", {}, true);
check("non-numeric mismatch", "numeric", "no 3.0", "yes 3.0", {}, false);
check("count mismatch", "numeric", "1 2", "1 2 3", {}, false);

console.log("unordered:");
check("any order accepted", "unordered", "b\na\nc", "a\nb\nc", {}, true);
check("blank lines ignored", "unordered", "a\n\nb\n", "b\na", {}, true);
check("multiset (dup count matters)", "unordered", "a\na", "a", {}, false);
check("content mismatch", "unordered", "a\nx", "a\nb", {}, false);

console.log("fallbacks:");
check("unknown mode -> trimmed", "bogus", "5\n", "5", {}, true);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
