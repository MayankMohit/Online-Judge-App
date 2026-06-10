// Pulse-skeleton placeholders that mirror the contest layouts,
// so loading doesn't flash a full-screen spinner / layout jump.

const Bar = ({ className = "" }) => (
  <div className={`bg-zinc-800 rounded-md animate-pulse ${className}`} />
);

export const ContestCardSkeleton = () => (
  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
    <div className="flex items-start justify-between gap-3 mb-3">
      <Bar className="h-5 w-2/5" />
      <Bar className="h-5 w-16 rounded-full" />
    </div>
    <Bar className="h-3.5 w-4/5 mb-2" />
    <Bar className="h-3.5 w-3/5 mb-4" />
    <div className="flex items-center justify-between">
      <Bar className="h-4 w-28" />
      <Bar className="h-4 w-20" />
    </div>
  </div>
);

export const ContestDetailSkeleton = () => (
  <>
    {/* Header card */}
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <Bar className="h-6 w-1/2" />
        <Bar className="h-6 w-20 rounded-full" />
      </div>
      <Bar className="h-4 w-4/5 mb-2" />
      <Bar className="h-4 w-3/5 mb-5" />
      <div className="flex flex-wrap gap-x-5 gap-y-2 mb-5">
        <Bar className="h-3.5 w-44" />
        <Bar className="h-3.5 w-24" />
        <Bar className="h-3.5 w-24" />
      </div>
      <div className="flex items-center justify-between">
        <Bar className="h-6 w-36" />
        <Bar className="h-9 w-28 rounded-xl" />
      </div>
    </div>

    {/* Tabs */}
    <div className="flex gap-2 mb-5">
      <Bar className="h-9 w-24 rounded-xl" />
      <Bar className="h-9 w-24 rounded-xl" />
    </div>

    {/* Problem rows */}
    <div className="flex flex-col gap-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-4 py-3 rounded-xl border bg-zinc-900 border-zinc-800"
        >
          <Bar className="w-8 h-8 rounded-lg shrink-0" />
          <div className="flex-1 min-w-0">
            <Bar className="h-4 w-1/3 mb-1.5" />
            <Bar className="h-3 w-16" />
          </div>
          <Bar className="h-5 w-14 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  </>
);

export const StandingsSkeleton = () => (
  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
    <div className="border-b border-zinc-800 px-4 py-3 flex gap-6">
      <Bar className="h-3.5 w-10" />
      <Bar className="h-3.5 w-24" />
      <Bar className="h-3.5 w-12" />
    </div>
    {[0, 1, 2, 3, 4].map((i) => (
      <div key={i} className="border-b border-zinc-800/50 px-4 py-3.5 flex items-center gap-6">
        <Bar className="h-4 w-8" />
        <Bar className="h-4 w-32" />
        <Bar className="h-5 w-12 rounded-full" />
      </div>
    ))}
  </div>
);
