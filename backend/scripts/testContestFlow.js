// End-to-end API test for the contests feature.
// Creates throwaway users/contest/problems (all prefixed __CTEST__),
// exercises the HTTP API on localhost, asserts behavior, and cleans up.
// Run: node scripts/testContestFlow.js
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import axios from "axios";
import { User } from "../models/userModel.js";
import { Problem } from "../models/problemModel.js";
import { Submission } from "../models/submissionModel.js";
import { Contest } from "../models/contestModel.js";
import { ContestParticipation } from "../models/contestParticipationModel.js";

const API = `http://localhost:${process.env.PORT || 5000}/api`;
const P = "__CTEST__";

let passed = 0;
let failed = 0;
const check = (name, cond, extra = "") => {
  if (cond) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    console.log(`  FAIL  ${name} ${extra}`);
  }
};

const cookieFor = (userId) =>
  `token=${jwt.sign({ userId }, process.env.JWT_KEY, { expiresIn: "1h" })}`;

const api = (cookie) =>
  axios.create({
    baseURL: API,
    headers: cookie ? { Cookie: cookie } : {},
    validateStatus: () => true, // assert statuses manually
  });

const cleanup = async () => {
  await User.deleteMany({ email: { $regex: P } });
  const contests = await Contest.find({ title: { $regex: P } });
  for (const c of contests) {
    await ContestParticipation.deleteMany({ contest: c._id });
  }
  await Problem.deleteMany({ title: { $regex: P } });
  const subs = await Submission.find().populate("user", "email");
  const testSubs = subs.filter((s) => s.user?.email?.includes(P));
  await Submission.deleteMany({ _id: { $in: testSubs.map((s) => s._id) } });
  await Contest.deleteMany({ title: { $regex: P } });
};

const makeUser = async (name, role = "user") => {
  const user = await User.create({
    email: `${P}${name}@test.local`,
    password: "not-a-real-login-password",
    name: `${P}${name}`,
    role,
    isVerified: true,
  });
  return user;
};

const PY_AC = `a,b=map(int,input().split())\nprint(a+b)`;
const PY_WA = `a,b=map(int,input().split())\nprint(a-b)`;

const main = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected. Cleaning leftovers from previous runs...");
  await cleanup();

  const admin = await makeUser("admin", "admin");
  const userA = await makeUser("alice");
  const userB = await makeUser("bob");
  const adminApi = api(cookieFor(admin._id));
  const aApi = api(cookieFor(userA._id));
  const bApi = api(cookieFor(userB._id));
  const guestApi = api(null);

  // ── 1. Contest CRUD ────────────────────────────────────────────────
  console.log("\n[1] Contest creation & validation");
  let res = await adminApi.post("/contests", {
    title: `${P}Contest`,
    description: "test contest",
    startTime: new Date(Date.now() + 60 * 60 * 1000),
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
  });
  check("admin creates contest (201)", res.status === 201, `got ${res.status}`);
  const contestId = res.data.contest?._id;

  res = await adminApi.post("/contests", {
    title: `${P}Bad`,
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 60 * 60 * 1000),
  });
  check("end before start rejected (400)", res.status === 400, `got ${res.status}`);

  res = await aApi.post("/contests", {
    title: `${P}NotAdmin`,
    startTime: new Date(Date.now() + 3600000),
    endTime: new Date(Date.now() + 7200000),
  });
  check("non-admin create rejected (403)", res.status === 403, `got ${res.status}`);

  // ── 2. Contest problems hidden ─────────────────────────────────────
  console.log("\n[2] Hidden contest problems");
  const mkProblem = (n, points) =>
    adminApi.post("/problems", {
      title: `${P}Problem ${n}`,
      statement: "Add two numbers.",
      difficulty: "Easy",
      tags: ["math"],
      inputFormat: "two ints",
      outputFormat: "sum",
      constraints: "small",
      sampleInput: "1 2",
      sampleOutput: "3",
      testCases: [
        { input: "1 2", expectedOutput: "3", isHidden: false },
        { input: "5 7", expectedOutput: "12", isHidden: true },
      ],
      contestId,
      points,
    });

  res = await mkProblem("A", 100);
  check("contest problem A created", res.status === 201, `got ${res.status}: ${JSON.stringify(res.data)}`);
  const probA = res.data.problem;
  res = await mkProblem("B", 200);
  check("contest problem B created", res.status === 201, `got ${res.status}`);
  const probB = res.data.problem;

  res = await guestApi.get("/problems");
  const publicTitles = (res.data.problems || []).map((p) => p.title);
  check(
    "contest problems hidden from public list",
    !publicTitles.some((t) => t.includes(P))
  );

  res = await guestApi.get(`/problems/search?query=${P}Problem`);
  check(
    "hidden from search",
    (res.data.problems || []).length === 0,
    `found ${(res.data.problems || []).length}`
  );

  res = await guestApi.get(`/problems/number/${probA.problemNumber}`);
  check("guest blocked from contest problem (403)", res.status === 403, `got ${res.status}`);
  check("403 includes contestId", res.data.contestId === contestId);

  res = await adminApi.get(`/problems/number/${probA.problemNumber}`);
  check("admin can view contest problem (200)", res.status === 200, `got ${res.status}`);

  // ── 3. Registration ────────────────────────────────────────────────
  console.log("\n[3] Registration");
  res = await aApi.post(`/contests/${contestId}/register`);
  check("user A registers (200)", res.status === 200, `got ${res.status}`);
  res = await aApi.post(`/contests/${contestId}/register`);
  check("repeat registration idempotent (200)", res.status === 200, `got ${res.status}`);
  res = await bApi.post(`/contests/${contestId}/register`);
  check("user B registers (200)", res.status === 200, `got ${res.status}`);
  res = await guestApi.post(`/contests/${contestId}/register`);
  check("guest register rejected (401)", res.status === 401, `got ${res.status}`);

  res = await aApi.get(`/problems/number/${probA.problemNumber}`);
  check(
    "registered user still blocked before start (403)",
    res.status === 403,
    `got ${res.status}`
  );

  res = await aApi.post("/submissions", {
    problemId: probA._id,
    code: PY_AC,
    language: "py",
    contestId,
  });
  check("submission before start rejected (403)", res.status === 403, `got ${res.status}`);

  // ── 4. Start the contest (shift window into the present) ───────────
  console.log("\n[4] Running contest");
  await Contest.updateOne(
    { _id: contestId },
    {
      startTime: new Date(Date.now() - 10 * 60 * 1000),
      endTime: new Date(Date.now() + 50 * 60 * 1000),
    }
  );

  res = await aApi.get(`/problems/number/${probA.problemNumber}`);
  check("registered user can view during contest (200)", res.status === 200, `got ${res.status}`);
  check("contestMeta present with points", res.data.contestMeta?.points === 100);
  check(
    "hidden test cases filtered",
    (res.data.problem?.testCases || []).every((tc) => !tc.isHidden)
  );

  res = await guestApi.get(`/problems/number/${probA.problemNumber}`);
  check("guest still blocked during contest (403)", res.status === 403, `got ${res.status}`);

  res = await guestApi.get(`/contests/${contestId}`);
  check("guest sees contest detail (200)", res.status === 200);
  check("guest doesn't get problems list", (res.data.contest?.problems || []).length === 0);

  res = await aApi.get(`/contests/${contestId}`);
  check(
    "participant gets problems list during contest",
    (res.data.contest?.problems || []).length === 2,
    `got ${(res.data.contest?.problems || []).length}`
  );
  check("serverTime included", typeof res.data.serverTime === "number");

  // ── 5. Contest submissions & scoring ───────────────────────────────
  console.log("\n[5] Submissions & scoring");

  // unregistered user C
  const userC = await makeUser("carol");
  const cApi = api(cookieFor(userC._id));
  res = await cApi.post("/submissions", {
    problemId: probA._id,
    code: PY_AC,
    language: "py",
    contestId,
  });
  check("unregistered submit rejected (403)", res.status === 403, `got ${res.status}`);

  // A: wrong attempt on A, then AC, then repeat AC
  res = await aApi.post("/submissions", {
    problemId: probA._id,
    code: PY_WA,
    language: "py",
    contestId,
  });
  check("A wrong answer recorded", res.data.verdict === "wrong_answer", `got ${res.data.verdict} ${JSON.stringify(res.data).slice(0, 200)}`);

  res = await aApi.post("/submissions", {
    problemId: probA._id,
    code: PY_AC,
    language: "py",
    contestId,
  });
  check("A accepted on problem A", res.data.verdict === "accepted", `got ${res.data.verdict}`);
  check("A gets +100", res.data.contestUpdate?.score === 100, `score=${res.data.contestUpdate?.score}`);

  res = await aApi.post("/submissions", {
    problemId: probA._id,
    code: PY_AC,
    language: "py",
    contestId,
  });
  check(
    "repeat AC doesn't double-count",
    res.data.contestUpdate?.score === 100,
    `score=${res.data.contestUpdate?.score}`
  );

  // B: solves A then B (300 total, but later lastAcceptedAt than A's 100? No — B has higher score)
  await bApi.post("/submissions", { problemId: probA._id, code: PY_AC, language: "py", contestId });
  res = await bApi.post("/submissions", { problemId: probB._id, code: PY_AC, language: "py", contestId });
  check("B reaches 300", res.data.contestUpdate?.score === 300, `score=${res.data.contestUpdate?.score}`);

  // non-contest problem submitted with contestId → rejected
  const stray = await Problem.findOne({ contest: null, isPublic: { $ne: false } });
  if (stray) {
    res = await aApi.post("/submissions", {
      problemId: stray._id,
      code: PY_AC,
      language: "py",
      contestId,
    });
    check("non-contest problem with contestId rejected (400)", res.status === 400, `got ${res.status}`);
  }

  // ── 6. Standings ───────────────────────────────────────────────────
  console.log("\n[6] Standings");
  res = await guestApi.get(`/contests/${contestId}/standings`);
  check("standings public (200)", res.status === 200, `got ${res.status}`);
  const rows = res.data.standings || [];
  check("two participants in standings", rows.length === 2, `got ${rows.length}`);
  check("B ranked first (300 pts)", rows[0]?.score === 300, `top=${rows[0]?.score}`);
  check("A ranked second (100 pts)", rows[1]?.score === 100, `second=${rows[1]?.score}`);
  check(
    "A's wrong attempt counted",
    rows[1]?.totalAttempts === 1,
    `attempts=${rows[1]?.totalAttempts}`
  );

  res = await aApi.get(`/contests/${contestId}/standings`);
  check("myRow present with rank 2", res.data.myRow?.rank === 2, `rank=${res.data.myRow?.rank}`);

  // ── 7. Contest end & release ───────────────────────────────────────
  console.log("\n[7] Contest end & lazy release");
  await Contest.updateOne(
    { _id: contestId },
    { endTime: new Date(Date.now() - 60 * 1000) }
  );

  res = await aApi.post("/submissions", {
    problemId: probB._id,
    code: PY_AC,
    language: "py",
    contestId,
  });
  check("submission after end rejected (403)", res.status === 403, `got ${res.status}`);

  // trigger lazy release via standings read
  res = await guestApi.get(`/contests/${contestId}/standings`);
  check("standings still served after end", res.status === 200);

  const released = await Contest.findById(contestId);
  check("problemsReleased flipped", released.problemsReleased === true);

  res = await guestApi.get(`/problems/number/${probA.problemNumber}`);
  check("problem public after release (200)", res.status === 200, `got ${res.status}`);

  res = await guestApi.get("/problems");
  check(
    "released problems in public list",
    (res.data.problems || []).some((p) => p.title === `${P}Problem A`)
  );

  // ── 8. History & deletion rules ────────────────────────────────────
  console.log("\n[8] History & deletion");
  res = await aApi.get("/contests/history/me");
  const hist = res.data.history || [];
  check("history has the contest", hist.length === 1, `got ${hist.length}`);
  check("history rank correct (A=2)", hist[0]?.rank === 2, `rank=${hist[0]?.rank}`);
  check("history score correct", hist[0]?.score === 100, `score=${hist[0]?.score}`);

  // running contest can't be deleted
  await Contest.updateOne(
    { _id: contestId },
    { startTime: new Date(Date.now() - 600000), endTime: new Date(Date.now() + 600000) }
  );
  res = await adminApi.delete(`/contests/${contestId}`);
  check("delete running contest blocked (400)", res.status === 400, `got ${res.status}`);

  // ended contest deletes fine, detaches public problems
  await Contest.updateOne({ _id: contestId }, { endTime: new Date(Date.now() - 1000) });
  res = await adminApi.delete(`/contests/${contestId}`);
  check("delete ended contest (200)", res.status === 200, `got ${res.status}`);
  const detached = await Problem.findById(probA._id);
  check("problem detached & public after delete", detached?.contest === null && detached?.isPublic === true);

  // ── Done ───────────────────────────────────────────────────────────
  console.log("\nCleaning up test data...");
  await cleanup();
  console.log(`\nRESULT: ${passed} passed, ${failed} failed`);
  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
};

main().catch(async (err) => {
  console.error("Test run crashed:", err);
  try {
    await cleanup();
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
