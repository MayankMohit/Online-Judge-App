import { Worker } from "bullmq";
import {
  JUDGE_QUEUE,
  isQueueEnabled,
  createWorkerConnection,
} from "../queues/judgeQueue.js";
import { Submission } from "../models/submissionModel.js";
import {
  processSubmissionJudgement,
  markSubmissionError,
} from "../services/judgeService.js";

let worker = null;

/**
 * Starts the background judge worker. No-op when Redis isn't configured (the
 * controller judges synchronously in that case). Safe to call once at boot.
 */
export const startJudgeWorker = () => {
  if (!isQueueEnabled) return null;
  if (worker) return worker;

  const concurrency = Number(process.env.JUDGE_CONCURRENCY) || 4;

  worker = new Worker(
    JUDGE_QUEUE,
    async (job) => {
      const { submissionId } = job.data;
      await Submission.findByIdAndUpdate(submissionId, { status: "judging" });
      await processSubmissionJudgement(submissionId);
    },
    { connection: createWorkerConnection(), concurrency }
  );

  worker.on("failed", async (job, err) => {
    // On the final attempt, mark the submission errored so the client stops polling.
    if (job && job.attemptsMade >= (job.opts.attempts || 1)) {
      await markSubmissionError(job.data.submissionId, err.message).catch(() => {});
    }
  });

  worker.on("error", (err) => console.error("Judge worker error:", err.message));

  console.log(`⚙️  Judge worker started (concurrency ${concurrency})`);
  return worker;
};
