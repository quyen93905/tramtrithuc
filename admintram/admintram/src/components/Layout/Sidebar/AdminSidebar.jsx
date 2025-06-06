import { useState } from "react";
import {
  Users,
  FileCheck,
  Layers,
  BarChart,
  MessageSquare,
  Settings,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState(location.pathname);

  const navItems = [
    { to: "/admin/dashboard", icon: BarChart, label: "Thống kê" },
    { to: "/admin/users", icon: Users, label: "Người dùng" },
    { to: "/admin/approvals", icon: FileCheck, label: "Duyệt tài liệu" },
    { to: "/admin/categories", icon: Layers, label: "Danh mục" },
    // { to: "/admin/comments", icon: MessageSquare, label: "Bình luận" },
  ];

  const handleNavigation = (to) => {
    setActiveItem(to);
    navigate(to);
  };

  return (
    <aside className="w-72 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white min-h-screen shadow-2xl border-r border-slate-700">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <BarChart size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Quản trị
            </h2>
            <p className="text-slate-400 text-sm">Admin Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = activeItem === to;
          return (
            <button
              key={to}
              onClick={() => handleNavigation(to)}
              className={`group flex items-center gap-3 p-3 rounded-xl transition-all duration-300 relative overflow-hidden w-full text-left ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 transform scale-[1.02]"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/50 hover:transform hover:scale-[1.01]"
              }`}
            >
              {/* Active indicator */}
              <div
                className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-400 to-purple-500 transition-all duration-300 ${
                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-50"
                }`}
              />

              {/* Icon container */}
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 ${
                  isActive
                    ? "bg-white/20 shadow-md"
                    : "group-hover:bg-slate-700/50"
                }`}
              >
                <Icon
                  size={18}
                  className="transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              {/* Label */}
              <span className="font-medium text-sm tracking-wide">{label}</span>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/10 group-hover:to-purple-600/10 transition-all duration-300 rounded-xl" />
            </button>
          );
        })}
      </nav>

      {/* Settings Section */}
      <div className="mt-8 p-4 border-t border-slate-700/50">
        <button
          onClick={() => handleNavigation("/admin/settings")}
          className={`group flex items-center gap-3 p-3 rounded-xl transition-all duration-300 relative overflow-hidden w-full text-left ${
            activeItem === "/admin/settings"
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25 transform scale-[1.02]"
              : "text-slate-300 hover:text-white hover:bg-slate-800/50 hover:transform hover:scale-[1.01]"
          }`}
        >
          {/* Active indicator */}
          <div
            className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-emerald-400 to-teal-500 transition-all duration-300 ${
              activeItem === "/admin/settings"
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-50"
            }`}
          />

          {/* Icon container */}
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 ${
              activeItem === "/admin/settings"
                ? "bg-white/20 shadow-md"
                : "group-hover:bg-slate-700/50"
            }`}
          >
            <Settings
              size={18}
              className="transition-transform duration-300 group-hover:scale-110"
            />
          </div>

          {/* Label */}
          <span className="font-medium text-sm tracking-wide">Cài đặt</span>

          {/* Hover effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/0 to-teal-600/0 group-hover:from-emerald-600/10 group-hover:to-teal-600/10 transition-all duration-300 rounded-xl" />
        </button>
      </div>
    </aside>
  );
}
