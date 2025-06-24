import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from '../pages/Landing';
// import Login from '../pages/Login';

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Landing />} />
      {/* Add more routes like /login, /signup later */}
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
