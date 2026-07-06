import { Queue } from "bullmq";
import IORedis from "ioredis";

const REDIS_URL = process.env.REDIS_URL;

// Background judging is enabled only when a Redis URL is configured. Without it,
// the controller falls back to synchronous judging so local dev works with no infra.
export const isQueueEnabled = !!REDIS_URL;
export const JUDGE_QUEUE = "judge";

// Worker connections must use maxRetriesPerRequest: null (BullMQ requirement for
// its blocking reads).
export const createWorkerConnection = () =>
  new IORedis(REDIS_URL, { maxRetriesPerRequest: null });

// Producer (Queue) connection: FAIL FAST when Redis is unreachable so the submit
// request never blocks. enableOfflineQueue:false makes commands reject immediately
// (rather than buffering) when the connection isn't ready — and because they don't
// buffer, they can't fire later and cause a double-judge.
const createQueueConnection = () =>
  new IORedis(REDIS_URL, {
    maxRetriesPerRequest: null,
    enableOfflineQueue: false,
    connectTimeout: 4000,
    retryStrategy: (times) => Math.min(times * 200, 2000),
  });

let judgeQueue = null;
const getJudgeQueue = () => {
  if (!isQueueEnabled) return null;
  if (!judgeQueue) {
    judgeQueue = new Queue(JUDGE_QUEUE, { connection: createQueueConnection() });
    // Prevent unhandled 'error' events (e.g., Redis down) from crashing the process.
    judgeQueue.on("error", (err) =>
      console.error("Judge queue Redis error:", err.message)
    );
  }
  return judgeQueue;
};

const withTimeout = (promise, ms, message) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
  ]);

// Belt-and-suspenders: even if ioredis hangs, this rejects after `ms` so the
// controller can fall back to synchronous judging.
export const enqueueJudge = (submissionId) =>
  withTimeout(
    getJudgeQueue().add(
      "judge",
      { submissionId },
      {
        attempts: 2,
        backoff: { type: "fixed", delay: 1000 },
        removeOnComplete: 500,
        removeOnFail: 500,
      }
    ),
    4000,
    "enqueue timed out (Redis unreachable)"
  );
