import axios from "axios";

const BASE_URL = process.env.COMPILER_URL || "http://localhost:5001";

/**
 * Runs a reference solution against every test case using the compiler's batch
 * judge, then either validates the stored expected outputs or generates them.
 *
 * @param {Object}  opts
 * @param {string}  opts.referenceLanguage
 * @param {string}  opts.referenceCode
 * @param {Array}   opts.testCases          [{ input, expectedOutput, isHidden }]
 * @param {string}  [opts.mode="trimmed"]   comparison mode
 * @param {Object}  [opts.limits]           { timeLimitMs, memoryLimitMb }
 * @param {boolean} [opts.generate=false]   true => fill expectedOutput from reference
 *
 * @returns {Promise<{
 *   ok: boolean,
 *   mode: string,
 *   generate: boolean,
 *   compileError: string|null,
 *   cases: Array<{ index, status, isHidden, input, expected, actual, passed, error }>,
 *   updatedTestCases: Array|null,   // present only when generate === true and ok
 *   message: string,
 * }>}
 */
export const validateReferenceSolution = async ({
  referenceLanguage,
  referenceCode,
  testCases = [],
  mode = "trimmed",
  limits = {},
  generate = false,
}) => {
  if (!referenceCode || !referenceLanguage) {
    return {
      ok: false,
      mode,
      generate,
      compileError: null,
      cases: [],
      updatedTestCases: null,
      message: "A reference solution (code + language) is required to validate test cases.",
    };
  }

  if (!testCases.length) {
    return {
      ok: false,
      mode,
      generate,
      compileError: null,
      cases: [],
      updatedTestCases: null,
      message: "At least one test case is required.",
    };
  }

  const { data: judge } = await axios.post(`${BASE_URL}/compiler/judge/`, {
    code: referenceCode,
    language: referenceLanguage,
    testCases: testCases.map((tc) => ({
      input: tc.input,
      // In generate mode there is no trusted expected yet.
      expectedOutput: generate ? "" : tc.expectedOutput,
    })),
    comparisonMode: mode,
    limits,
    stopOnFirstFailure: false, // run every case so admins see all problems at once
  });

  // The reference itself failed to compile — nothing can be validated.
  if (judge.verdict === "compilation_error") {
    return {
      ok: false,
      mode,
      generate,
      compileError: judge.compile?.error || "Reference solution failed to compile.",
      cases: [],
      updatedTestCases: null,
      message: "Reference solution failed to compile.",
    };
  }

  const results = judge.results || [];

  const cases = testCases.map((tc, i) => {
    const r = results[i] || {};
    const okStatus = r.status === "OK";
    // In generate mode a case is "good" if the reference ran cleanly.
    // In validate mode it must also match the stored expected output.
    const passed = generate ? okStatus : !!r.passed;
    return {
      index: i,
      status: r.status || "INTERNAL",
      isHidden: !!tc.isHidden,
      input: tc.input,
      expected: generate ? null : tc.expectedOutput,
      actual: r.output ?? null,
      passed,
      error: okStatus ? null : r.error || null,
    };
  });

  const ok = cases.every((c) => c.passed);

  let updatedTestCases = null;
  if (generate && ok) {
    updatedTestCases = testCases.map((tc, i) => ({
      input: tc.input,
      expectedOutput: results[i]?.output ?? "",
      isHidden: !!tc.isHidden,
    }));
  }

  return {
    ok,
    mode,
    generate,
    compileError: null,
    cases,
    updatedTestCases,
    message: ok
      ? generate
        ? "Expected outputs generated from the reference solution."
        : "All test cases validated against the reference solution."
      : generate
        ? "The reference solution errored on one or more inputs."
        : "The reference solution's output did not match one or more expected outputs.",
  };
};
