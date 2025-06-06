import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { LogOut, Settings, Bell, User } from "lucide-react";
import showToast from "../../../utils/toast";

export default function AdminNavbar() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        try {
            // Xóa thông tin khỏi localStorage
            localStorage.removeItem("accessToken");
            localStorage.removeItem("userInfo");

            // Xóa refreshToken cookie (nếu có)
            document.cookie = "refreshToken=; Max-Age=0; path=/; secure; sameSite=strict";

            // Reset auth state
            dispatch({ type: "auth/logout" });

            // Reset user state
            dispatch({ type: "user/resetUserState" });

            // Chuyển hướng về trang đăng nhập admin
            navigate("/auth/login", { replace: true });

            // Hiển thị thông báo thành công
            showToast("success", "Đăng xuất thành công!");
        } catch (error) {
            console.error("Lỗi khi đăng xuất:", error);
            showToast("error", "Có lỗi xảy ra khi đăng xuất");
        }
    };

    return (
        <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 backdrop-blur-sm border-b border-slate-700/50 shadow-2xl">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex justify-between items-center">
                    {/* Logo và Brand */}
                    <Link
                        to="/admin"
                        className="group flex items-center gap-3 text-white hover:text-blue-400 transition-all duration-300"
                    >
                        <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300 group-hover:scale-105">
                                <Settings
                                    size={20}
                                    className="text-white group-hover:rotate-90 transition-transform duration-500"
                                />
                            </div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                                Admin Panel
                            </span>
                            <span className="text-xs text-slate-400 font-medium">
                                Management Dashboard
                            </span>
                        </div>
                    </Link>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        {/* Notifications */}
                        <button className="relative p-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-200 group">
                            <Bell size={20} className="group-hover:animate-pulse" />
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                        </button>

                        {/* Profile */}
                        <button className="flex items-center gap-2 p-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-200">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                <User size={16} className="text-white" />
                            </div>
                            <span className="text-sm font-medium hidden sm:block">Admin</span>
                        </button>

                        {/* Divider */}
                        <div className="w-px h-8 bg-slate-600/50"></div>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="group flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105 active:scale-95"
                        >
                            <LogOut
                                size={18}
                                className="group-hover:translate-x-0.5 transition-transform duration-200"
                            />
                            <span className="font-medium text-sm">Đăng xuất</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Decorative bottom border */}
            <div className="h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
        </nav>
    );
}
