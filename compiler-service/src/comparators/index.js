/**
 * Output comparators.
 *
 *   exact     — byte-for-byte string equality.
 *   trimmed   — (default) ignore trailing whitespace per line + trailing blank
 *               lines; the effective "exact after cleanup" behavior.
 *   token     — compare the whitespace-separated token sequences; all runs of
 *               whitespace (spaces / tabs / newlines) are treated as one gap.
 *   numeric   — like `token`, but numeric tokens compare with a tolerance
 *               (absolute OR relative epsilon); non-numeric tokens must match exactly.
 *   unordered — compare the multiset of non-empty trimmed lines, order-independent
 *               (for problems where any ordering of the lines is correct).
 *
 * Phase 4b/4c add `checker` and `function` on top without touching callers.
 */

const DEFAULT_EPSILON = 1e-6;

const normalizeTrimmed = (s) =>
  String(s ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, "")) // strip trailing whitespace per line
    .join("\n")
    .replace(/\n+$/g, ""); // strip trailing blank lines

// Whitespace-separated tokens, empties dropped.
const tokenize = (s) =>
  String(s ?? "")
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 0);

// Non-empty, trimmed lines (order preserved by caller as needed).
const lines = (s) =>
  String(s ?? "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

const numbersClose = (x, y, epsilon) => {
  const diff = Math.abs(x - y);
  // Accept on absolute OR relative tolerance so both tiny and large magnitudes work.
  return diff <= epsilon || diff <= epsilon * Math.max(Math.abs(x), Math.abs(y));
};

const comparators = {
  exact: (actual, expected) => String(actual ?? "") === String(expected ?? ""),

  trimmed: (actual, expected) =>
    normalizeTrimmed(actual) === normalizeTrimmed(expected),

  token: (actual, expected) => {
    const a = tokenize(actual);
    const e = tokenize(expected);
    if (a.length !== e.length) return false;
    return a.every((t, i) => t === e[i]);
  },

  numeric: (actual, expected, { epsilon = DEFAULT_EPSILON } = {}) => {
    const a = tokenize(actual);
    const e = tokenize(expected);
    if (a.length !== e.length) return false;
    return a.every((t, i) => {
      const x = Number(t);
      const y = Number(e[i]);
      // If either token isn't a finite number, fall back to exact token match.
      if (!Number.isFinite(x) || !Number.isFinite(y)) return t === e[i];
      return numbersClose(x, y, epsilon);
    });
  },

  unordered: (actual, expected) => {
    const a = lines(actual).sort();
    const e = lines(expected).sort();
    if (a.length !== e.length) return false;
    return a.every((l, i) => l === e[i]);
  },
};

/**
 * @param {string} mode      comparison mode (defaults to "trimmed")
 * @param {string} actual    program output
 * @param {string} expected  expected output
 * @param {object} [options] mode-specific options, e.g. { epsilon } for numeric
 * @returns {boolean} whether the output is accepted
 */
export const compareOutput = (mode, actual, expected, options = {}) => {
  const cmp = comparators[mode] || comparators.trimmed;
  return cmp(actual, expected, options);
};

export const supportedModes = Object.keys(comparators);
