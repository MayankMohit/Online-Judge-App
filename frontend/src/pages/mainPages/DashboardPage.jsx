import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useSelector, useDispatch } from "react-redux";
import { fetchDashboardData } from "../../features/dashboard/dashboardSlice";
import { fetchFavoriteProblems } from "../../features/favorites/favoritesSlice";
import ProblemCard from "../../components/ProblemCard";

import {
  ArrowBigLeftDashIcon,
  Edit3Icon,
  LogOutIcon,
  UserRound,
  Mail,
  CheckCircle,
  FileCode,
} from "lucide-react";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import ConfirmSignOutDialog from "../../components/ConfirmSignOutDialog";

const COLORS = ["#4CAF50", "#FFD301", "#E03C32"];

const formatDate = (isoString) => {
  if (!isoString) return "N/A";
  const date = new Date(isoString);
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { logout } = useAuthStore();

  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  const {
    name,
    email,
    totalProblemsSolved,
    submissions,
    difficultyStats,
    loading,
    error,
  } = useSelector((state) => state.dashboard);

  const favoriteProblems = useSelector(
    (state) => state.favorites.favoriteProblems
  );

  useEffect(() => {
    dispatch(fetchDashboardData());
    dispatch(fetchFavoriteProblems());
  }, [dispatch]);

  const recentSubmissions = [...submissions]
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .slice(0, 5);

  const handleEdit = () => {
    navigate("/update-profile");
  };

  const handleConfirmSignOut = () => {
    logout();
    navigate("/login");
  };

  const [favPage, setFavPage] = useState(0);
  const problemsPerPage = 3;
  const startIdx = favPage * problemsPerPage;
  const endIdx = startIdx + problemsPerPage;
  const currentFavorites = favoriteProblems.slice(startIdx, endIdx);
  const totalPages = Math.ceil(favoriteProblems.length / problemsPerPage);

  return (
    <div className="w-full min-h-screen bg-purple-900 text-white relative select-none">
      {/* Header */}
      <div className="h-[30vh] w-full bg-gray-950 px-6 py-4 shadow-md hi sm:block hidden">
        <div className="flex items-center justify-start">
          <button
            onClick={() => navigate("/problems")}
            className="bg-purple-700 hover:bg-purple-800 text-black font-semibold py-2 px-2 pr-1 rounded-sm transition text-sm"
          >
            <ArrowBigLeftDashIcon className="inline mr-2" size={25} />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-purple-200 ml-20">
            {loading ? "Loading..." : `Welcome, ${name || "User"}`}
          </h1>
        </div>
      </div>

      {/* Dashboard Main */}
      <div className="relative z-10 sm:-mt-[20vh] sm:max-w-[80vw] mx-auto bg-gray-800 sm:rounded-2xl sm:p-6 p-2 shadow-2xl">
        {error && (
          <p className="text-red-400 mb-4 text-center">Error: {error}</p>
        )}

        <div className="flex flex-col sm:gap-6 gap-3">
          {/* User Info */}
          <div className="bg-gray-900 rounded-xl p-6 shadow-md flex sm:flex-row flex-col items-center justify-between">
            <div className="sm:w-1/2 w-full">
              <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center gap-3">
                👤 User Details
                <Edit3Icon
                  onClick={handleEdit}
                  className="text-white opacity-50 cursor-pointer hover:opacity-90"
                  title="Edit Profile"
                />
              </h2>

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg shadow-sm">
                  <UserRound className="text-purple-400" size={20} />
                  <span className="text-white text-sm">{name}</span>
                </div>
                <div className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg shadow-sm">
                  <Mail className="text-purple-400" size={20} />
                  <span className="text-white text-sm">{email}</span>
                </div>
                <div className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg shadow-sm">
                  <CheckCircle className="text-purple-400" size={20} />
                  <span className="text-white text-sm">
                    Problems Solved: {totalProblemsSolved}
                  </span>
                </div>
                <div className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg shadow-sm">
                  <FileCode className="text-purple-400" size={20} />
                  <span className="text-white text-sm">
                    Submissions: {submissions.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="sm:mt-6 w-full sm:ml-10 ml-20 mt-5 flex flex-col items-center justify-center sm:mr-10 mr-20">
              <h2 className="text-xl font-semibold mb-4 text-purple-300 sm:block hidden">
                Problem Stats
              </h2>
              <div className="flex items-center gap-5 pointer-events-none">
                <div className="w-32 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Easy", value: difficultyStats?.Easy || 0 },
                          {
                            name: "Medium",
                            value: difficultyStats?.Medium || 0,
                          },
                          { name: "Hard", value: difficultyStats?.Hard || 0 },
                        ]}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={50}
                        stroke="none"
                      >
                        <Cell fill={COLORS[0]} />
                        <Cell fill={COLORS[1]} />
                        <Cell fill={COLORS[2]} />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex flex-col gap-2 text-sm font-semibold">
                  <span className="bg-green-700 text-green-200 px-3 py-1 rounded-full w-fit">
                    Easy: {difficultyStats?.Easy || 0}
                  </span>
                  <span className="bg-yellow-700 text-yellow-200 px-3 py-1 rounded-full w-fit">
                    Medium: {difficultyStats?.Medium || 0}
                  </span>
                  <span className="bg-red-700 text-red-200 px-3 py-1 rounded-full w-fit">
                    Hard: {difficultyStats?.Hard || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Favorites */}
            <div className="bg-gray-900 rounded-xl px-2 w-90 md:w-[140%] mt-5 sm:mt-0">
              <h2 className="text-xl font-semibold mb-4 text-purple-300">
                Favourite Problems
              </h2>
              {favoriteProblems.length === 0 ? (
                <p className="text-sm text-gray-400">No favorites added yet.</p>
              ) : (
                <>
                  <div className="space-y-3 mb-4">
                    {currentFavorites.map((problem) => (
                      <ProblemCard
                        key={problem._id}
                        problem={problem}
                        index={problem.problemNumber}
                      />
                    ))}
                    {Array.from({
                      length: problemsPerPage - currentFavorites.length,
                    }).map((_, idx) => (
                      <div
                        key={`empty-${idx}`}
                        className="h-[52px] bg-gray-800 rounded-lg opacity-0"
                      />
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-sm text-gray-300">
                    <button
                      onClick={() =>
                        setFavPage((prev) => Math.max(prev - 1, 0))
                      }
                      disabled={favPage === 0}
                      className={`px-2 py-1 rounded-md ${
                        favPage === 0
                          ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                          : "bg-purple-700 hover:bg-purple-800"
                      }`}
                    >
                      Prev
                    </button>

                    <span className="px-2 text-gray-400">
                      Page {favPage + 1} of {totalPages}
                    </span>

                    <button
                      onClick={() =>
                        setFavPage((prev) =>
                          Math.min(prev + 1, totalPages - 1)
                        )
                      }
                      disabled={endIdx >= favoriteProblems.length}
                      className={`px-2 py-1 rounded-md ${
                        endIdx >= favoriteProblems.length
                          ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                          : "bg-purple-700 hover:bg-purple-800"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Submissions Table */}
          <div className="lg:col-span-3 bg-gray-900 rounded-xl p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-purple-300">
              🧾 Recent Submissions
            </h2>
            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="text-left border-b border-gray-700">
                  <th className="py-2">Problem</th>
                  <th className="py-2">Language</th>
                  <th className="py-2">Verdict</th>
                  <th className="py-2 sm:block hidden">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentSubmissions.map((sub) => (
                  <tr
                    key={sub._id}
                    onClick={() => navigate(`/submissions/${sub._id}`)}
                    className="border-b border-gray-700 hover:bg-gray-700 transition cursor-pointer"
                  >
                    <td className="py-2">{sub.problem?.title || "N/A"}</td>
                    <td className="py-2">{sub.language}</td>
                    <td
                      className={`py-2 ${
                        sub.verdict === "accepted"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {sub.verdict}
                    </td>
                    <td className="py-2 sm:block hidden">
                      {formatDate(sub.submittedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center justify-between">
              <button
                className="text-red-400 cursor-pointer"
                onClick={() => setShowSignOutDialog(true)}
              >
                Sign Out <LogOutIcon className="inline ml-1" size={16} />
              </button>
              <button
                onClick={() => navigate("/submissions")}
                className="text-purple-400 text-sm cursor-pointer"
              >
                View all submissions →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sign-out confirmation modal */}
      <ConfirmSignOutDialog
        open={showSignOutDialog}
        onClose={() => setShowSignOutDialog(false)}
        onConfirm={handleConfirmSignOut}
      />
    </div>
  );
}
