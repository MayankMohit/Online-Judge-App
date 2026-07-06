/**
 * Output comparators. Phase 0/1 ships `exact` and `trimmed`; Phase 4 adds
 * token / numeric / unordered / checker / function without touching callers.
 */

const normalizeTrimmed = (s) =>
  String(s ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, "")) // strip trailing whitespace per line
    .join("\n")
    .replace(/\n+$/g, ""); // strip trailing blank lines

const comparators = {
  exact: (actual, expected) => String(actual ?? "") === String(expected ?? ""),
  trimmed: (actual, expected) =>
    normalizeTrimmed(actual) === normalizeTrimmed(expected),
};

/**
 * @param {string} mode   comparison mode (defaults to "trimmed")
 * @param {string} actual program output
 * @param {string} expected expected output
 * @returns {boolean} whether the output is accepted
 */
export const compareOutput = (mode, actual, expected) => {
  const cmp = comparators[mode] || comparators.trimmed;
  return cmp(actual, expected);
};

export const supportedModes = Object.keys(comparators);
