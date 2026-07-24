import { NavLink } from "react-router-dom";
import {
  FiGrid,
  FiBox,
  FiUsers,
  FiShoppingCart,
  FiBarChart2,
  FiUserCheck,
  FiInfo,
} from "react-icons/fi";

const links = [
  { to: "/", label: "Dashboard", icon: <FiGrid /> },
  { to: "/products", label: "Products", icon: <FiBox /> },
  { to: "/customers", label: "Customers", icon: <FiUsers /> },
  { to: "/sales", label: "Sales", icon: <FiShoppingCart /> },
  { to: "/users", label: "Users", icon: <FiUserCheck /> },
  { to: "/reports", label: "Reports", icon: <FiBarChart2 /> },
  { to: "/about", label: "About", icon: <FiInfo /> },
];

/**
 * Sidebar navigation.
 * Props:
 *  - open: whether the sidebar is visible on mobile
 *  - onClose: closes the sidebar after a link is clicked (mobile)
 */
export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* backdrop on mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:static top-0 left-0 h-full md:h-auto w-64 bg-slate-800 text-gray-200 flex flex-col z-40 transform transition-transform duration-200
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="h-16 flex items-center gap-2 px-5 border-b border-slate-700">
          <div className="w-8 h-8 rounded bg-emerald-500 flex items-center justify-center font-bold text-slate-900">
            A
          </div>
          <span className="font-semibold text-white text-lg">Almunim</span>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white border-l-4 border-emerald-500"
                    : "text-gray-300 hover:bg-slate-700 hover:text-white"
                }`
              }
            >
              <span className="text-lg">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-slate-700 text-xs text-gray-400">
          Aluminium Management System
          <br />© 2026 JUST — CA235
        </div>
      </aside>
    </>
  );
}
