// Shared pulse-skeleton placeholders. Each mirrors the layout of the real
// content it stands in for, so pages load without spinner flashes or jumps.

export const Bar = ({ className = "" }) => (
  <div className={`bg-zinc-800 rounded-md animate-pulse ${className}`} />
);

// ── Problems list ────────────────────────────────────────────────────────────
export const ProblemCardSkeleton = () => (
  <div className="w-[93vw] sm:w-full bg-zinc-900 border border-zinc-800 border-l-4 border-l-zinc-700 p-3 rounded-lg flex items-center justify-between gap-2">
    <div className="flex-1 min-w-0">
      <Bar className="h-4 w-1/2 mb-2" />
      <div className="flex gap-1.5">
        <Bar className="h-4 w-14 rounded-full" />
        <Bar className="h-4 w-16 rounded-full" />
      </div>
    </div>
    <div className="flex items-center gap-3 shrink-0">
      <Bar className="h-5 w-14 rounded-full" />
      <Bar className="h-5 w-5 rounded-full" />
    </div>
  </div>
);

// ── Leaderboard ──────────────────────────────────────────────────────────────
export const LeaderboardSkeleton = () => (
  <>
    {/* Podium */}
    <div className="grid grid-cols-3 gap-3 mb-6">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex flex-col items-center gap-2 p-4 rounded-2xl border bg-zinc-900 border-zinc-800"
        >
          <Bar className="h-7 w-10" />
          <Bar className="h-4 w-4/5" />
          <Bar className="h-3 w-14" />
        </div>
      ))}
    </div>
    {/* Table */}
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="border-b border-zinc-800 px-4 py-3 flex gap-8">
        <Bar className="h-3.5 w-10" />
        <Bar className="h-3.5 w-24" />
        <Bar className="h-3.5 w-14" />
      </div>
      {[...Array(7)].map((_, i) => (
        <div key={i} className="border-b border-zinc-800/50 px-4 py-3 flex items-center gap-8">
          <Bar className="h-4 w-8" />
          <Bar className="h-4 w-36" />
          <Bar className="h-5 w-10 rounded-full" />
        </div>
      ))}
    </div>
  </>
);

// ── Profile / dashboard ──────────────────────────────────────────────────────
const TableCardSkeleton = ({ rows = 4 }) => (
  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
    <Bar className="h-3.5 w-40 mb-4" />
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex items-center justify-between py-2.5 border-b border-zinc-800/50">
        <Bar className="h-4 w-1/3" />
        <Bar className="h-4 w-16" />
        <Bar className="h-4 w-20 hidden sm:block" />
      </div>
    ))}
  </div>
);

export const ProfileSkeleton = () => (
  <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-6">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Account card */}
      <div className="sm:col-span-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-4">
        <Bar className="h-3.5 w-24" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Bar className="h-4 w-4 rounded-full" />
            <Bar className="h-4 w-3/4" />
          </div>
        ))}
      </div>
      {/* Stats card with donut */}
      <div className="sm:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <Bar className="h-3.5 w-36 mb-4" />
        <div className="flex items-center gap-6">
          <div className="w-32 h-32 shrink-0 rounded-full border-[14px] border-zinc-800 animate-pulse" />
          <div className="flex flex-col gap-3 flex-1">
            {[...Array(3)].map((_, i) => (
              <Bar key={i} className="h-9 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
    <TableCardSkeleton rows={5} />
    <TableCardSkeleton rows={3} />
  </div>
);

// ── Admin lists (users / problems) ───────────────────────────────────────────
export const AdminListSkeleton = ({ rows = 5 }) => (
  <div className="flex flex-col gap-2">
    {[...Array(rows)].map((_, i) => (
      <div
        key={i}
        className="flex items-center justify-between bg-zinc-800/50 border border-zinc-800 rounded-xl px-3 py-2.5"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Bar className="h-8 w-8 rounded-full shrink-0" />
          <div className="flex-1 min-w-0">
            <Bar className="h-3.5 w-1/2 mb-1.5" />
            <Bar className="h-3 w-1/3" />
          </div>
        </div>
        <Bar className="h-5 w-12 rounded-full shrink-0" />
      </div>
    ))}
  </div>
);
