import { readdir, stat, rm } from "fs/promises";
import path from "path";
import { codesDir, outputsDir, cacheDir } from "./paths.js";

/**
 * Periodic sweeper for the temp directories.
 *
 *  - codes/ and outputs/ hold per-job source + miss-path artifacts. These are
 *    normally deleted inline after each judge, so anything left is a leak from a
 *    crash. Delete entries older than TEMP_TTL_MS.
 *  - cache/ is the content-addressed compile cache (see compileCache.js). It's
 *    meant to persist, so we only trim it when it grows past CACHE_MAX_ENTRIES,
 *    evicting the least-recently-used entries and never touching one younger than
 *    CACHE_MIN_AGE_MS (so an entry can't be evicted out from under a running job).
 */

const SWEEP_INTERVAL_MS = Number(process.env.JANITOR_INTERVAL_MS) || 5 * 60 * 1000;
const TEMP_TTL_MS = Number(process.env.TEMP_TTL_MS) || 15 * 60 * 1000;
const CACHE_MAX_ENTRIES = Number(process.env.CACHE_MAX_ENTRIES) || 500;
const CACHE_MIN_AGE_MS = Number(process.env.CACHE_MIN_AGE_MS) || 15 * 60 * 1000;

const remove = (p) => rm(p, { recursive: true, force: true }).catch(() => {});

const sweepStale = async (dir, ttlMs) => {
  let entries;
  try {
    entries = await readdir(dir);
  } catch {
    return;
  }
  const now = Date.now();
  await Promise.all(
    entries.map(async (name) => {
      const full = path.join(dir, name);
      try {
        const s = await stat(full);
        if (now - s.mtimeMs > ttlMs) await remove(full);
      } catch {
        // vanished between readdir and stat — fine.
      }
    })
  );
};

const trimCache = async () => {
  let names;
  try {
    names = await readdir(cacheDir);
  } catch {
    return;
  }
  if (names.length <= CACHE_MAX_ENTRIES) return;

  const now = Date.now();
  const entries = [];
  for (const name of names) {
    const full = path.join(cacheDir, name);
    try {
      const s = await stat(full);
      entries.push({ full, mtimeMs: s.mtimeMs });
    } catch {
      // ignore
    }
  }

  // Oldest first; evict until back under the cap, skipping too-young entries.
  entries.sort((a, b) => a.mtimeMs - b.mtimeMs);
  let over = entries.length - CACHE_MAX_ENTRIES;
  for (const e of entries) {
    if (over <= 0) break;
    if (now - e.mtimeMs < CACHE_MIN_AGE_MS) continue;
    await remove(e.full);
    over--;
  }
};

const sweep = async () => {
  await sweepStale(codesDir, TEMP_TTL_MS);
  await sweepStale(outputsDir, TEMP_TTL_MS);
  await trimCache();
};

export const startJanitor = () => {
  // Run once shortly after boot, then on an interval. unref() so it never keeps
  // the process alive on its own.
  const timer = setInterval(() => {
    sweep().catch((err) => console.error("Janitor sweep failed:", err.message));
  }, SWEEP_INTERVAL_MS);
  if (typeof timer.unref === "function") timer.unref();
  sweep().catch(() => {});
  return timer;
};
