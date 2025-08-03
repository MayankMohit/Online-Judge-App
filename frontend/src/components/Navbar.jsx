import { NavLink } from "react-router-dom";
import logo from "../assets/images/dark_long.png";
import { Menu, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import ProfileDropdown from "./ProfileDropdown";
import { useAuthStore } from "../store/authStore";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
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
    }
    document.addEventListener("mousedown", handleOutClick);
    return () => document.removeEventListener("mousedown", handleOutClick);
  }, [])

  return (
    <nav className="fixed top-0 left-0 min-w-screen max-h-[4rem] bg-gray-900 text-zinc-300 px-6 py-4 flex items-center justify-between shadow-lg shadow-fuchsia-900/60 z-50">
      
      {/* Logo */}
      <div className="w-full flex justify-center sm:justify-start relative left-3">
        <NavLink to="/problems">
          <img src={logo} alt="CodeJunkie" className="w-40 h-auto sm:block " />
        </NavLink>
      </div>

      {/* Hamburger Menu for Mobile */}
      <button className="sm:hidden" onClick={toggleMenu}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Nav Links */}
      <div className="hidden sm:flex items-center gap-6">
        <NavLink to="/problems" className={navLinkStyle}>
          Problems
        </NavLink>
        <NavLink to="/contests" className={navLinkStyle}>
          Contests
        </NavLink>
        <NavLink to="/leaderboards" className={navLinkStyle}>
          Leaderboards
        </NavLink>
        <ProfileDropdown />
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="sm:hidden flex flex-col gap-3 z-10 bg-gray-800 text-sm rounded-md shadow-lg p-5 absolute top-16 right-2 w-40"
          ref={toggleRef}>
          <NavLink to="/problems" className={navLinkStyle} onClick={toggleMenu}>Problems</NavLink>
          <NavLink to="/contests" className={navLinkStyle} onClick={toggleMenu}>Contests</NavLink>
          <NavLink to="/leaderboards" className={navLinkStyle} onClick={toggleMenu}>Leaderboards</NavLink>
          <NavLink to="/dashboard" className="px-3 py-2 hover:text-purple-300" onClick={toggleMenu}>View Profile</NavLink>
        {user.role === "admin" && <NavLink to="/admin" className="px-3 py-2 hover:text-purple-300" onClick={toggleMenu}>Admin Panel</NavLink>}
          <NavLink to="/login" className="text-left px-3 py-2 hover:text-purple-300" onClick={logout}>Logout</NavLink>
        </div>
      )}

    </nav>
  );
};

export default Navbar;
