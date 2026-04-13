import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useSelector, useDispatch } from "react-redux";
import { fetchDashboardData } from "../../features/dashboard/dashboardSlice";
import { fetchFavoriteProblems } from "../../features/favorites/favoritesSlice";
import ProblemCard from "../../components/ProblemCard";
import {
  Edit3Icon, LogOutIcon, UserRound, Mail,
  CheckCircle, FileCode, ArrowLeft, Star, Clock,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import ConfirmSignOutDialog from "../../components/ConfirmSignOutDialog";
import LoadingScreen from "../../components/LoadingScreen";

const DIFFICULTY_COLORS = {
  Easy:   { fill: "#4ade80", bg: "bg-green-500/10",  text: "text-green-400",  border: "border-green-500/30"  },
  Medium: { fill: "#facc15", bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/30" },
  Hard:   { fill: "#f87171", bg: "bg-red-500/10",    text: "text-red-400",    border: "border-red-500/30"    },
};

const COLORS = [DIFFICULTY_COLORS.Easy.fill, DIFFICULTY_COLORS.Medium.fill, DIFFICULTY_COLORS.Hard.fill];

const formatDate = (isoString) => {
  if (!isoString) return "N/A";
  return new Date(isoString).toLocaleString("en-IN", {
    dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata",
  });
};

const verdictStyle = (verdict) =>
  verdict === "accepted" ? "text-green-400" : "text-red-400";

const verdictLabel = (verdict) =>
  verdict === "accepted" ? "Accepted" :
  verdict === "wrong_answer" ? "Wrong Answer" :
  verdict === "time_limit_exceeded" ? "TLE" :
  verdict === "compilation_error" ? "CE" :
  verdict === "runtime_error" ? "RE" : verdict;

export default function DashboardPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { logout } = useAuthStore();
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [favPage, setFavPage] = useState(0);
  const problemsPerPage = 3;

  const { name, email, totalProblemsSolved, submissions, difficultyStats, loading, error } =
    useSelector((state) => state.dashboard);
  const favoriteProblems = useSelector((state) => state.favorites.favoriteProblems);

  useEffect(() => {
    dispatch(fetchDashboardData());
    dispatch(fetchFavoriteProblems());
  }, [dispatch]);

  const recentSubmissions = [...submissions]
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .slice(0, 5);

  const startIdx = favPage * problemsPerPage;
  const currentFavorites = favoriteProblems.slice(startIdx, startIdx + problemsPerPage);
  const totalPages = Math.ceil(favoriteProblems.length / problemsPerPage);

  const pieData = [
    { name: "Easy",   value: difficultyStats?.Easy   || 0 },
    { name: "Medium", value: difficultyStats?.Medium || 0 },
    { name: "Hard",   value: difficultyStats?.Hard   || 0 },
  ];

  const totalSolved = (difficultyStats?.Easy || 0) + (difficultyStats?.Medium || 0) + (difficultyStats?.Hard || 0);

  if (loading) return (
    <LoadingScreen />
  );

  return (
    <div className="w-full min-h-screen bg-black text-white select-none">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-black border-b border-zinc-800 px-6 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate("/problems")}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition text-sm"
        >
          <ArrowLeft size={16} />
          <span>Problems</span>
        </button>
        <h1 className="text-base font-semibold text-white">
          {loading ? "Loading..." : `${name || "User"}'s Profile`}
        </h1>
        <button
          onClick={() => navigate("/update-profile")}
          className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition"
        >
          <Edit3Icon size={14} />
          Edit
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-6">
        {error && <p className="text-red-400 text-center">Error: {error}</p>}

        {/* Top row: User Info + Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* User Info Card */}
          <div className="sm:col-span-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Account</h2>
            <div className="flex flex-col gap-3">
              {[
                { icon: <UserRound size={16} className="text-purple-400" />, value: name },
                { icon: <Mail size={16} className="text-purple-400" />, value: email },
                { icon: <CheckCircle size={16} className="text-green-400" />, value: `${totalProblemsSolved} problems solved` },
                { icon: <FileCode size={16} className="text-blue-400" />, value: `${submissions.length} submissions` },
              ].map(({ icon, value }, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                  {icon}
                  <span className="truncate">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Difficulty Stats Card */}
          <div className="sm:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Problems Solved</h2>
            <div className="flex items-center gap-6">
              {/* Donut chart */}
              <div className="relative w-32 h-32 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={totalSolved === 0 ? [{ name: "None", value: 1 }] : pieData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={38}
                      outerRadius={56}
                      stroke="none"
                    >
                      {totalSolved === 0
                        ? <Cell fill="#27272a" />
                        : pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)
                      }
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }}
                      itemStyle={{ color: "#fff" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-white">{totalSolved}</span>
                  <span className="text-xs text-zinc-500">solved</span>
                </div>
              </div>

              {/* Difficulty breakdown */}
              <div className="flex flex-col gap-3 flex-1">
                {Object.entries(DIFFICULTY_COLORS).map(([level, { bg, text, border, fill }]) => {
                  const count = difficultyStats?.[level] || 0;
                  return (
                    <div key={level} className={`flex items-center justify-between px-3 py-2 rounded-lg border ${bg} ${border}`}>
                      <span className={`text-sm font-medium ${text}`}>{level}</span>
                      <span className="text-sm font-bold text-white">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Recent Submissions</h2>
            <button
              onClick={() => navigate("/submissions")}
              className="text-xs text-purple-400 hover:text-purple-300 transition"
            >
              View all →
            </button>
          </div>

          {recentSubmissions.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-4">No submissions yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-zinc-800">
                    <th className="pb-2 text-xs text-zinc-500 font-medium">Problem</th>
                    <th className="pb-2 text-xs text-zinc-500 font-medium">Lang</th>
                    <th className="pb-2 text-xs text-zinc-500 font-medium">Verdict</th>
                    <th className="pb-2 text-xs text-zinc-500 font-medium hidden sm:table-cell">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSubmissions.map((sub) => (
                    <tr
                      key={sub._id}
                      onClick={() => navigate(`/submissions/${sub._id}`)}
                      className="border-b border-zinc-800/50 hover:bg-zinc-800/50 transition cursor-pointer"
                    >
                      <td className="py-2.5 text-zinc-300 truncate max-w-[140px]">{sub.problem?.title || "N/A"}</td>
                      <td className="py-2.5 text-zinc-400 uppercase text-xs">{sub.language}</td>
                      <td className={`py-2.5 font-medium ${verdictStyle(sub.verdict)}`}>
                        {verdictLabel(sub.verdict)}
                      </td>
                      <td className="py-2.5 text-zinc-500 text-xs hidden sm:table-cell">
                        {formatDate(sub.submittedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Favourite Problems */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Star size={15} className="text-yellow-400 fill-yellow-400" />
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Favourite Problems</h2>
          </div>

          {favoriteProblems.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-4">No favourites added yet</p>
          ) : (
            <>
              <div className="flex flex-col gap-2 mb-3">
                {currentFavorites.map((problem) => (
                  <ProblemCard key={problem._id} problem={problem} index={problem.problemNumber} dashboard={true} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-between items-center text-sm">
                  <button
                    onClick={() => setFavPage((p) => Math.max(p - 1, 0))}
                    disabled={favPage === 0}
                    className="px-3 py-1 rounded-lg bg-zinc-800 text-zinc-400 disabled:opacity-30 hover:bg-zinc-700 transition text-xs"
                  >
                    ← Prev
                  </button>
                  <span className="text-xs text-zinc-500">{favPage + 1} / {totalPages}</span>
                  <button
                    onClick={() => setFavPage((p) => Math.min(p + 1, totalPages - 1))}
                    disabled={startIdx + problemsPerPage >= favoriteProblems.length}
                    className="px-3 py-1 rounded-lg bg-zinc-800 text-zinc-400 disabled:opacity-30 hover:bg-zinc-700 transition text-xs"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sign out */}
        <div className="flex justify-center pb-4">
          <button
            onClick={() => setShowSignOutDialog(true)}
            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition"
          >
            <LogOutIcon size={15} />
            Sign out
          </button>
        </div>
      </div>

      <ConfirmSignOutDialog
        open={showSignOutDialog}
        onClose={() => setShowSignOutDialog(false)}
        onConfirm={() => { logout(); navigate("/login"); }}
      />
    </div>
  );
}