import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const ProtectedAdminRoute = () => {
  const { user, isAuthenticated, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) return <div>Loading...</div>;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (!user?.isVerified) return <Navigate to="/verify-email" replace />;

  if (user.role !== "admin") return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
};

export default ProtectedAdminRoute;
