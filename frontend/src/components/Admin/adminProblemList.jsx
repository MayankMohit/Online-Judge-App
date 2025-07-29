import { useState, useEffect } from "react";
import { Search, Pencil } from "lucide-react";
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

  return (
    <div className="w-full bg-gray-800 rounded-lg px-4 py-4 shadow-md flex flex-col gap-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-purple-300">Problems</h2>
        <button
          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md"
          onClick={() => navigate("/admin/problem/new")}
        >
          + Add Problem
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center bg-gray-700 rounded-md px-3 py-2">
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          value={searchProblem}
          onChange={(e) => setSearchProblem(e.target.value)}
          placeholder="Search problems..."
          className="bg-transparent text-sm text-white w-full px-2 focus:outline-none"
        />
      </div>

      {/* Loading / Error */}
      {loading && problems.length === 0 && (
        <p className="text-gray-400 text-sm">Loading problems...</p>
      )}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* Problem Cards */}
      <div className="flex flex-col gap-2 overflow-y-auto h-[65vh] pr-1 custom-scrollbar">
        {filteredProblems.map((problem) => {
          const { problemNumber, title, difficulty, tags = [], _id } = problem;
          const visibleTags = tags.slice(0, 3);
          const extraTags = tags.length > 3 ? tags.length - 3 : 0;

          return (
            <div
              key={_id}
              className="px-3 py-2 bg-gray-900 rounded-md shadow-lg flex justify-between items-center hover:bg-gray-900/70 transition cursor-pointer"
              onClick={() => navigate(`/problems/${problemNumber}`)}
            >
              {/* Problem Info */}
              <div className="flex flex-col">
                <div className="flex items-center">
                  <p className="font-medium text-purple-300 px-2">
                    {problemNumber}.
                  </p>
                  <p className="font-medium">{title}</p>
                  <span
                    className={`px-2 ml-4 py-1 text-xs rounded-md font-semibold ${
                      difficulty === "Easy"
                        ? "bg-green-800 text-green-200"
                        : difficulty === "Medium"
                        ? "bg-yellow-800 text-yellow-200"
                        : "bg-red-800 text-red-200"
                    }`}
                  >
                    {difficulty}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <p className="pl-2 text-xs font-medium text-purple-200/70">Tags:</p>
                  {visibleTags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 text-xs rounded-md bg-gray-800 text-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                  {extraTags > 0 && (
                    <span className="px-2 py-1 text-xs rounded-md bg-gray-700 text-gray-400">
                      +{extraTags} more
                    </span>
                  )}
                </div>
              </div>

              {/* Edit Icon */}
              <div
                className="p-2 text-blue-300 hover:text-blue-500"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/admin/problem/edit/${problemNumber}`);
                }}
              >
                <Pencil size={20} />
              </div>
            </div>
          );
        })}

        {filteredProblems.length === 0 && !loading && (
          <p className="text-gray-400 text-sm">No problems found.</p>
        )}
      </div>
    </div>
  );
}
