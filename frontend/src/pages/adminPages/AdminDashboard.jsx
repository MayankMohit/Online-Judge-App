import AdminProblemList from "../../components/Admin/adminProblemList";
import AdminUserList from "../../components/Admin/adminUserList";
import AdminProblemSearch from "../../components/Admin/adminProblemSearch";
import { useAuthStore } from "../../store/authStore";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const adminId = user._id;
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white p-4 relative">
      {/* Back Button */}
      <div className="fixed top-5 left-5 z-50 rounded-md bg-gray-800 px-2 py-1">
        <button
          onClick={() => navigate("/problems")}
          className="flex items-center gap-2 text-white hover:text-blue-400 transition"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
      </div>

      {/* Dashboard Header */}
      <h1 className="text-3xl font-bold text-purple-400 text-center mb-5">
        Admin Dashboard
      </h1>

      {/* Layout */}
      <div className="flex flex-col sm:flex-row gap-2 w-full max-w-[1400px] mx-auto">
        <div className="w-full sm:w-[40%] flex flex-col gap-2">
          <AdminUserList />
          <AdminProblemSearch />
        </div>

        <div className="w-full sm:w-[60%]">
          <AdminProblemList adminId={adminId} />
        </div>
      </div>
    </div>
  );
}
