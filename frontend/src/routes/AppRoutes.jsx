import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import ProtectedRoute from "../components/ProtectedRoute";
import Landing from "../pages/Landing";
import SignUpPage from "../pages/SignUpPage";
import LoginPage from "../pages/LoginPage";
import EmailVerificationPage from "../pages/EmailVerificationPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import DashboardPage from "../pages/DashboardPage";
import MainLayout from "../layouts/MainLayout";
import ProblemsPage from "../pages/ProblemsPage";
import ContestsPage from "../pages/ContestsPage";
import LeaderboardPage from "../pages/LeaderboardPage";

// const RedirectAuthenticatedUser = ({ children }) => {
//   const { isAuthenticated, user } = useAuthStore();
//   if (isAuthenticated && user && user.isVerified) {
//     return <Navigate to="/problems" replace />;
//   }
//   return children;
// };

const AppRoutes = () => {
  const { checkAuth } = useAuthStore();
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-800 via-purple-600 to-violet-800
      flex items-center justify-center relative overflow-hidden"
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/signup"
            element={
              // <RedirectAuthenticatedUser>
                <SignUpPage />
              // </RedirectAuthenticatedUser>
            }
          />
          <Route
            path="/login"
            element={
              // <RedirectAuthenticatedUser>
                <LoginPage />
              // </RedirectAuthenticatedUser>
            }
          />
          <Route
            path="/verify-email"
            element={
              // <RedirectAuthenticatedUser>
                <EmailVerificationPage />
              // </RedirectAuthenticatedUser>
            }
          />
          <Route
            path="/forgot-password"
            element={
              // <RedirectAuthenticatedUser>
                <ForgotPasswordPage />
              // </RedirectAuthenticatedUser>
            }
          />
          <Route
            path="/reset-password/:token"
            element={
              // <RedirectAuthenticatedUser>
                <ResetPasswordPage />
              // </RedirectAuthenticatedUser>
            }
          />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route element={<MainLayout />}>
              <Route path="/problems" element={<ProblemsPage />} />
              <Route path="/contests" element={<ContestsPage />} />
              <Route path="/leaderboards" element={<LeaderboardPage />} />
            </Route>
          </Route>
          
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default AppRoutes;
