import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLeaderboard } from "../../features/leaderboard/leaderboardSlice";
import { Crown } from "lucide-react";

const ITEMS_PER_PAGE = 10;

const LeaderboardPage = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.leaderboard);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(fetchLeaderboard());
  }, [dispatch]);

  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
  const startIdx = currentPage * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const currentUsers = users.slice(startIdx, endIdx);

  return (
    <div className="h-[80vh]  text-white px-4 sm:px-10 py-10 mt-10 w-screen flex flex-col items-center">
      <h1 className="text-3xl font-bold text-purple-400 text-center mb-8 flex justify-center items-center gap-2">
        <Crown size={28} className="text-yellow-400" />
        Top Problem Solvers
      </h1>

      {loading ? (
        <div className="w-6 h-6 m-auto rounded-full border-2 border-t-purple-500 border-b-purple-300 animate-spin"></div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : users.length === 0 ? (
        <div className="text-center text-gray-400">No users yet.</div>
      ) : (
        <div className="sm:w-[70%] w-full space-y-4">
          <table className="w-full text-sm bg-gray-800 rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-gray-700 text-purple-300 text-left">
                <th className="py-3 pl-4 sm:pl-6">Rank</th>
                <th className="py-3 pl-4">Name</th>
                <th className="py-3">Total Solved</th>
                <th className="py-3 hidden sm:table-cell">Submissions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user, index) => {
                const globalRank = currentPage * ITEMS_PER_PAGE + index + 1;
                const bgClass =
                  globalRank === 1
                    ? "bg-yellow-700"
                    : globalRank === 2
                      ? "bg-gray-600"
                      : globalRank === 3
                        ? "bg-orange-900/60"
                        : "hover:bg-gray-700";

                return (
                  <tr
                    key={index}
                    className={`border-t border-gray-700 transition ${bgClass}`}
                  >
                    <td className="py-3 pl-4 sm:pl-6 font-semibold text-purple-300">
                      #{globalRank}
                    </td>
                    <td className="py-3 pl-4 font-medium">{user.name}</td>
                    <td className="py-3 pl-4">{user.totalProblemsSolved}</td>
                    <td className="py-3 pl-4 hidden sm:table-cell">
                      {user.totalSubmissions}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center text-sm text-gray-300">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
              disabled={currentPage === 0}
              className={`px-3 py-1 rounded ${
                currentPage === 0
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-purple-700 hover:bg-purple-800"
              }`}
            >
              Prev
            </button>
            <span className="text-gray-400">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))
              }
              disabled={endIdx >= users.length}
              className={`px-3 py-1 rounded ${
                endIdx >= users.length
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-purple-700 hover:bg-purple-800"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;
