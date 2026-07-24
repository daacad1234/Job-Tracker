import { FiMenu, FiUser, FiLogOut } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

/**
 * Top navigation bar.
 * Props:
 *  - title: current page title shown in the middle
 *  - onToggleSidebar: opens/closes the sidebar on mobile
 */
export default function Navbar({ title, onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden text-slate-800 text-2xl"
          aria-label="Toggle menu"
        >
          <FiMenu />
        </button>
        <h1 className="text-lg md:text-xl font-semibold text-slate-800">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col items-end leading-tight">
          <span className="text-sm font-medium text-slate-800">
            {user?.username || "Guest"}
          </span>
          <span className="text-xs text-gray-500">{user?.roleName || "Not logged in"}</span>
        </div>
        <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center">
          <FiUser />
        </div>
        <button
          onClick={handleLogout}
          className="text-gray-500 hover:text-red-500 text-xl ml-1"
          title="Logout"
        >
          <FiLogOut />
        </button>
      </div>
    </header>
  );
}
