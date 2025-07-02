import { NavLink } from 'react-router-dom';
import logo from '../assets/images/dark_long.png';

const Navbar = () => {
  return (
    <nav className="min-w-screen max-h-[4rem] bg-gray-900 text-zinc-300 px-6 py-4 shadow-md flex items-center justify-between">
      {/* Logo */}
      <div className="">
            <NavLink to="/problems">
                <img src={logo} alt="CodeJunkie" className='w-40 h-auto' />
            </NavLink>
      </div>

      {/* Nav Links */}
      <div className="flex items-center gap-6">
        <NavLink
          to="/problems"
          className={({ isActive }) =>
            `px-3 py-3 border-b-3 ${
              isActive ? "border-purple-400 text-purple-300" : "border-transparent"
            }`
          }
        >
          Problems
        </NavLink>
        <NavLink
          to="/contests"
          className={({ isActive }) =>
            `px-3 py-3 border-b-3 ${
              isActive ? "border-purple-400 text-purple-300" : "border-transparent"
            }`
          }
        >
          Contests
        </NavLink>
        <NavLink
          to="/leaderboards"
          className={({ isActive }) =>
            `px-3 py-3 border-b-3 ${
              isActive ? "border-purple-400 text-purple-300" : "border-transparent"
            }`
          }
        >
          Leaderboards
        </NavLink>
        {/* Profile Dropdown */}
        <div className="relative group">
          <button className="flex items-center gap-1 hover:text-purple-300 transition">
            <span>Profile</span>
          </button>
          <div className="absolute right-0 mt-2 w-40 bg-gray-800 text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 transition-all duration-200 z-10">
            <NavLink to="/profile" className="block px-4 py-2 hover:bg-gray-700">View Profile</NavLink>
            <button className="block w-full text-left px-4 py-2 hover:bg-gray-700">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
