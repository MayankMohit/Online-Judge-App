import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from '../pages/Landing';
import SignUpPage from '../pages/SignUpPage';
import LoginPage from '../pages/LoginPage';

const AppRoutes = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900
    flex items-center justify-center relative overflow-hidden">
        <BrowserRouter>
            <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/login" element={<LoginPage />} />
            </Routes>
        </BrowserRouter>
    </div>
);

export default AppRoutes;
