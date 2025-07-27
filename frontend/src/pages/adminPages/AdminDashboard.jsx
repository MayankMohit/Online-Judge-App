import AdminProblemList from "../../components/Admin/adminProblemList";
import AdminUserList from "../../components/Admin/adminUserList";
import AdminProblemSearch from "../../components/Admin/adminProblemSearch";
import { useAuthStore } from "../../store/authStore";

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const adminId = user._id;

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold text-purple-400 text-center mb-5">
        Admin Dashboard
      </h1>

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
