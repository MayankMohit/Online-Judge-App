import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchSubmissions } from "../features/submissions/submissionsSlice";
import { useNavigate } from "react-router-dom";

const ITEMS_PER_PAGE = 10;

const formatDate = (isoString) => {
  if (!isoString) return "N/A";
  const date = new Date(isoString);
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
};

const languageMap = {
  cpp: "C++",
  c: "C",
  py: "Python",
  js: "JavaScript",
};

export default function AllSubmissions() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading, error } = useSelector((state) => state.submissions);

  const [page, setPage] = useState(1);

  useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(fetchSubmissions());
  }, [dispatch]);

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const paginatedItems = items.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPaginationNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    pages.push(1);

    if (page > 3) pages.push("...");

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (page < totalPages - 2) pages.push("...");

    pages.push(totalPages);

    return pages;
  };

  return (
    <div className="min-h-screen sm:w-[80vw] w-full mx-auto bg-gray-900 text-white px-2 sm:px-8 py-8 select-none z-10 opacity-95">
      <h1 className="text-2xl sm:text-3xl font-bold text-purple-400 mb-6 text-center">
        All Submissions
      </h1>

      {loading ? (
        <div className="text-center text-gray-400">Loading submissions...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : items.length === 0 ? (
        <div className="text-center text-gray-400">No submissions yet.</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full table-auto bg-gray-800/40 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-700 text-sm text-purple-300 text-left">
                  <th className="py-3 px-4">Problem</th>
                  <th className="py-3 px-4">Language</th>
                  <th className="py-3 px-4">Verdict</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((sub, idx) => (
                  <tr
                    key={idx}
                    onClick={() => navigate(`/submissions/${sub._id}`)}
                    className="border-t border-gray-700 hover:bg-gray-700 transition cursor-pointer"
                  >
                    <td className="py-3 px-4">{sub.problem?.title || "N/A"}</td>
                    <td className="py-3 px-4">
                      {languageMap[sub.language] || sub.language}
                    </td>
                    <td
                      className={`py-3 px-4 font-semibold ${
                        sub.verdict === "accepted"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {sub.verdict}
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell">
                      {formatDate(sub.submittedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              className="px-3 py-1 rounded bg-purple-700 text-white disabled:opacity-50"
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
            >
              Prev
            </button>

            {getPaginationNumbers().map((num, idx) =>
              num === "..." ? (
                <span key={idx} className="px-3 py-1 text-gray-400">
                  ...
                </span>
              ) : (
                <button
                  key={idx}
                  onClick={() => handlePageChange(num)}
                  className={`px-3 py-1 rounded ${
                    page === num
                      ? "bg-purple-500 text-white"
                      : "bg-gray-700 text-gray-300"
                  }`}
                >
                  {num}
                </button>
              )
            )}

            <button
              className="px-3 py-1 rounded bg-purple-700 text-white disabled:opacity-50"
              disabled={page === totalPages}
              onClick={() => handlePageChange(page + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
