import { Link } from "react-router-dom";
import { CheckCircle2, Lock, ChevronRight } from "lucide-react";

const difficultyColor = {
  Easy: "text-green-400",
  Medium: "text-yellow-400",
  Hard: "text-red-400",
};

const ContestProblemRow = ({ contestId, entry, index, locked, solved, mockActive }) => {
  const problem = entry.problem;
  const label = String.fromCharCode(65 + index);
  const suffix = mockActive ? "?mock=1" : "";

  const inner = (
    <div
      className={`flex items-center gap-4 px-4 py-3 rounded-xl border transition ${
        locked
          ? "bg-zinc-900/50 border-zinc-800/50 cursor-not-allowed"
          : "bg-zinc-900 border-zinc-800 hover:border-purple-500/40 group"
      }`}
    >
      <span className="w-8 h-8 shrink-0 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm">
        {label}
      </span>

      <div className="flex-1 min-w-0">
        {locked ? (
          <p className="text-zinc-500 font-medium truncate">Hidden until contest starts</p>
        ) : (
          <>
            <p className="text-white font-medium truncate group-hover:text-purple-400 transition">
              {problem.title}
            </p>
            <p className={`text-xs ${difficultyColor[problem.difficulty] || "text-zinc-500"}`}>
              {problem.difficulty}
            </p>
          </>
        )}
      </div>

      <span className="shrink-0 px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-semibold">
        {entry.points} pts
      </span>

      {locked ? (
        <Lock size={16} className="text-zinc-600 shrink-0" />
      ) : solved ? (
        <CheckCircle2 size={18} className="text-green-400 shrink-0" />
      ) : (
        <ChevronRight size={16} className="text-zinc-600 group-hover:text-purple-400 transition shrink-0" />
      )}
    </div>
  );

  if (locked || !problem?.problemNumber) return inner;

  return (
    <Link to={`/contests/${contestId}/problems/${problem.problemNumber}${suffix}`}>{inner}</Link>
  );
};

export default ContestProblemRow;
