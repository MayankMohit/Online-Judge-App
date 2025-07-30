import {
  ArrowBigLeftDashIcon,
  Edit3Icon,
  UserRound,
  Mail,
  FileCode,
  CheckCircle,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

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

export default function UserProfile({
  title,
  userData,
  submissionsList = [],
  onEdit,
  onBack,
  onViewAllSubmissions,
  onToggleAdmin,
}) {
  const recentSubmissions = [...submissionsList]
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .slice(0, 5);

  return (
    <div className="w-full min-h-screen bg-purple-900 text-white relative select-none">
      {/* Banner */}
      <div className="h-[30vh] w-full bg-gray-950 px-6 py-4 shadow-md sm:block hidden">
        <div className="flex items-center justify-start">
          {onBack && (
            <button
              onClick={onBack}
              className="bg-purple-700 hover:bg-purple-800 text-black font-semibold py-2 px-2 rounded-sm transition text-sm"
            >
              <ArrowBigLeftDashIcon className="inline mr-2" size={25} />
            </button>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-purple-200 ml-20">
            {title}
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 sm:-mt-[20vh] sm:max-w-[80vw] mx-auto bg-gray-800 sm:rounded-2xl sm:p-6 p-2 shadow-2xl">
        <div className="flex flex-col sm:gap-6 gap-3">
          {/* User Info + Stats + Role */}
          <div className="bg-gray-900 rounded-xl p-6 shadow-md flex sm:flex-row flex-col items-start justify-between">
            {/* User Details */}
            <div className="min-w-[330px]">
              <h2 className="text-xl font-semibold mb-6 text-purple-300 flex items-center gap-3">
                👤 User Details
                {onEdit && isOwnProfile && (
                  <Edit3Icon
                    onClick={onEdit}
                    className="text-white opacity-50 cursor-pointer hover:opacity-90"
                    title="Edit Profile"
                  />
                )}
              </h2>

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg shadow-sm">
                  <UserRound className="text-purple-400" size={20} />
                  <span className="text-white text-sm">{userData?.name}</span>
                </div>
                <div className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg shadow-sm">
                  <Mail className="text-purple-400" size={20} />
                  <span className="text-white text-sm">{userData?.email}</span>
                </div>
                <div className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg shadow-sm">
                  <CheckCircle className="text-purple-400" size={20} />
                  <span className="text-white text-sm">
                    Problems Solved: {userData?.totalProblemsSolved || 0}
                  </span>
                </div>
                <div className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg shadow-sm">
                  <FileCode className="text-purple-400" size={20} />
                  <span className="text-white text-sm">
                    Submissions: {submissionsList.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Mini Problem Stats */}
            <div className="sm:mt-6 w-full sm:ml-10 mt-5 flex flex-col items-center justify-center sm:mr-10 mr-20">
              <h2 className="text-xl font-semibold mb-4 text-purple-300 sm:block hidden">
                Problem Stats
              </h2>
              <div className="flex items-center gap-5 pointer-events-none">
                <div className="w-32 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={
                          (userData?.difficultyStats?.Easy || 0) +
                            (userData?.difficultyStats?.Medium || 0) +
                            (userData?.difficultyStats?.Hard || 0) >
                          0
                            ? [
                                {
                                  name: "Easy",
                                  value: userData?.difficultyStats?.Easy || 0,
                                },
                                {
                                  name: "Medium",
                                  value: userData?.difficultyStats?.Medium || 0,
                                },
                                {
                                  name: "Hard",
                                  value: userData?.difficultyStats?.Hard || 0,
                                },
                              ]
                            : [{ name: "None", value: 1 }]
                        }
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={50}
                        stroke="none"
                      >
                        {(userData?.difficultyStats?.Easy ||
                          userData?.difficultyStats?.Medium ||
                          userData?.difficultyStats?.Hard) > 0 ? (
                          <>
                            <Cell fill={COLORS[0]} />
                            <Cell fill={COLORS[1]} />
                            <Cell fill={COLORS[2]} />
                          </>
                        ) : (
                          <Cell fill="#888888" />
                        )}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-2 text-sm font-semibold">
                  <span className="bg-green-700 text-green-200 px-3 py-1 rounded-full w-fit">
                    Easy: {userData?.difficultyStats?.Easy || 0}
                  </span>
                  <span className="bg-yellow-700 text-yellow-200 px-3 py-1 rounded-full w-fit">
                    Medium: {userData?.difficultyStats?.Medium || 0}
                  </span>
                  <span className="bg-red-700 text-red-200 px-3 py-1 rounded-full w-fit">
                    Hard: {userData?.difficultyStats?.Hard || 0}
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-gray-900 sm:py-5 w-full md:w-[140%] mt-5 sm:mt-0 text-center">
              <h2 className="text-xl font-semibold mb-4 text-purple-300">
                Role: {userData?.role === "admin" ? "Admin" : "User"}
              </h2>
              <button
                onClick={onToggleAdmin}
                className={`px-4 py-2 rounded-md text-white text-sm ${
                  userData?.role === "admin"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {userData?.role === "admin"
                  ? "Demote to User"
                  : "Promote to Admin"}
              </button>
            </div>
          </div>

          {/* Recent Submissions */}
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
                {recentSubmissions.map((sub, idx) => (
                  <tr
                    key={idx}
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
                onClick={onViewAllSubmissions}
                className="text-purple-400 text-sm cursor-pointer"
              >
                View all submissions →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
