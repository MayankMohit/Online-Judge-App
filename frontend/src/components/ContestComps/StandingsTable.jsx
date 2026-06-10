import { RefreshCw } from "lucide-react";

const formatSolveTime = (solvedAt, startTime) => {
  const mins = Math.floor(
    (new Date(solvedAt).getTime() - new Date(startTime).getTime()) / 60000
  );
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h${String(m).padStart(2, "0")}m` : `${m}m`;
};

const ProblemCell = ({ stat, startTime }) => {
  if (!stat) return <span className="text-zinc-700">—</span>;
  if (stat.solved) {
    return (
      <div className="flex flex-col items-center leading-tight">
        <span className="text-green-400 font-semibold">+{stat.pointsEarned}</span>
        <span className="text-[10px] text-zinc-500">
          {formatSolveTime(stat.solvedAt, startTime)}
          {stat.attempts > 0 && ` · ${stat.attempts} WA`}
        </span>
      </div>
    );
  }
  if (stat.attempts > 0) {
    return <span className="text-red-400 text-xs font-semibold">-{stat.attempts}</span>;
  }
  return <span className="text-zinc-700">—</span>;
};

const Row = ({ row, problems, startTime, highlight }) => {
  const statByProblem = new Map(
    (row.problemStats || []).map((s) => [
      typeof s.problem === "object" ? s.problem._id : s.problem,
      s,
    ])
  );

  return (
    <tr
      className={`border-b border-zinc-800/50 transition ${
        highlight ? "bg-purple-500/10" : "hover:bg-zinc-800/50"
      }`}
    >
      <td className="py-3 px-4 font-bold text-sm text-zinc-400">#{row.rank}</td>
      <td className="py-3 px-4 font-medium text-white truncate max-w-[160px]">
        {row.user?.name || "Unknown"}
        {highlight && <span className="ml-2 text-xs text-purple-400">(you)</span>}
      </td>
      <td className="py-3 px-4">
        <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-semibold">
          {row.score}
        </span>
      </td>
      {problems.map((p) => (
        <td key={p.problem._id} className="py-3 px-2 text-center text-xs hidden sm:table-cell">
          <ProblemCell stat={statByProblem.get(p.problem._id)} startTime={startTime} />
        </td>
      ))}
    </tr>
  );
};

const StandingsTable = ({
  rows,
  myRow,
  problems,
  startTime,
  refreshing,
  page,
  totalPages,
  onPageChange,
}) => {
  const myRowOnPage = myRow && rows.some((r) => r.user?._id === myRow.user?._id);

  return (
    <div>
      {refreshing && (
        <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
          <RefreshCw size={12} className="animate-spin" />
          Updating…
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="py-3 px-4 text-left text-xs text-zinc-500 font-medium uppercase tracking-wider">Rank</th>
              <th className="py-3 px-4 text-left text-xs text-zinc-500 font-medium uppercase tracking-wider">Name</th>
              <th className="py-3 px-4 text-left text-xs text-zinc-500 font-medium uppercase tracking-wider">Score</th>
              {problems.map((p, i) => (
                <th
                  key={p.problem._id}
                  className="py-3 px-2 text-center text-xs text-zinc-500 font-medium uppercase tracking-wider hidden sm:table-cell"
                  title={p.problem.title}
                >
                  {String.fromCharCode(65 + i)}
                  <span className="block text-[10px] text-zinc-600 normal-case">{p.points}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3 + problems.length} className="py-8 text-center text-zinc-500">
                  No participants yet
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <Row
                  key={row.user?._id || row.rank}
                  row={row}
                  problems={problems}
                  startTime={startTime}
                  highlight={myRow && row.user?._id === myRow.user?._id}
                />
              ))
            )}
            {/* Pin the caller's row if it's not on this page */}
            {myRow && !myRowOnPage && (
              <Row row={myRow} problems={problems} startTime={startTime} highlight />
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4 text-sm">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 disabled:opacity-30 hover:text-white transition text-xs"
          >
            ← Prev
          </button>
          <span className="text-xs text-zinc-500">{page} / {totalPages}</span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 disabled:opacity-30 hover:text-white transition text-xs"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default StandingsTable;
