import { ArrowLeft, UserRound, Mail, CheckCircle, FileCode, ShieldCheck, ShieldOff } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import LoadingScreen from "./LoadingScreen";

const DIFFICULTY_COLORS = {
  Easy:   { fill: "#4ade80", bg: "bg-green-500/10",  text: "text-green-400",  border: "border-green-500/30"  },
  Medium: { fill: "#facc15", bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/30" },
  Hard:   { fill: "#f87171", bg: "bg-red-500/10",    text: "text-red-400",    border: "border-red-500/30"    },
};
const COLORS = Object.values(DIFFICULTY_COLORS).map((d) => d.fill);

const formatDate = (iso) => {
  if (!iso) return "N/A";
  return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });
};

const verdictLabel = (v) =>
  ({ accepted: "Accepted", wrong_answer: "Wrong Answer", time_limit_exceeded: "TLE", compilation_error: "CE", runtime_error: "RE" }[v] || v);

const verdictColor = (v) => v === "accepted" ? "text-green-400" : "text-red-400";

export default function UserProfile({ title, userData, submissionsList = [], onBack, onViewAllSubmissions, onToggleAdmin, loadingToggle }) {
  const recentSubmissions = [...submissionsList]
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .slice(0, 8);

  const pieData = [
    { name: "Easy",   value: userData?.difficultyStats?.Easy   || 0 },
    { name: "Medium", value: userData?.difficultyStats?.Medium || 0 },
    { name: "Hard",   value: userData?.difficultyStats?.Hard   || 0 },
  ];
  const totalSolved = pieData.reduce((s, d) => s + d.value, 0);
  const isAdmin = userData?.role === "admin";

  return (
    <div className="min-h-screen w-full bg-black text-white">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-black border-b border-zinc-800 px-6 py-3 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-zinc-400 hover:text-white transition text-sm">
          <ArrowLeft size={16} />
          Admin
        </button>
        <h1 className="text-base font-semibold text-white truncate">{title}</h1>
        <button
          onClick={onToggleAdmin}
          disabled={loadingToggle}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            isAdmin
              ? "bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20"
              : "bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20"
          } disabled:opacity-50`}
        >
          {isAdmin ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
          {isAdmin ? "Demote" : "Promote"}
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-4">
        {/* User info + stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Info card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Account</h2>
              {isAdmin && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 font-semibold">Admin</span>
              )}
            </div>
            <div className="flex flex-col gap-3">
              {[
                { icon: <UserRound size={15} className="text-purple-400" />, value: userData?.name },
                { icon: <Mail size={15} className="text-purple-400" />, value: userData?.email },
                { icon: <CheckCircle size={15} className="text-green-400" />, value: `${userData?.totalProblemsSolved || 0} solved` },
                { icon: <FileCode size={15} className="text-blue-400" />, value: `${submissionsList.length} submissions` },
              ].map(({ icon, value }, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm text-zinc-300">
                  {icon}<span className="truncate">{value}</span>
                </div>
              ))}
            </div>
            {userData?.lastLogin && (
              <p className="text-xs text-zinc-600">Last login: {formatDate(userData.lastLogin)}</p>
            )}
          </div>

          {/* Stats card */}
          <div className="sm:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Problems Solved</h2>
            <div className="flex items-center gap-6">
              <div className="relative w-32 h-32 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={totalSolved === 0 ? [{ name: "None", value: 1 }] : pieData}
                      dataKey="value" cx="50%" cy="50%"
                      innerRadius={38} outerRadius={56} stroke="none"
                    >
                      {totalSolved === 0
                        ? <Cell fill="#27272a" />
                        : pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)
                      }
                    </Pie>
                    <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }} itemStyle={{ color: "#fff" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-white">{totalSolved}</span>
                  <span className="text-xs text-zinc-500">solved</span>
                </div>
              </div>
              <div className="flex flex-col gap-3 flex-1">
                {Object.entries(DIFFICULTY_COLORS).map(([level, { bg, text, border }]) => (
                  <div key={level} className={`flex items-center justify-between px-3 py-2 rounded-lg border ${bg} ${border}`}>
                    <span className={`text-sm font-medium ${text}`}>{level}</span>
                    <span className="text-sm font-bold text-white">{userData?.difficultyStats?.[level] || 0}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Recent Submissions</h2>
            <button onClick={onViewAllSubmissions} className="text-xs text-purple-400 hover:text-purple-300 transition">
              View all →
            </button>
          </div>
          {recentSubmissions.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-6">No submissions yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {["Problem", "Lang", "Verdict", "Time"].map((h) => (
                      <th key={h} className={`pb-2 text-xs text-zinc-500 font-medium text-left ${h === "Time" ? "hidden sm:table-cell" : ""}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentSubmissions.map((sub, idx) => (
                    <tr key={idx} className="border-b border-zinc-800/50 hover:bg-zinc-800/50 transition">
                      <td className="py-2.5 text-zinc-300 truncate max-w-[140px]">{sub.problem?.title || "N/A"}</td>
                      <td className="py-2.5 text-zinc-400 uppercase text-xs font-mono">{sub.language}</td>
                      <td className={`py-2.5 font-medium text-xs ${verdictColor(sub.verdict)}`}>{verdictLabel(sub.verdict)}</td>
                      <td className="py-2.5 text-zinc-500 text-xs hidden sm:table-cell">{formatDate(sub.submittedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}