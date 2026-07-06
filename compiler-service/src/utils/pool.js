/**
 * Runs `worker(item, index)` over `items` with at most `concurrency` in flight.
 * Results are returned in the original order. Avoids an extra dependency.
 */
export const mapWithConcurrency = async (items, concurrency, worker) => {
  const results = new Array(items.length);
  let next = 0;

  const runners = new Array(Math.min(concurrency, items.length))
    .fill(null)
    .map(async () => {
      while (true) {
        const i = next++;
        if (i >= items.length) return;
        results[i] = await worker(items[i], i);
      }
    });

  await Promise.all(runners);
  return results;
};
