import AdminProblemList from "../../components/Admin/adminProblemList";
import AdminUserList from "../../components/Admin/adminUserList";
import AdminProblemSearch from "../../components/Admin/adminProblemSearch";
import { useAuthStore } from "../../store/authStore";
import { ArrowLeft, ShieldCheck, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const adminId = user._id;
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-black text-white">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-black border-b border-zinc-800 px-6 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate("/problems")}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition text-sm"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:block">Problems</span>
        </button>

        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-purple-400" />
          <h1 className="text-base font-semibold text-white">Admin Dashboard</h1>
        </div>

        <button
          onClick={() => navigate("/admin/problem/new")}
          className="flex items-center gap-1.5 text-sm bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg transition"
        >
          <Plus size={14} />
          <span className="hidden sm:block">Add Problem</span>
        </button>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col-reverse sm:flex-row gap-4 w-full">
          {/* Left column: Users + Problem search */}
          <div className="w-full sm:w-[38%] flex flex-col gap-4">
            <AdminUserList />
            <AdminProblemSearch />
          </div>

          {/* Right column: Problem list */}
          <div className="w-full sm:w-[62%]">
            <AdminProblemList adminId={adminId} />
          </div>
        </div>
      </div>
    </div>
  );
}