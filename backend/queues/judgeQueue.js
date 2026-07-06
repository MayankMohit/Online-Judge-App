import { Queue } from "bullmq";
import IORedis from "ioredis";

const REDIS_URL = process.env.REDIS_URL;

// Background judging is enabled only when a Redis URL is configured. Without it,
// the controller falls back to synchronous judging so local dev works with no infra.
export const isQueueEnabled = !!REDIS_URL;
export const JUDGE_QUEUE = "judge";

export const createRedisConnection = () =>
  new IORedis(REDIS_URL, { maxRetriesPerRequest: null });

let judgeQueue = null;
const getJudgeQueue = () => {
  if (!isQueueEnabled) return null;
  if (!judgeQueue) {
    judgeQueue = new Queue(JUDGE_QUEUE, { connection: createRedisConnection() });
  }
  return judgeQueue;
};

export const enqueueJudge = (submissionId) =>
  getJudgeQueue().add(
    "judge",
    { submissionId },
    {
      attempts: 2,
      backoff: { type: "fixed", delay: 1000 },
      removeOnComplete: 500,
      removeOnFail: 500,
    }
  );
