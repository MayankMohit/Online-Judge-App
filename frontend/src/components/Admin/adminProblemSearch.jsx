import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useAdminProblemSearch } from "../../hooks/adminHooks/useAdminProblemSearch";

export default function AdminProblemSearch() {
  const [search, setSearch] = useState("");
  const {
    problems,
    loading,
    error,
    updateSearch,
    loadMore,
    hasMore,
  } = useAdminProblemSearch();

  // Debounced search (similar to ProblemControls)
  useEffect(() => {
    const debounce = setTimeout(() => {
      updateSearch(search.trim());
    }, 400);
    return () => clearTimeout(debounce);
  }, [search, updateSearch]);

  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-md">
      <h3 className="text-lg font-semibold text-purple-300 mb-2">
        Find Submissions for a Problem
      </h3>

      {/* Search */}
      <div className="flex items-center bg-gray-700 rounded-md px-3 py-2">
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search problem..."
          className="bg-transparent text-sm text-white w-full px-2 focus:outline-none"
        />
      </div>

      {/* Results */}
      <div className="h-[20vh] mt-2 overflow-y-auto custom-scrollbar">
        {loading && problems.length === 0 && (
          <p className="text-gray-400 text-sm mt-2">Loading problems...</p>
        )}
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

        {/* Show results only if search is not empty */}
        {search && problems.map((problem) => (
          <div
            key={problem._id}
            className="p-2 bg-gray-900 rounded mt-1 cursor-pointer hover:bg-purple-700 transition"
            onClick={() => console.log("Selected problem:", problem)}
          >
            <p className="text-white text-sm font-medium">
              {problem.problemNumber}. {problem.title}
            </p>
          </div>
        ))}

        {search && problems.length === 0 && !loading && (
          <p className="text-gray-400 text-sm mt-2">No problems found.</p>
        )}

        {search && hasMore && !loading && (
          <div className="flex justify-center">
            <button
              onClick={loadMore}
              className="mt-2 px-3 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-white rounded-md"
            >
              Load More
            </button>
          </div>
        )}
        {loading && problems.length > 0 && (
          <p className="text-gray-400 text-xs mt-1">Loading more...</p>
        )}
      </div>
    </div>
  );
}
