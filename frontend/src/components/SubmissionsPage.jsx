import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FileX } from "lucide-react";
import LoadingScreen from "./LoadingScreen";

const ITEMS_PER_PAGE = 15;

const formatDate = (isoString) => {
  if (!isoString) return "N/A";
  return new Date(isoString).toLocaleString("en-IN", {
    dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata",
  });
};

const languageMap = { cpp: "C++", c: "C", py: "Python", js: "JavaScript" };

const verdictConfig = (verdict) => {
  switch (verdict) {
    case "accepted":           return { label: "Accepted",    cls: "text-green-400 bg-green-400/10 border-green-400/20" };
    case "wrong_answer":       return { label: "Wrong Answer",cls: "text-red-400 bg-red-400/10 border-red-400/20" };
    case "time_limit_exceeded":return { label: "TLE",         cls: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" };
    case "compilation_error":  return { label: "CE",          cls: "text-orange-400 bg-orange-400/10 border-orange-400/20" };
    case "runtime_error":      return { label: "RE",          cls: "text-pink-400 bg-pink-400/10 border-pink-400/20" };
    default:                   return { label: verdict,       cls: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20" };
  }
};

export default function SubmissionsPage({
  submissions = [],
  loading,
  error,
  viewMode = "user",
  heading = "",
}) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(submissions.length / ITEMS_PER_PAGE);
  const paginatedItems = submissions.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPaginationNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="min-h-screen w-full bg-black text-white px-4 sm:px-8 py-8 select-none">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl font-bold text-white mb-6">{heading}</h1>

        {loading ? (
          <LoadingScreen />
        ) : error ? (
          <div className="text-center text-red-400 py-10">{error}</div>
        ) : submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <FileX size={40} className="text-zinc-600" />
            <p className="text-zinc-500 text-sm">No submissions yet</p>
          </div>
        ) : (
          <>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="py-3 px-4 text-left text-xs text-zinc-500 font-medium uppercase tracking-wider">
                      {viewMode === "user" ? "Problem" : "User"}
                    </th>
                    <th className="py-3 px-4 text-left text-xs text-zinc-500 font-medium uppercase tracking-wider">Lang</th>
                    <th className="py-3 px-4 text-left text-xs text-zinc-500 font-medium uppercase tracking-wider">Verdict</th>
                    <th className="py-3 px-4 text-left text-xs text-zinc-500 font-medium uppercase tracking-wider hidden sm:table-cell">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map((sub, idx) => {
                    const { label, cls } = verdictConfig(sub.verdict);
                    return (
                      <tr
                        key={idx}
                        onClick={() => navigate(`/submissions/${sub._id}`)}
                        className="border-b border-zinc-800/50 hover:bg-zinc-800/50 transition cursor-pointer"
                      >
                        <td className="py-3 px-4 text-zinc-300 truncate max-w-[160px] sm:max-w-xs">
                          {viewMode === "user" ? sub.problem?.title || "N/A" : sub.user?.name || "Unknown"}
                        </td>
                        <td className="py-3 px-4 text-zinc-400 text-xs uppercase font-mono">
                          {languageMap[sub.language] || sub.language}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
                            {label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-zinc-500 text-xs hidden sm:table-cell">
                          {formatDate(sub.submittedAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-1.5 mt-6">
                <button
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white disabled:opacity-30 transition text-sm"
                  disabled={page === 1}
                  onClick={() => handlePageChange(page - 1)}
                >
                  ← Prev
                </button>
                {getPaginationNumbers().map((num, idx) =>
                  num === "..." ? (
                    <span key={idx} className="px-2 text-zinc-600">...</span>
                  ) : (
                    <button
                      key={idx}
                      onClick={() => handlePageChange(num)}
                      className={`w-8 h-8 rounded-lg text-sm transition ${
                        page === num
                          ? "bg-purple-600 text-white"
                          : "bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {num}
                    </button>
                  )
                )}
                <button
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white disabled:opacity-30 transition text-sm"
                  disabled={page === totalPages}
                  onClick={() => handlePageChange(page + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}