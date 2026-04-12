import avatar from "../assets/images/avatar.png";
import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { User, LayoutDashboard, LogOut, ShieldCheck, ChevronDown } from "lucide-react";
import ConfirmSignOutDialog from "../components/ConfirmSignOutDialog";

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  const dropdownRef = useRef(null);
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  const toggleProfileMenu = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar */}
      <button
        onClick={toggleProfileMenu}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-zinc-800"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-zinc-700 hover:ring-purple-500">
          <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
        </div>
        <div className="hidden sm:flex flex-col items-start">
          <span className="text-sm font-medium text-white">
            {user?.name?.split(" ")[0]}
          </span>
          {user?.role === "admin" && (
            <span className="text-xs text-purple-400 font-semibold">Admin</span>
          )}
        </div>
        <ChevronDown size={14} className={`${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50">

          <div className="px-4 py-3 border-b border-zinc-800">
            <p className="text-sm font-semibold text-white">{user?.name}</p>
            <p className="text-xs text-zinc-400">{user?.email}</p>
          </div>

          <div className="py-1">
            <NavLink
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800"
            >
              <User size={15} className="text-purple-400" />
              My Profile
            </NavLink>

            {user?.role === "admin" && (
              <NavLink
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800"
              >
                <ShieldCheck size={15} className="text-purple-400" />
                Admin Panel
              </NavLink>
            )}
          </div>

          {/* Logout */}
          <div className="border-t border-zinc-800 py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                setShowSignOutDialog(true);
              }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-zinc-800"
            >
              <LogOut size={15} />
              Sign out
            </button>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmSignOutDialog
        open={showSignOutDialog}
        onClose={() => setShowSignOutDialog(false)}
        onConfirm={() => {
          logout();
          navigate("/login", { replace: true });
        }}
      />
    </div>
  );
};

export default ProfileDropdown;