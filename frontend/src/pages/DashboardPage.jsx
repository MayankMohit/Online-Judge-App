// import { motion } from "framer-motion";
// import { useAuthStore } from "../store/authStore";
// import { formatDate } from "../utils/date";
// import { useNavigate } from "react-router-dom";

// const DashboardPage = () => {
//     const { user, logout } = useAuthStore();
//     const navigate = useNavigate();
//     const handleLogout = () => {
//         logout();
//         navigate("/login", { replace: true });
//     };
//     return (
//         <motion.div
//         className="max-w-md w-full mx-auto mt-10 p-8 bg-gray-900 bg-opacity-80 backdrop-filter
//         backdrop-blur-lg rounded-xl shadow-2xl border border-gray-800"
//         initial={{ opacity: 0, scale: 0.9 }}
//         animate={{ opacity: 1, scale: 1 }}
//         exit={{ opacity: 0, scale: 0.9 }}
//         transition={{ duration: 0.5 }}
//         >
//         <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-purple-400 to-purple-600 text-transparent bg-clip-text">
//             Dashboard
//         </h2>
//         <div className="space-y-6">
//             <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.2 }}
//             className="bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700 p-4"
//             >
//             <h3 className="text-xl font-semibold text-purple-400 mb-3">
//                 Profile Information
//             </h3>
//             <p className="text-gray-300">Name: {user.name}</p>
//             <p className="text-gray-300">Email: {user.email}</p>
//             </motion.div>
//             <motion.div
//             className="p-4 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.4 }}
//             >
//             <h3 className="text-xl font-semibold text-purple-400 mb-3">
//                 Account Activity
//             </h3>
//             <p className="text-gray-300">
//                 <span className="font-bold">Joined: </span>
//                 {new Date(user.createdAt).toLocaleDateString("en-US", {
//                 year: "numeric",
//                 month: "long",
//                 day: "numeric",
//                 })}
//             </p>
//             <p className="text-gray-300">
//                 <span className="font-bold">Last Login: </span>
//                 {formatDate(user.lastLogin)}
//             </p>
//             </motion.div>
//         </div>
//         <motion.div
//             className="mt-4"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6 }}
//         >
//             <motion.button
//             className="w-full py-3 px-4 bg-gradient-to-r from-purple-500
//                 to-purple-600 text-white font-bold rounded-lg shadow-lg hover:from-purple-600
//                     hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500
//                     focus:ring-offset-2 focus:purple-offset-gray-900"
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={handleLogout}
//             >
//             Logout
//             </motion.button>
//         </motion.div>
//         </motion.div>
//     );
// };

// export default DashboardPage;


import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const mockSubmissions = [
  { problem: "Two Sum", language: "C++", status: "Accepted", submitted: "2 hrs ago" },
  { problem: "Palindrome", language: "JavaScript", status: "Wrong Answer", submitted: "5 hrs ago" },
];

const mockChartData = [
  { difficulty: "Easy", solved: 15 },
  { difficulty: "Medium", solved: 8 },
  { difficulty: "Hard", solved: 2 },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [submissions] = useState(mockSubmissions);
  const [chartData] = useState(mockChartData);

  return (
    <div className="min-h-screen px-6 py-3 bg-gray-900 text-white">
      {/* Back to Problems */}
      <button
        onClick={() => navigate("/problems")}
        className="mb-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold text-purple-400 mb-6">
        Welcome, {user?.name || "User"}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Details */}
        <div className="bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-purple-300">User Details</h2>
          <ul className="space-y-2 text-sm">
            <li><strong>Email:</strong> {user?.email}</li>
            <li><strong>Joined:</strong> {user?.createdAt?.slice(0, 10) || "N/A"}</li>
            <li><strong>Last Login:</strong> {user?.lastLogin || "N/A"}</li>
            <li><strong>Total Problems Solved:</strong> {user?.totalSolved || 0}</li>
            <li><strong>Submissions:</strong> {user?.totalSubmissions || 0}</li>
          </ul>
          <button
            onClick={logout}
            className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Sign Out
          </button>
        </div>

        {/* Chart */}
        <div className="lg:col-span-2 bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-purple-300">Problem Stats</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="difficulty" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip />
                <Bar dataKey="solved" fill="#a855f7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Submissions */}
        <div className="lg:col-span-3 bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-purple-300">Recent Submissions</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="py-2">Problem</th>
                <th className="py-2">Language</th>
                <th className="py-2">Status</th>
                <th className="py-2">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub, idx) => (
                <tr key={idx} className="border-b border-gray-700">
                  <td className="py-2">{sub.problem}</td>
                  <td className="py-2">{sub.language}</td>
                  <td className={`py-2 ${sub.status === "Accepted" ? "text-green-400" : "text-red-400"}`}>{sub.status}</td>
                  <td className="py-2">{sub.submitted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


// This code defines a DashboardPage component that displays user information, problem statistics, and recent submissions.