import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from '../pages/Landing';
import SignUpPage from '../pages/SignUpPage';
import LoginPage from '../pages/LoginPage';
import EmailVerificationPage from '../pages/EmailVerificationPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import DashboardPage from '../pages/DashboardPage';

const AppRoutes = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-purple-600 to-violet-800
    flex items-center justify-center relative overflow-hidden">
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/verify-email" element={<EmailVerificationPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            </Routes>
        </BrowserRouter>
    </div>
);

export default AppRoutes;
