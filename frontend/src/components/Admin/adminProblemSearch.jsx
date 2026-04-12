import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useAdminProblemSearch } from "../../hooks/adminHooks/useAdminProblemSearch";
import { useNavigate } from "react-router-dom";

export default function AdminProblemSearch() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { problems, loading, error, updateSearch, loadMore, hasMore } = useAdminProblemSearch();

  useEffect(() => {
    const debounce = setTimeout(() => {
      updateSearch(search.trim());
    }, 400);
    return () => clearTimeout(debounce);
  }, [search, updateSearch]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Find Problem Submissions</h2>

      <div className="flex items-center bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 focus-within:border-purple-500 transition-colors">
        <Search size={15} className="text-zinc-500 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search problem..."
          className="bg-transparent text-sm text-white w-full px-2 focus:outline-none placeholder-zinc-500"
        />
      </div>

      <div className="flex flex-col gap-1.5 max-h-[20vh] overflow-y-auto custom-scrollbar">
        {loading && problems.length === 0 && (
          <p className="text-zinc-500 text-sm">Searching...</p>
        )}
        {error && <p className="text-red-400 text-sm">{error}</p>}

        {search && problems.map((problem) => (
          <div
            key={problem._id}
            className="px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl cursor-pointer hover:bg-zinc-700 hover:border-zinc-600 transition"
            onClick={() => navigate(`/admin/problem/${problem._id}/submissions`)}
          >
            <p className="text-white text-sm font-medium">
              <span className="text-zinc-500 mr-2">#{problem.problemNumber}</span>
              {problem.title}
            </p>
          </div>
        ))}

        {search && problems.length === 0 && !loading && (
          <p className="text-zinc-500 text-sm text-center py-3">No problems found</p>
        )}

        {search && hasMore && !loading && (
          <button
            onClick={loadMore}
            className="text-xs text-zinc-400 hover:text-white transition text-center py-1"
          >
            Load more
          </button>
        )}
      </div>
    </div>
  );
}