import { Link } from "react-router-dom";
import { Trophy, ArrowLeft } from "lucide-react";
import ContestTimer from "./ContestTimer";

// Slim bar shown above the problem view when solving inside a contest.
const ContestBanner = ({ contestMeta, serverTimeOffset, onPhaseChange, currentNumber }) => {
  if (!contestMeta) return null;

  const problems = contestMeta.problems || [];

  return (
    <div className="w-full flex items-center justify-between gap-3 px-4 py-2 bg-zinc-900 border-b border-purple-500/30">
      <Link
        to={`/contests/${contestMeta.id}`}
        className="flex flex-1 items-center gap-2 text-sm text-zinc-300 hover:text-purple-400 transition min-w-0"
      >
        <ArrowLeft size={14} className="shrink-0" />
        <Trophy size={14} className="text-purple-400 shrink-0" />
        <span className="font-medium truncate hidden sm:inline">{contestMeta.title}</span>
      </Link>

      {/* Problem switcher */}
      {problems.length > 0 && (
        <div className="flex items-center gap-1 shrink-0">
          {problems.map((p, i) => {
            const label = String.fromCharCode(65 + i);
            const isActive = p.problemNumber === Number(currentNumber);
            return (
              <Link
                key={p.problemNumber}
                to={`/contests/${contestMeta.id}/problems/${p.problemNumber}`}
                title={`${label}. ${p.title} (${p.points} pts)`}
                className={`w-7 h-7 flex items-center justify-center rounded-lg border text-xs font-bold transition ${
                  isActive
                    ? "bg-purple-600/30 border-purple-500/60 text-purple-300"
                    : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:border-purple-500/40"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      )}

      <div className="flex flex-1 items-center justify-end gap-4 shrink-0">
        {contestMeta.points != null && (
          <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold hidden sm:inline">
            {contestMeta.points} pts
          </span>
        )}
        <ContestTimer
          contest={{
            _id: contestMeta.id,
            startTime: contestMeta.startTime,
            endTime: contestMeta.endTime,
          }}
          serverTimeOffset={serverTimeOffset}
          onPhaseChange={onPhaseChange}
          compact
        />
      </div>
    </div>
  );
};

export default ContestBanner;
