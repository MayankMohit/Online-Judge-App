import { NavLink } from "react-router-dom";
import logo from "../assets/images/dark_long.png";
import { Menu, X, User, ShieldCheck, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import ProfileDropdown from "./ProfileDropdown";
import { useAuthStore } from "../store/authStore";
import avatar from "../assets/images/avatar.png";
import ConfirmSignOutDialog from "../components/ConfirmSignOutDialog";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  const { logout, user } = useAuthStore();
  const toggleRef = useRef(null);

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinkStyle = ({ isActive }) =>
    `px-3 py-2 sm:border-b-2 transition ${
      isActive ? "sm:border-purple-400 text-purple-300" : "border-transparent"
    }`;

  useEffect(() => {
    const handleOutClick = (event) => {
      if (toggleRef.current && !toggleRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutClick);
    return () => document.removeEventListener("mousedown", handleOutClick);
  }, []);

  return (
    <nav className="fixed top-0 left-0 min-w-screen max-h-[4rem] bg-black border-b border-zinc-800 text-zinc-300 px-6 py-4 flex items-center justify-between shadow-lg shadow-fuchsia-900/30 z-50 select-none">

      {/* Logo */}
      <div className="w-full flex justify-center sm:justify-start relative left-3">
        <NavLink to="/problems">
          <img src={logo} draggable={false} alt="CodeJunkie" className="w-40 h-auto sm:block" />
        </NavLink>
      </div>

      {/* Mobile Menu */}
      <div ref={toggleRef} className="sm:hidden">
        <button
          onClick={toggleMenu}
          className="p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {isOpen && (
          <div className="absolute top-16 right-2 w-64 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-grow">

            {/* User info */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800 bg-zinc-800/50">
              <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-purple-500">
                <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                <p className="text-xs text-zinc-400 truncate">{user?.email}</p>
                {user?.role === "admin" && (
                  <span className="text-xs text-purple-400 font-semibold">Admin</span>
                )}
              </div>
            </div>

            {/* Nav links */}
            <div className="py-1 border-b border-zinc-800">
              {[
                { to: "/problems", label: "Problems" },
                { to: "/contests", label: "Contests" },
                { to: "/leaderboards", label: "Leaderboards" },
              ].map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={toggleMenu}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2.5 text-sm transition-colors ${
                      isActive
                        ? "text-purple-300 bg-purple-500/10"
                        : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>

            {/* Profile links */}
            <div className="py-1 border-b border-zinc-800">
              <NavLink
                to="/dashboard"
                onClick={toggleMenu}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                <User size={15} className="text-purple-400" />
                My Profile
              </NavLink>

              {user?.role === "admin" && (
                <NavLink
                  to="/admin"
                  onClick={toggleMenu}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                >
                  <ShieldCheck size={15} className="text-purple-400" />
                  Admin Panel
                </NavLink>
              )}
            </div>

            {/* Logout */}
            <div className="py-1">
              <button
                onClick={() => {
                  toggleMenu();
                  setShowSignOutDialog(true);
                }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-zinc-800 hover:text-red-300"
              >
                <LogOut size={15} />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Desktop */}
      <div className="hidden sm:flex items-center gap-6">
        <NavLink to="/problems" className={navLinkStyle}>Problems</NavLink>
        <NavLink to="/contests" className={navLinkStyle}>Contests</NavLink>
        <NavLink to="/leaderboards" className={navLinkStyle}>Leaderboards</NavLink>
        <ProfileDropdown />
      </div>

      {/* Confirm Dialog */}
      <ConfirmSignOutDialog
        open={showSignOutDialog}
        onClose={() => setShowSignOutDialog(false)}
        onConfirm={() => {
          logout();
          setShowSignOutDialog(false);
        }}
      />
    </nav>
  );
};

export default Navbar;