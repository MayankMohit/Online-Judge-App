import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "../store/authStore";
import ProtectedRoute from "../components/ProtectedRoute";
import ProtectedAdminRoute from "../components/ProtectedAdminRoute";
import Unauthorized from "../components/Unauthorized";
import Landing from "../pages/authPages/Landing";
import SignUpPage from "../pages/authPages/SignUpPage";
import LoginPage from "../pages/authPages/LoginPage";
import EmailVerificationPage from "../pages/authPages/EmailVerificationPage";
import ForgotPasswordPage from "../pages/authPages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/authPages/ResetPasswordPage";
import DashboardPage from "../pages/mainPages/DashboardPage";
import MainLayout from "../layouts/MainLayout";
import ProblemsPage from "../pages/mainPages/ProblemsPage";
import ContestsPage from "../pages/mainPages/ContestsPage";
import LeaderboardPage from "../pages/mainPages/LeaderboardPage";
import ProblemDetailsPage from "../pages/mainPages/ProblemDetailsPage";
import AllSubmissions from "../pages/submissionPages/AllSubmissions";
import SubmissionView from "../pages/submissionPages/SubmissionView";
import UpdateProfilePage from "../pages/authPages/UpdateProfilePage";
import AdminDashboard from "../pages/adminPages/AdminDashboard";
import UserManagement from "../pages/adminPages/UserManagement";
import ProblemManagement from "../pages/adminPages/ProblemManagement";
import AllSubmissionsOfUser from "../pages/submissionPages/AllSubmissionsOfUser";
import AllSubmissionsOfProblem from "../pages/submissionPages/AllSubmissionsOfProblem";

const RedirectAuthenticatedUser = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated && user && user.isVerified) {
    return <Navigate to="/problems" replace />;
  }
  return children;
};

const AppRoutes = () => {
  const { checkAuth } = useAuthStore();
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-800 to-violet-900
      flex items-center justify-center relative overflow-hidden shadow-inner shadow-purple-900/20"
    >
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute w-96 h-96 bg-purple-600/30 rounded-full blur-3xl top-[-10%] left-[-10%] animate-pulse" />
        <div className="absolute w-96 h-96 bg-violet-400/30 rounded-full blur-2xl bottom-[-10%] right-[-10%] animate-pulse delay-1500" />
        <div className="absolute w-120 h-120 bg-purple-400/20 rounded-full blur-3xl top-[0%] right-[25%] animate-pulse delay-500" />
        <div className="absolute w-120 h-120 bg-violet-500/20 rounded-full blur-2xl bottom-[-45%] left-[15%] animate-pulse delay-2000" />
      </div>
      <BrowserRouter>
        <Toaster position="bottom-right" reverseOrder={false} />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/signup"
            element={
              <RedirectAuthenticatedUser>
                <SignUpPage />
              </RedirectAuthenticatedUser>
            }
          />
          <Route
            path="/login"
            element={
              <RedirectAuthenticatedUser>
                <LoginPage />
              </RedirectAuthenticatedUser>
            }
          />
          <Route
            path="/verify-email"
            element={
              <RedirectAuthenticatedUser>
                <EmailVerificationPage />
              </RedirectAuthenticatedUser>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <RedirectAuthenticatedUser>
                <ForgotPasswordPage />
              </RedirectAuthenticatedUser>
            }
          />
          <Route
            path="/reset-password/:token"
            element={
              <RedirectAuthenticatedUser>
                <ResetPasswordPage />
              </RedirectAuthenticatedUser>
            }
          />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/submissions" element={<AllSubmissions />} />
            <Route path="/submissions/:id" element={<SubmissionView />} />
            <Route path="/update-profile" element={<UpdateProfilePage />} />
            <Route path="/problems/:number" element={<ProblemDetailsPage />} />
            <Route element={<MainLayout />}>
              <Route path="/problems" element={<ProblemsPage />} />
              <Route path="/contests" element={<ContestsPage />} />
              <Route path="/leaderboards" element={<LeaderboardPage />} />
            </Route>
          </Route>

          {/* Admin Protected Routes */}
          <Route path="/admin" element={<ProtectedAdminRoute />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users/:userId" element={<UserManagement />} />
            <Route path="problem/new" element={<ProblemManagement />} />
            <Route
              path="problem/edit/:problemNumber"
              element={<ProblemManagement />}
            />
            <Route
              path="users/:userId/submissions"
              element={<AllSubmissionsOfUser />}
            />
            <Route
              path="problem/:problemId/submissions"
              element={<AllSubmissionsOfProblem />}
            />
          </Route>

          <Route path="/unauthorized" element={<Unauthorized />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default AppRoutes;
