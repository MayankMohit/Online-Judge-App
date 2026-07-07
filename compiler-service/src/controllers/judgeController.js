import path from "path";
import { existsSync, unlink, rm, renameSync, utimesSync } from "fs";
import { resolveLanguage } from "../languages/index.js";
import { generateFile, generateIsolatedFile } from "../utils/generateFile.js";
import { compileSource } from "../utils/compile.js";
import { runInSandbox, Status } from "../utils/sandbox.js";
import { compareOutput } from "../comparators/index.js";
import { mapWithConcurrency } from "../utils/pool.js";
import { outputsDir } from "../utils/paths.js";
import {
  compileFlagSignature,
  computeCacheKey,
  cachedArtifactPath,
  cachedDirPath,
} from "../utils/compileCache.js";

const outputDir = outputsDir;

const RUN_CONCURRENCY = Number(process.env.RUN_CONCURRENCY) || 4;
const DEFAULT_TIME_LIMIT_MS = 3000;
const DEFAULT_MEMORY_LIMIT_MB = 256;
// Hard ceilings so a mis-set per-problem limit can't starve the VM.
const MAX_TIME_LIMIT_MS = Number(process.env.MAX_TIME_LIMIT_MS) || 10000;
const MAX_MEMORY_LIMIT_MB = Number(process.env.MAX_MEMORY_LIMIT_MB) || 512;
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

const safeUnlink = (file) => {
  if (file) unlink(file, () => {});
};

// Mark a cache entry as recently used so the janitor's LRU trim doesn't evict a
// hot artifact out from under a running job.
const touchCache = (p) => {
  try {
    const now = new Date();
    utimesSync(p, now, now);
  } catch {
    // best-effort; a missing/locked entry just won't be touched.
  }
};

// Atomically move a freshly compiled file artifact into the cache. On POSIX a
// rename over an existing file is an atomic replace (identical content, same key),
// so concurrent misses are safe. If the move fails and no cached copy exists, fall
// back to running the temp artifact directly.
const promoteFileToCache = (tmp, dest) => {
  try {
    renameSync(tmp, dest);
    return dest;
  } catch {
    if (existsSync(dest)) {
      safeUnlink(tmp);
      return dest;
    }
    return tmp;
  }
};

// Same, for isolated-source languages whose artifact is a whole directory. rename
// onto an existing non-empty dir throws, so on a race we drop ours and use the
// entry that won.
const promoteDirToCache = (tmpDir, destDir) => {
  try {
    renameSync(tmpDir, destDir);
    return destDir;
  } catch {
    if (existsSync(destDir)) {
      rm(tmpDir, { recursive: true, force: true }, () => {});
      return destDir;
    }
    return tmpDir;
  }
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

  // Isolated-source languages (e.g. Java) live in their own directory under a
  // fixed filename; the compiled output stays in that directory and `execTarget`
  // is the directory itself (used as the classpath / working root).
  if (langConfig.isolatedSource) {
    if (langConfig.needsCompile) {
      // Compile cache: key on language + flags + source. A hit runs the cached
      // classes directly with no compile step.
      const key = computeCacheKey(
        langConfig.id,
        compileFlagSignature(langConfig),
        finalCode
      );
      const cachedDir = cachedDirPath(key);
      if (existsSync(cachedDir)) {
        touchCache(cachedDir);
        return {
          ok: true,
          compile: { success: true, error: null, warnings: null, cached: true },
          execTarget: cachedDir,
          srcPath: null,
          artifactPath: null,
          cleanup: () => {},
        };
      }

      // Miss: compile in a per-job dir, then promote the whole dir into the cache.
      const { filePath: srcPath, dir } = generateIsolatedFile(
        langConfig.sourceName,
        langConfig.extension,
        finalCode
      );
      const compile = await compileSource(langConfig.compile(srcPath));
      if (!compile.success) {
        rm(dir, { recursive: true, force: true }, () => {});
        return { ok: false, compile, execTarget: null, cleanup: () => {} };
      }
      const execTarget = promoteDirToCache(dir, cachedDir);
      return { ok: true, compile, execTarget, srcPath: null, artifactPath: null, cleanup: () => {} };
    }

    // Non-compiled isolated language (none today) — no cache, clean up inline.
    const { filePath: srcPath, dir } = generateIsolatedFile(
      langConfig.sourceName,
      langConfig.extension,
      finalCode
    );
    return {
      ok: true,
      compile: { success: true, error: null, warnings: null },
      execTarget: dir,
      srcPath,
      artifactPath: null,
      cleanup: () => rm(dir, { recursive: true, force: true }, () => {}),
    };
  }

  // Interpreted single-file languages (Python, JS): keep the source around so
  // stack traces can be path-scrubbed, and clean it up after the run.
  if (!langConfig.needsCompile) {
    const srcPath = generateFile(langConfig.extension, finalCode);
    return {
      ok: true,
      compile: { success: true, error: null, warnings: null },
      execTarget: srcPath,
      srcPath,
      artifactPath: null,
      cleanup: () => safeUnlink(srcPath),
    };
  }

  // Compiled single-file languages (C, C++, Go, Rust) — content-addressed cache.
  const ext = path.extname(langConfig.artifact("x")).replace(/^\./, "");
  const key = computeCacheKey(
    langConfig.id,
    compileFlagSignature(langConfig),
    finalCode
  );
  const cachedArtifact = cachedArtifactPath(key, ext);
  if (existsSync(cachedArtifact)) {
    touchCache(cachedArtifact);
    return {
      ok: true,
      compile: { success: true, error: null, warnings: null, cached: true },
      execTarget: cachedArtifact,
      srcPath: null,
      artifactPath: null,
      cleanup: () => {},
    };
  }

  // Miss: write source, compile to a temp artifact, promote it into the cache.
  const srcPath = generateFile(langConfig.extension, finalCode);
  const jobId = path.basename(srcPath).split(".")[0];
  const tmpArtifact = path.join(outputDir, langConfig.artifact(jobId));
  const compile = await compileSource(langConfig.compile(srcPath, tmpArtifact));
  if (!compile.success) {
    safeUnlink(srcPath);
    safeUnlink(tmpArtifact);
    return { ok: false, compile, execTarget: null, cleanup: () => {} };
  }
  const execTarget = promoteFileToCache(tmpArtifact, cachedArtifact);
  safeUnlink(srcPath); // source no longer needed once compiled
  return { ok: true, compile, execTarget, srcPath: null, artifactPath: null, cleanup: () => {} };
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

  const timeLimitMs = clamp(
    Number(limits.timeLimitMs) || DEFAULT_TIME_LIMIT_MS,
    100,
    MAX_TIME_LIMIT_MS
  );
  const memoryLimitMb = clamp(
    Number(limits.memoryLimitMb) || DEFAULT_MEMORY_LIMIT_MB,
    16,
    MAX_MEMORY_LIMIT_MB
  );

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
      // Run in bounded-concurrency batches and stop after the first batch that
      // contains a failure. This keeps wrong answers cheap (early exit) while the
      // common accepted path — where every case passes — runs in parallel.
      results = [];
      for (let i = 0; i < testCases.length; i += RUN_CONCURRENCY) {
        const batch = testCases.slice(i, i + RUN_CONCURRENCY);
        const batchResults = await mapWithConcurrency(batch, RUN_CONCURRENCY, runOne);
        results.push(...batchResults);
        if (batchResults.some((r) => !r.passed)) break;
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

  const timeLimitMs = clamp(
    Number(limits.timeLimitMs) || DEFAULT_TIME_LIMIT_MS,
    100,
    MAX_TIME_LIMIT_MS
  );
  const memoryLimitMb = clamp(
    Number(limits.memoryLimitMb) || DEFAULT_MEMORY_LIMIT_MB,
    16,
    MAX_MEMORY_LIMIT_MB
  );

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
