import { CircleCheckBig } from "lucide-react";

const difficultyConfig = {
  Easy:   { text: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/20" },
  Medium: { text: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20" },
  Hard:   { text: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20" },
};

const ProblemHeader = ({ problemNumber, title, difficulty, tags, isSolved }) => {
  const diff = difficultyConfig[difficulty] || { text: "text-zinc-400", bg: "bg-zinc-800", border: "border-zinc-700" };

  return (
    <div className="mb-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h1 className="text-lg font-bold text-white leading-snug">
          <span className="text-zinc-500 mr-1.5">#{problemNumber}</span>
          {title}
        </h1>
        {isSolved && (
          <CircleCheckBig size={18} className="text-green-400 shrink-0 mt-0.5" />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${diff.text} ${diff.bg} ${diff.border}`}>
          {difficulty}
        </span>
        {tags?.map((tag, i) => (
          <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-zinc-800 text-zinc-400 border border-zinc-700 capitalize">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ProblemHeader;