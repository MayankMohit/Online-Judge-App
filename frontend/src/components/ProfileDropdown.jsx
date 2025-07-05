import avatar from "../assets/images/avatar.png";
import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { logout } = useAuthStore();
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
      {/* Avatar Button */}
      <button
        onClick={toggleProfileMenu}
        className="w-8 h-8 mt-3 rounded-full overflow-hidden"
      >
        <img
          src={avatar}
          alt="Profile"
          className="w-full h-full object-cover"
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-gray-800 text-sm rounded-md shadow-lg z-10">
          <NavLink
            to="/dashboard"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 hover:bg-gray-700"
          >
            View Profile
          </NavLink>
          <button
            to="/logout"
            className="block w-full text-left px-4 py-2 hover:bg-gray-700"
            onClick={() => {
              setIsOpen(false);
              logout();
              navigate("/login", { replace: true});
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
