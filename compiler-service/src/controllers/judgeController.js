import path from "path";
import { existsSync, mkdirSync, unlink } from "fs";
import { resolveLanguage } from "../languages/index.js";
import { generateFile } from "../utils/generateFile.js";
import { compileSource } from "../utils/compile.js";
import { runInSandbox, Status } from "../utils/sandbox.js";
import { compareOutput } from "../comparators/index.js";
import { mapWithConcurrency } from "../utils/pool.js";

const outputDir = path.join(path.resolve(), "temp", "outputs");
if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

const RUN_CONCURRENCY = Number(process.env.RUN_CONCURRENCY) || 4;
const DEFAULT_TIME_LIMIT_MS = 3000;
const DEFAULT_MEMORY_LIMIT_MB = 256;

const safeUnlink = (file) => {
  if (file) unlink(file, () => {});
};

/**
 * Removes server-side temp paths (source + artifact) from an error message so
 * runtime errors don't leak the filesystem layout to users. Replaces them with
 * a friendly "main.<ext>" reference.
 */
const scrubPaths = (message, srcPath, artifactPath, extension) => {
  if (!message) return message;
  let out = message;
  const friendly = `main.${extension}`;
  for (const p of [srcPath, artifactPath].filter(Boolean)) {
    const base = path.basename(p);
    // Match file:// URIs and raw paths referencing the temp file/basename.
    out = out.split(`file:///${p.replace(/\\/g, "/")}`).join(friendly);
    out = out.split(p).join(friendly);
    out = out.split(p.replace(/\\/g, "/")).join(friendly);
    out = out.split(base).join(friendly);
  }
  return out;
};

/**
 * Prepares source, compiles once (if needed), and returns everything required
 * to run inputs against the produced artifact.
 *
 * @returns {Promise<{ ok, compile, execTarget, cleanup }>}
 */
const prepareExecutable = async (langConfig, code) => {
  const finalCode = langConfig.prepare ? langConfig.prepare(code) : code;
  const srcPath = generateFile(langConfig.extension, finalCode);
  const jobId = path.basename(srcPath).split(".")[0];

  const cleanupFiles = [srcPath];
  const cleanup = () => cleanupFiles.forEach(safeUnlink);

  if (!langConfig.needsCompile) {
    return {
      ok: true,
      compile: { success: true, error: null, warnings: null },
      execTarget: srcPath,
      srcPath,
      artifactPath: null,
      cleanup,
    };
  }

  const artifactPath = path.join(outputDir, langConfig.artifact(jobId));
  cleanupFiles.push(artifactPath);

  const compile = await compileSource(langConfig.compile(srcPath, artifactPath));
  if (!compile.success) {
    cleanup();
    return { ok: false, compile, execTarget: null, cleanup: () => {} };
  }

  return { ok: true, compile, execTarget: artifactPath, srcPath, artifactPath, cleanup };
};

/**
 * POST /compiler/judge
 * Compile once, run every test case (bounded parallelism), compare, return a verdict.
 *
 * Body: { code, language, testCases: [{ input, expectedOutput }],
 *         comparisonMode?, limits?: { timeLimitMs, memoryLimitMb },
 *         stopOnFirstFailure? }
 */
export const judgeRoute = async (req, res) => {
  const {
    code,
    language,
    testCases = [],
    comparisonMode = "trimmed",
    comparisonOptions = {},
    limits = {},
    stopOnFirstFailure = true,
  } = req.body;

  if (!code || !language) {
    return res
      .status(400)
      .json({ success: false, message: "Code and language are required" });
  }

  const langConfig = resolveLanguage(language);
  if (!langConfig) {
    return res.status(400).json({ success: false, message: "Unsupported language" });
  }

  const timeLimitMs = Number(limits.timeLimitMs) || DEFAULT_TIME_LIMIT_MS;
  const memoryLimitMb = Number(limits.memoryLimitMb) || DEFAULT_MEMORY_LIMIT_MB;

  try {
    const prepared = await prepareExecutable(langConfig, code);

    if (!prepared.ok) {
      return res.status(200).json({
        success: true,
        verdict: "compilation_error",
        compile: prepared.compile,
        failedCaseIndex: null,
        results: [],
        totalTimeMs: 0,
        avgTimeMs: 0,
        maxTimeMs: 0,
      });
    }

    const runOne = async (tc) => {
      const runCfg = langConfig.run(prepared.execTarget, { memoryLimitMb });
      const r = await runInSandbox({
        command: runCfg.command,
        args: runCfg.args,
        input: tc.input ?? "",
        cwd: outputDir,
        timeout: timeLimitMs,
        memoryLimitMb,
        useAddressSpaceLimit: langConfig.addressSpaceLimit !== false,
      });

      const passed =
        r.status === Status.OK &&
        compareOutput(comparisonMode, r.output, tc.expectedOutput ?? "", comparisonOptions);

      return {
        status: r.status,
        output: r.output,
        error: scrubPaths(r.error, prepared.srcPath, prepared.artifactPath, langConfig.extension),
        timeMs: r.time,
        passed,
      };
    };

    let results;
    if (stopOnFirstFailure) {
      // Sequential-with-early-exit keeps failures cheap; the common accepted path
      // still benefits from a single compile. Parallel mode below for full runs.
      results = [];
      for (const tc of testCases) {
        const r = await runOne(tc);
        results.push(r);
        if (!r.passed) break;
      }
    } else {
      results = await mapWithConcurrency(testCases, RUN_CONCURRENCY, runOne);
    }

    prepared.cleanup();

    const failedCaseIndex = results.findIndex((r) => !r.passed);
    const verdict = deriveVerdict(results);

    const times = results.map((r) => r.timeMs || 0);
    const totalTimeMs = times.reduce((a, b) => a + b, 0);

    return res.status(200).json({
      success: true,
      verdict,
      compile: prepared.compile,
      failedCaseIndex: failedCaseIndex === -1 ? null : failedCaseIndex,
      results,
      totalTimeMs,
      avgTimeMs: times.length ? Math.round(totalTimeMs / times.length) : 0,
      maxTimeMs: times.length ? Math.max(...times) : 0,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Judge failed",
      error: error.message || "Unknown error",
    });
  }
};

const deriveVerdict = (results) => {
  const failing = results.find((r) => !r.passed);
  if (!failing) return "accepted";
  switch (failing.status) {
    case Status.TLE:
      return "time_limit_exceeded";
    case Status.MLE:
      return "memory_limit_exceeded";
    case Status.RUNTIME_ERROR:
    case Status.INTERNAL:
      return "runtime_error";
    default:
      return "wrong_answer"; // status OK but output mismatch
  }
};

/**
 * POST /compiler/run
 * Single-input execution for the "Run" button. Reuses the judge pipeline with
 * one no-expected test case and returns the legacy { success, output, error, time } shape.
 */
export const runRoute = async (req, res) => {
  const { code, language, input = "", limits = {} } = req.body;

  if (!code || !language) {
    return res
      .status(400)
      .json({ success: false, message: "Code and language are required" });
  }

  const langConfig = resolveLanguage(language);
  if (!langConfig) {
    return res.status(400).json({ success: false, message: "Unsupported language" });
  }

  const timeLimitMs = Number(limits.timeLimitMs) || DEFAULT_TIME_LIMIT_MS;
  const memoryLimitMb = Number(limits.memoryLimitMb) || DEFAULT_MEMORY_LIMIT_MB;

  try {
    const prepared = await prepareExecutable(langConfig, code);

    if (!prepared.ok) {
      return res.status(400).json({
        success: false,
        output: null,
        error: prepared.compile.error,
        time: null,
      });
    }

    const runCfg = langConfig.run(prepared.execTarget, { memoryLimitMb });
    const r = await runInSandbox({
      command: runCfg.command,
      args: runCfg.args,
      input,
      cwd: outputDir,
      timeout: timeLimitMs,
      memoryLimitMb,
      useAddressSpaceLimit: langConfig.addressSpaceLimit !== false,
    });

    prepared.cleanup();

    const success = r.status === Status.OK;
    return res.status(success ? 200 : 400).json({
      success,
      output: success ? r.output : null,
      error: success
        ? null
        : scrubPaths(r.error, prepared.srcPath, prepared.artifactPath, langConfig.extension),
      time: r.time,
      status: r.status,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      output: null,
      error: error.message || "Unknown error",
      time: null,
    });
  }
};
