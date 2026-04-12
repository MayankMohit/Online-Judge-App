import { useState, useEffect } from "react";
import { Search, Pencil, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAdminProblems } from "../../hooks/adminHooks/adminProblemsHooks";

export default function AdminProblemList({ adminId }) {
  const navigate = useNavigate();
  const { problems, loading, error, fetchByAdmin } = useAdminProblems();
  const [searchProblem, setSearchProblem] = useState("");

  useEffect(() => {
    if (adminId) fetchByAdmin(adminId);
  }, [adminId, fetchByAdmin]);

  const filteredProblems = problems.filter((p) =>
    p.title.toLowerCase().includes(searchProblem.toLowerCase())
  );

  const difficultyStyle = {
    Easy:   "bg-green-500/10 text-green-400 border border-green-500/30",
    Medium: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30",
    Hard:   "bg-red-500/10 text-red-400 border border-red-500/30",
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3 h-full">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">My Problems</h2>
        <button
          className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-sm transition"
          onClick={() => navigate("/admin/problem/new")}
        >
          <Plus size={14} />
          Add Problem
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 focus-within:border-purple-500 transition-colors">
        <Search size={15} className="text-zinc-500 shrink-0" />
        <input
          type="text"
          value={searchProblem}
          onChange={(e) => setSearchProblem(e.target.value)}
          placeholder="Search problems..."
          className="bg-transparent text-sm text-white w-full px-2 focus:outline-none placeholder-zinc-500"
        />
      </div>

      {loading && problems.length === 0 && (
        <p className="text-zinc-500 text-sm">Loading problems...</p>
      )}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* Problem list */}
      <div className="flex flex-col gap-2 overflow-y-auto flex-1 min-h-[50vh] max-h-[65vh] pr-1 custom-scrollbar">
        {filteredProblems.map((problem) => {
          const { problemNumber, title, difficulty, tags = [], _id } = problem;
          const visibleTags = tags.slice(0, 3);
          const extraTags = tags.length > 3 ? tags.length - 3 : 0;

          return (
            <div
              key={_id}
              className="px-3 py-3 bg-zinc-800 border border-zinc-700 rounded-xl flex justify-between items-start hover:bg-zinc-700 hover:border-zinc-600 transition cursor-pointer group"
              onClick={() => navigate(`/problems/${problemNumber}`)}
            >
              <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-zinc-500 shrink-0">#{problemNumber}</span>
                  <p className="font-medium text-sm text-white truncate">{title}</p>
                  <span className={`px-2 py-0.5 text-xs rounded-full font-semibold shrink-0 ${difficultyStyle[difficulty]}`}>
                    {difficulty}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {visibleTags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-0.5 text-xs rounded-full bg-zinc-700 text-zinc-400 border border-zinc-600">
                      {tag}
                    </span>
                  ))}
                  {extraTags > 0 && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-zinc-700 text-zinc-500">
                      +{extraTags}
                    </span>
                  )}
                </div>
              </div>

              {/* Edit Icon */}
              <button
                className="p-1.5 text-zinc-500 hover:text-purple-400 hover:bg-zinc-600 rounded-lg transition ml-2 shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/admin/problem/edit/${problemNumber}`);
                }}
              >
                <Pencil size={15} />
              </button>
            </div>
          );
        })}

        {filteredProblems.length === 0 && !loading && (
          <p className="text-zinc-500 text-sm text-center py-8">No problems found</p>
        )}
      </div>
    </div>
  );
}