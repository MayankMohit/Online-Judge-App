import cron from "node-cron";
import { Contest } from "../models/contestModel.js";
import { compactProblemNumbers } from "../utils/renumberProblems.js";

const RETRY_DELAY_MS = 30 * 60 * 1000; // re-check every 30 min while a contest is live
let inProgress = false;

const isContestLive = () => {
  const now = new Date();
  return Contest.exists({ startTime: { $lte: now }, endTime: { $gte: now } });
};

const attemptRun = async () => {
  if (inProgress) return; // don't stack runs if a delayed one is still waiting
  inProgress = true;
  try {
    while (await isContestLive()) {
      console.log("[renumber-job] contest is live — delaying 30 minutes");
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }

    const changes = await compactProblemNumbers();
    if (changes.length === 0) {
      console.log("[renumber-job] problem numbers already compact");
    } else {
      changes.forEach((c) =>
        console.log(`[renumber-job] #${c.from} -> #${c.to}  ${c.title}`)
      );
      console.log(`[renumber-job] renumbered ${changes.length} problem(s)`);
    }
  } catch (err) {
    console.error("[renumber-job] failed:", err);
  } finally {
    inProgress = false;
  }
};

// Daily at 03:30 IST (quiet hours); waits out any live contest before running.
export const startRenumberJob = () => {
  cron.schedule("30 3 * * *", attemptRun, { timezone: "Asia/Kolkata" });
  console.log("[renumber-job] scheduled daily at 03:30 IST");
};
