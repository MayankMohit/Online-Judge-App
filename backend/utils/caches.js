/**
 * Small in-process TTL caches. The backend runs as a single Node process (API +
 * BullMQ worker share it), so an in-memory cache is coherent for both judging and
 * reads. Entries expire on TTL and are also invalidated explicitly on writes.
 */

class TTLCache {
  constructor(ttlMs) {
    this.ttlMs = ttlMs;
    this.store = new Map();
  }

  get(key) {
    const hit = this.store.get(key);
    if (!hit) return undefined;
    if (Date.now() > hit.expires) {
      this.store.delete(key);
      return undefined;
    }
    return hit.value;
  }

  set(key, value) {
    this.store.set(key, { value, expires: Date.now() + this.ttlMs });
  }

  delete(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }
}

// Per-problem judging data (test cases + judgeConfig + limits). Invalidated on
// problem edit/delete; the TTL is just a safety net.
const problemJudgeCache = new TTLCache(5 * 60 * 1000);

// Read-heavy public lists. Short TTL + explicit invalidation on any problem write.
const publicListCache = new TTLCache(60 * 1000);

export const getCachedProblemJudge = (problemId) =>
  problemJudgeCache.get(String(problemId));

export const setCachedProblemJudge = (problemId, data) =>
  problemJudgeCache.set(String(problemId), data);

export const invalidateProblemJudge = (problemId) =>
  problemJudgeCache.delete(String(problemId));

export const getCachedList = (key) => publicListCache.get(key);
export const setCachedList = (key, value) => publicListCache.set(key, value);

// Any create/update/delete of a problem can change the public lists and (for
// update/delete) that problem's judging data.
export const invalidateProblemCaches = (problemId) => {
  publicListCache.clear();
  if (problemId) problemJudgeCache.delete(String(problemId));
};
