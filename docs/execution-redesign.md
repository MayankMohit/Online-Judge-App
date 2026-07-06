# Code Execution Redesign Plan

> Status: **Planning**. Owner: Mayank. Last updated: 2026-07-06.
>
> Goal: make **run** and **submit** dramatically faster and more reliable, run
> judging as a background process, support LeetCode-style "many correct answers"
> judging, add more languages, and validate test cases at problem-creation time.
>
> Decisions locked in:
> - **Background judging** via **Redis + BullMQ** (new Redis container).
> - **Judging priority**: build toward the **function/driver (LeetCode) model**.

---

## 1. Current architecture

### Run (single / all)
```
Frontend (codeSlice.runCode / runAllTestCases)
  -> backend  POST /api/run            (runController.runCode)
  -> compiler POST /compiler/run       (runController.runRoute)
       generateFile()  -> temp/codes/<uuid>.<ext>
       (C/C++) g++ / gcc compile -> temp/outputs/<uuid>.exe
       runInSandbox()  -> spawn child, pipe stdin, 3s wall timeout
       delete temp files
  -> { success, output, error, time }
```
"Run All" fires **N parallel** HTTP calls from the browser (`Promise.all`).

### Submit
```
Frontend (codeSlice.submitCode)
  -> backend POST /api/submissions/    (submissionController.createSubmission)
       for (testCase of problem.testCases):          // SEQUENTIAL
         axios POST /compiler/run { code, language, input }
            -> compiler RE-GENERATES file + RE-COMPILES + runs one input
         classify verdict by string-matching error text
       save Submission, update User + contest scoring
  -> { verdict, averageTime, failedCase, contestUpdate }
```

### Files of interest
- `compiler-service/src/controllers/runController.js` — language `switch`.
- `compiler-service/src/compilers/{c,cpp,python,node}.js` — per-language exec.
- `compiler-service/src/utils/sandbox.js` — `spawn` + timeout, **no memory limit**.
- `compiler-service/src/utils/generateFile.js` — temp-file writer.
- `compiler-service/src/utils/cleanError.js` — regex error scrubber.
- `backend/controllers/submissionController.js` — the N-call sequential loop.
- `backend/controllers/runController.js` — thin proxy to compiler.
- `backend/models/{problemModel,submissionModel}.js` — schemas.
- `frontend/src/features/code/codeSlice.js` — run/submit thunks.

---

## 2. Problems

### Performance
1. **C/C++ recompiled once per test case.** A 10-case submit compiles the same
   source 10x. Compile must happen **once**, binary runs N times.
2. **Test cases run strictly sequentially** on submit, one blocking HTTP hop each.
3. **Cold process startup** every run (Python/Node interpreter boot each time).
4. **No binary cache, no result cache** — identical work recomputed.
5. **Submit holds the HTTP connection open** for the whole judging run.

### Correctness / reliability (real bugs)
6. **Warnings treated as compile errors.** `c.js`: `if (code !== 0 || compileError)`;
   `cpp.js`: `compileError.trim() !== ""`. Any stderr warning fails a valid compile.
7. **Verdict classification by string matching** (`error.includes("time limit")`,
   `includes("error:")`) — fragile and locale/compiler dependent.
8. **No memory limit** in sandbox; only a 3s wall timeout. Runs as **root** in a
   shared writable temp dir with no fs jail. A committed stray `.exe` in
   `temp/outputs` shows cleanup isn't reliable.
9. **Brittle Node stdin wrapper** (`readFileSync(0)`) and over-aggressive
   `cleanError` regex.

### Feature gaps
10. **Exact string comparison only** — no "many correct outputs".
11. **Only 4 languages** (cpp, c, py, js), added via `switch`, no registry.
12. **No test-case validation** on problem create/edit — expected outputs trusted blindly.

---

## 3. Target architecture

```
                        ┌─────────────────────────────────────────┐
Frontend ──/api/run───▶ │ Backend (Express)                       │
         ──/api/submissions──▶ enqueue judge job (BullMQ) ──────┐ │
                        │ return 202 { submissionId, "judging" } │ │
                        │ GET /api/submissions/:id/status (poll) │ │
                        │        or SSE/WS push                   │ │
                        └────────────────────────────────────────┘ │
                                                                    ▼
                                                    ┌───────────────────────────┐
                                                    │ Redis (BullMQ queue)      │
                                                    └───────────────────────────┘
                                                                    │
                                                                    ▼
                                             ┌────────────────────────────────────┐
                                             │ Judge Worker(s)                     │
                                             │  POST /compiler/judge (batch)       │
                                             │   compile ONCE                      │
                                             │   run all inputs w/ p-limit conc.   │
                                             │   compare via comparisonMode/checker│
                                             │  write verdict -> Submission        │
                                             └────────────────────────────────────┘
                                                                    │
                                                                    ▼
                                             ┌────────────────────────────────────┐
                                             │ Compiler service (language registry)│
                                             │  isolate/nsjail sandbox, mem+cpu+fs │
                                             │  binary cache, warm pools           │
                                             └────────────────────────────────────┘
```

Key shifts:
- **Batch judge endpoint** (compile once, run many, parallel).
- **Language registry** replaces the `switch` (data-driven config per language).
- **Background judging** via BullMQ so submit returns instantly.
- **Pluggable answer checking** (comparison modes → custom checker → function/driver).
- **Real sandbox** with memory/cpu/fs limits.

---

## 4. Phased plan

Each phase is independently shippable. Suggested order: 0 → 1 → 6 → 2 → 4 → 5 → 3,
with the function/driver judge (4c) as the flagship long-term item.

### Phase 0 — Correctness quick wins ✅ DONE (2026-07-06)
- [x] Fix warning-as-error: fail compile only on **non-zero exit code**; stderr on
      exit 0 is returned as `warnings`, not `error`. (`utils/compile.js`)
- [x] Add resource limits to sandbox runs. On Linux, wrap in
      `sh -c 'ulimit -t <s>; [ulimit -v <kb>;] exec …'`; `timeLimitMs` /
      `memoryLimitMb` are params. (`utils/sandbox.js`)
- [x] Return a **structured status enum** from sandbox:
      `OK | RUNTIME_ERROR | TLE | MLE | INTERNAL` (compile status lives on the
      judge response's `compile` object).
- [x] Backend maps status/verdict directly — string-matching deleted.
- [x] Bonus: 1 MB output cap, runtime-error **path scrubbing** (no temp paths
      leaked), added `memory_limit_exceeded` verdict to `submissionModel`.

**Implementation notes / gotchas discovered:**
- Alpine runtime image ships **busybox `sh`, not `bash`** → sandbox uses `sh`.
- `ulimit -v` **breaks Node/JVM** (they reserve huge virtual memory regardless of
  heap). Per-language `addressSpaceLimit` flag: true for c/cpp/py, **false for js**
  (Node capped via `--max-old-space-size` instead). JVM later: same treatment.
- MLE detection is heuristic in Phase 0 (bad_alloc / OOM signatures); precise MLE
  comes with `isolate` in Phase 3.

Files: `utils/sandbox.js`, `utils/compile.js`, `languages/index.js`,
`controllers/judgeController.js`, backend `submissionController.js`, `submissionModel.js`.

### Phase 1 — Compile-once batch judging (biggest speed win) ✅ DONE (2026-07-06)
- [x] New endpoint `POST /compiler/judge`:
      `{ code, language, testCases:[{input,expectedOutput}], comparisonMode?, limits?, stopOnFirstFailure? }`
      → compile once → run each input against the single artifact →
      per-case `{status, output, error, timeMs, passed}` → overall
      `{ verdict, compile, failedCaseIndex, results, totalTimeMs, avgTimeMs, maxTimeMs }`.
      `stopOnFirstFailure` (default true) short-circuits; else runs all cases with a
      **bounded-concurrency** limiter (`mapWithConcurrency`, default 4, no new dep).
- [x] Refactored compiler into a **language registry** (`languages/index.js`);
      the per-language `switch` and `compilers/*.js` files are deleted. Adding a
      language = one config entry.
- [x] `/compiler/run` (single "Run") reuses the same pipeline (one no-expected case).
- [x] Rewrote `submissionController` to make **one** `/compiler/judge` call — the
      N-call sequential loop (which recompiled C/C++ per test case) is gone.
- [x] Added `comparators/index.js` (`exact`, `trimmed`; default `trimmed`) so
      Phase 4 extends checking without touching callers.

**Result:** C/C++ submit now compiles once instead of once-per-test-case; verdicts
come from structured statuses, not string matching. Verified locally for **JS**
(accepted / wrong_answer / runtime_error / TLE / compile-error / unsupported-lang).

⚠️ **Still to validate:** the **C/C++ compile path** and the **Linux `sh`/`ulimit`
sandbox** (memory + CPU limits) can only be exercised in a Linux/Docker environment,
not on the Windows dev box. Run `docker compose up --build` (or build just
compiler-service) and re-run the judge tests for `c`/`cpp` plus a memory-bomb and
CPU-spin case. Note: rebuild fresh — the old cached compose containers carry stale
env and pre-Phase-0 code.

Files: `compiler-service/src/languages/index.js`,
`compiler-service/src/controllers/judgeController.js`,
`compiler-service/src/utils/{compile,pool,sandbox}.js`,
`compiler-service/src/comparators/index.js`,
`compiler-service/src/routes/runRoute.js`, `backend/controllers/submissionController.js`.
Removed: `compiler-service/src/controllers/runController.js`, `src/compilers/*`.

### Phase 2 — Background judging + queue (Redis + BullMQ) ✅ DONE (2026-07-06)
- [x] Added **Redis** service (+ persistent volume) to `docker-compose.yml`;
      `bullmq` + `ioredis` deps installed in backend.
- [x] Extracted all judging + user-stats + contest-scoring logic into a shared
      **`judgeService.processSubmissionJudgement(submissionId)`** used by both paths.
- [x] `createSubmission` now: runs **contest validation at arrival time**, persists
      the submission (`status:"queued"`, `submittedAt` = arrival, preserving contest
      ordering), then **enqueues** and returns `202 { submissionId, status:"judging" }`.
- [x] **Judge worker** (`workers/judgeWorker.js`, BullMQ `Worker`, concurrency via
      `JUDGE_CONCURRENCY`) consumes the queue → `status:"judging"` →
      `processSubmissionJudgement` → `status:"completed"`; failed jobs after retries
      mark `status:"error"`. Runs **in-process** in the backend (started from
      `index.js`), so no separate container is required.
- [x] **Polling** delivery: `GET /api/submissions/:id/status` (owner-only) +
      `codeSlice.submitCode` now handles both a synchronous response and a 202 →
      poll loop (fast then backing off, ~60s cap). Same Redux reducers as before.
- [x] **Safe fallback**: when `REDIS_URL` is unset the queue is disabled and the
      controller judges **synchronously inline** (identical to pre-Phase-2 behavior),
      so local dev needs no Redis. `submissionModel` gained
      `status / failedCase / contestResult / judgeError`.

**Verified:** enqueue→worker round-trip and worker→real-compiler-judge (`accepted`)
tested against a live Redis container; queue enable/disable + no-op worker without
`REDIS_URL` confirmed; frontend lints clean. Full HTTP submit→poll path (auth + Atlas)
not exercised here — needs the running stack.

**Known minor edge:** an in-flight submission briefly shows the model's default
verdict in history lists until judging completes (~1–3s); the `status` field
distinguishes it. Revisit if it matters.

Files: `docker-compose.yml`, `backend/queues/judgeQueue.js`,
`backend/workers/judgeWorker.js`, `backend/services/judgeService.js`,
`backend/models/submissionModel.js`, `backend/controllers/submissionController.js`,
`backend/routes/submissionRouter.js`, `backend/index.js`,
`frontend/src/features/code/codeSlice.js`.

### Phase 3 — Sandbox hardening + perf polish (~3 days)
- [ ] Real isolation via **`isolate`** (IOI/Codeforces) or **nsjail** in the
      compiler image: cpu-time + wall-time + memory + process + fs limits,
      non-root, read-only rootfs.
- [ ] **Binary cache**: key `hash(source + language + flags)` → reuse artifact
      across run/submit and across users.
- [ ] **Result cache** for identical `(code, language, input)`.
- [ ] Optional **warm pools** for Python/Node to remove interpreter startup cost.

Files: `compiler-service/Dockerfile`, `sandbox.js` → `isolateRunner.js`,
`compiler-service/src/cache/*`.

### Phase 4 — Flexible answer checking (LeetCode-style) (staged)
Add `judgeConfig` to `problemModel`:
```js
judgeConfig: {
  mode: { type: String, enum:
    ["exact","trimmed","token","numeric","unordered","checker","function"],
    default: "trimmed" },
  epsilon: Number,               // numeric mode
  checker: { language, code },   // checker mode
  function: {                    // function/driver mode
    name: String,                // e.g. "twoSum"
    params: [{ name, type }],    // typed signature for driver codegen
    returnType: String,
    comparator: String,          // "exact" | "unordered" | "set" | custom
    drivers: { cpp:String, py:String, js:String, java:String } // generated/cached
  }
}
```

- [x] **4a. Comparison modes** ✅ DONE (2026-07-06): `exact`, `trimmed`, `token`,
      `numeric` (absolute-OR-relative epsilon), `unordered` (order-independent line
      multiset). Implemented in `comparators/index.js`; `compareOutput(mode, actual,
      expected, options)` gained an `options` arg (carries `epsilon`). `/compiler/judge`
      accepts `comparisonOptions`; `judgeService` and `validationService` pass
      `{ epsilon }` from `problem.judgeConfig`. `problemModel.judgeConfig` gained
      `epsilon`; create/update/validate controllers thread `comparisonEpsilon`. Admin
      UI (`ReferenceSolutionSection`) exposes all five modes + a numeric-only epsilon
      input. 12 comparator unit cases pass; frontend lints clean.
- [ ] **4b. Custom checker** (Codeforces/`testlib` style): admin supplies a
      checker program receiving `(input, userOutput, expectedOutput)` → accept/reject.
      Judge runs the checker instead of string compare.
- [ ] **4c. Function/driver model (FLAGSHIP)** — true LeetCode experience:
      - Problem stores a **typed function signature** (name, params, return type).
      - Per-language **driver templates** parse the test input into typed args,
        call the user's function, serialize the return value.
      - A **comparator** validates the return (handles unordered results,
        multiple valid answers, float tolerance).
      - User writes only the function body; the driver is generated/cached per
        language. Store a **starter stub** per language on the problem so the
        editor pre-fills the signature.
      - Test cases become **structured** (typed args + expected return) rather
        than raw stdin/stdout.

Files: `compiler-service/src/comparators/*`,
`compiler-service/src/drivers/<lang>/*`, `backend/models/problemModel.js`,
admin problem form + `ProblemDescriptionPanel`/editor starter-stub wiring.

### Phase 5 — More languages + reliability — ✅ DONE (Java/Go/Rust) 2026-07-06
- [x] Added **Java, Go, Rust** as registry entries + Docker toolchain layers
      (`openjdk21`, `go`, `rust`). Java (JVM) and Go both reserve large virtual
      memory → `addressSpaceLimit:false` (Java capped via `-Xmx`, like Node); Rust is
      a native binary → `ulimit -v` applies. Go/Rust compile to a single binary and
      reuse the existing artifact model; Java uses a new **isolated-source** path.
- [x] **Isolated-source support** (`generateIsolatedFile` + `isolatedSource` flag):
      Java source is written as `Main.java` in a per-job directory so concurrent
      jobs don't clobber each other's `Main.class`; `execTarget` is the directory,
      run = `java -cp <dir> Main`. Verified collision-free under 4-way concurrency.
- [x] `submissionModel.language` enum extended (`java`,`go`,`rust`); frontend
      selector now renders them from `languageBoilerplates` (starter stubs added),
      `backendLanguageMap` passes the ids through, C++ label fixed to "C++".
- [x] Existing C/C++ already hardened in Phase 0/1 (`-O2 -std=c++17 -lm`, warnings
      ≠ errors) and Phase-5-adjacent PCH work (sub-second C++ compiles).

**Verified in-container** (`scripts/test-languages.mjs`): all 7 languages
(cpp/c/py/js/java/go/rust) judge a stdin "sum" program → accepted; Java isolated
path yields correct `runtime_error` and `compilation_error`; 4-way Java concurrency
collision-free; timings healthy (rust ~170ms, go ~300ms, java ~650ms wall incl compile).

**Gated off in prod (2026-07-06):** Go + Rust toolchains removed from the Docker
image and disabled in the UI selector to keep the image small on the **1GB-RAM host**.
Registry entries + isolated-source machinery remain; re-enable by restoring the
Dockerfile `go rust` layer (+ Go env) and dropping them from the selector's disabled
list. **Java stays enabled.**

**Deferred (heavier musl toolchains / image bloat):** C#, Kotlin, TypeScript.
TypeScript needs a transpile step (esbuild/tsc); C# (`dotnet`) and Kotlin (`kotlinc`)
add large layers and slow startup. Add later as demand warrants — the registry +
isolated-source machinery already supports whatever plumbing they need.

Files: `compiler-service/src/languages/index.js`,
`compiler-service/src/utils/generateFile.js`,
`compiler-service/src/controllers/judgeController.js`,
`compiler-service/Dockerfile`, `backend/models/submissionModel.js`,
`frontend/src/components/ProblemPageComps/{LanguageBoilerplates,CodeEditorPanel}.jsx`,
`frontend/src/pages/mainPages/ProblemDetailsPage.jsx`,
`compiler-service/scripts/test-languages.mjs`.

### Phase 6 — Admin test-case validation ✅ DONE (2026-07-06)
- [x] Added **reference solution** (`referenceSolution {language, code}`),
      `judgeConfig.mode`, and optional `limits` to `problemModel` (persisted for
      re-validation on future edits).
- [x] `validateReferenceSolution` service (`backend/services/validationService.js`)
      runs the reference against all inputs via `/compiler/judge`
      (`stopOnFirstFailure:false`):
      - **Validate mode**: reference output must match stored `expectedOutput`.
      - **Generate mode**: auto-fills `expectedOutput` from the reference.
      - Reports per-case `{status, passed, expected, actual, error, isHidden}` and
        surfaces reference compile errors.
- [x] **Enforced in `createProblem`/`updateProblem`**: persistence is blocked
      unless validation passes; a reference is required (explicit `validationMode:"skip"`
      overrides). `updateProblem` **only re-validates when test cases actually change**
      (normalized deep-compare) so metadata-only edits don't need a reference.
- [x] Standalone **`POST /api/problems/validate`** (admin) dry-run endpoint powers a
      "Validate" button without saving.
- [x] Frontend: `ReferenceSolutionSection.jsx` (CodeMirror editor + language +
      comparison-mode + validate/generate toggle + per-case results), wired into
      `ProblemManagement`; create/update payloads carry the reference fields;
      validation failures surface as clear toasts. `validateTestCases` thunk added.

**Verified:** validation service + validate controller tested against the live
compiler — validate (match/mismatch), generate (JS + Python), and reference
compile-error paths all behave correctly. Frontend lints clean (0 errors).
**Note:** ~~comparison modes exposed in the UI are limited to `exact`/`trimmed`~~
Superseded by Phase 4a — all five modes (`exact`/`trimmed`/`token`/`numeric`/`unordered`)
are now live in the comparators and exposed in the admin UI.

Files: `backend/models/problemModel.js`, `backend/services/validationService.js`,
`backend/controllers/problemController.js`, `backend/routes/problemRouter.js`,
`frontend/src/components/Admin/ReferenceSolutionSection.jsx`,
`frontend/src/components/Admin/AllDialogBoxes.jsx`,
`frontend/src/pages/adminPages/ProblemManagement.jsx`,
`frontend/src/features/problems/problemMutationSlice.js`.

---

## 5. Data-model changes summary
- `submissionModel`: add `status` (`judging|done|error`), optional
  `perCase` summary, `memoryKb`. Extend `language` enum in Phase 5.
- `problemModel`: add `judgeConfig` (Phase 4); optional `limits`
  (`timeLimitMs`, `memoryLimitMb`); optional reference-solution fields (Phase 6);
  structured test cases for function mode (Phase 4c).

## 6. Rollout / safety
- Keep `/compiler/run` working throughout; `/compiler/judge` is additive.
- Ship Phase 0+1 behind no flag (pure win). Gate Phase 2 background judging
  behind a feature flag until polling UX is verified.
- Default `judgeConfig.mode = "trimmed"` so existing problems keep working
  (today's behavior is effectively exact-after-trim).

## 7. Effort / impact snapshot
| Phase | Effort | Impact |
|------|--------|--------|
| 0 Correctness fixes | ½d | High (fixes real bugs) |
| 1 Batch compile-once | 2d | **Highest** (speed) |
| 6 Admin validation | 1d | High (data quality) |
| 2 Background + queue | 2–3d | High (UX, scale) |
| 4a/4b Checkers | 1–2d | Medium-High |
| 5 More languages | 2d | Medium |
| 3 Sandbox hardening | 3d | High (security/reliability) |
| 4c Function/driver | 4d+ | **Flagship** (LeetCode UX) |
