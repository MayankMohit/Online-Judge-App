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
      className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#1a0533_0%,_#0a0a0a_60%,_#000000_100%)]
      flex items-center justify-center relative overflow-hidden"
    >
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
