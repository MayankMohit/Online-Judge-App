import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLeaderboard } from "../../features/leaderboard/leaderboardSlice";
import { Crown, Medal, Trophy } from "lucide-react";

const ITEMS_PER_PAGE = 10;

const rankConfig = (rank) => {
  if (rank === 1) return { bg: "bg-yellow-500/10 border-yellow-500/30", text: "text-yellow-400", icon: <Crown size={14} className="text-yellow-400" /> };
  if (rank === 2) return { bg: "bg-zinc-400/10 border-zinc-400/30",   text: "text-zinc-300",  icon: <Medal size={14} className="text-zinc-400" /> };
  if (rank === 3) return { bg: "bg-orange-500/10 border-orange-500/30",text: "text-orange-400",icon: <Medal size={14} className="text-orange-400" /> };
  return { bg: "bg-zinc-900 border-zinc-800", text: "text-zinc-500", icon: null };
};

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
  const currentUsers = users.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen w-screen bg-black text-white px-4 py-10 mt-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="w-14 h-14 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-2">
            <Trophy size={24} className="text-yellow-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
          <p className="text-zinc-500 text-sm">Top problem solvers on Code Junkie</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 rounded-full border-2 border-t-purple-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center text-red-400 py-10">{error}</div>
        ) : users.length === 0 ? (
          <div className="text-center text-zinc-500 py-10">No users yet</div>
        ) : (
          <>
            {/* Top 3 podium cards */}
            {currentPage === 0 && (
              <div className="grid grid-cols-3 gap-3 mb-6">
                {users.slice(0, 3).map((user, i) => {
                  const rank = i + 1;
                  const { bg, text, icon } = rankConfig(rank);
                  return (
                    <div key={user._id} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border ${bg} ${rank === 1 ? "scale-105" : ""}`}>
                      <div className={`text-2xl font-black ${text}`}>#{rank}</div>
                      {icon}
                      <p className="text-sm font-semibold text-white text-center truncate w-full">{user.name}</p>
                      <p className="text-xs text-zinc-400">{user.totalProblemsSolved} solved</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Full table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="py-3 px-4 text-left text-xs text-zinc-500 font-medium uppercase tracking-wider">Rank</th>
                    <th className="py-3 px-4 text-left text-xs text-zinc-500 font-medium uppercase tracking-wider">Name</th>
                    <th className="py-3 px-4 text-left text-xs text-zinc-500 font-medium uppercase tracking-wider">Solved</th>
                    <th className="py-3 px-4 text-left text-xs text-zinc-500 font-medium uppercase tracking-wider hidden sm:table-cell">Submissions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map((user, index) => {
                    const globalRank = startIdx + index + 1;
                    const { bg, text, icon } = rankConfig(globalRank);
                    return (
                      <tr key={user._id} className={`border-b border-zinc-800/50 transition ${globalRank <= 3 && currentPage === 0 ? bg : "hover:bg-zinc-800/50"}`}>
                        <td className="py-3 px-4">
                          <div className={`flex items-center gap-1.5 font-bold text-sm ${text}`}>
                            {icon}
                            #{globalRank}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium text-white">{user.name}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-semibold">
                            {user.totalProblemsSolved}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-zinc-500 text-xs hidden sm:table-cell">{user.totalSubmissions}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4 text-sm">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 0))}
                  disabled={currentPage === 0}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 disabled:opacity-30 hover:text-white transition text-xs"
                >
                  ← Prev
                </button>
                <span className="text-xs text-zinc-500">{currentPage + 1} / {totalPages}</span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages - 1))}
                  disabled={startIdx + ITEMS_PER_PAGE >= users.length}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 disabled:opacity-30 hover:text-white transition text-xs"
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
};

export default LeaderboardPage;