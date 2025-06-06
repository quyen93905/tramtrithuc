import { NavLink } from "react-router-dom";
import { Bell, FileText, Star, Upload, User, ChevronRight } from "lucide-react";

export default function Sidebar() {
    return (
        <aside className="h-screen -mt-16 pt-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl relative overflow-hidden backdrop-blur-sm">
            {/* Advanced decorative elements */}
            <div className="absolute inset-0">
                {/* Animated gradient orbs */}
                <div className="absolute top-20 -right-16 w-40 h-40 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-40 -left-20 w-32 h-32 bg-gradient-to-r from-cyan-400/15 to-blue-400/15 rounded-full blur-2xl animate-pulse delay-1000"></div>
                <div className="absolute bottom-32 right-8 w-24 h-24 bg-gradient-to-r from-indigo-400/10 to-purple-400/10 rounded-full blur-xl animate-pulse delay-2000"></div>
                
                {/* Glass morphism overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent"></div>
            </div>

            {/* Content container */}
            <div className="relative z-10 h-full">
                {/* Header */}
                <div className="p-6 border-b border-white/10 bg-white/[0.02] backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-lg"></span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                            DocuLib
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">Quản lý tài khoản</p>
                        </div>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="p-4">
                    <div className="space-y-1.5">
                        <NavLink
                            to="/user/profile"
                            className={({ isActive }) => `
                                group flex items-center gap-3 px-4 py-3 rounded-xl
                                transition-all duration-300 ease-out relative overflow-hidden
                                ${
                                    isActive
                                        ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white shadow-lg border border-blue-400/20"
                                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                                }
                            `}
                        >
                            <div className={`p-2 rounded-lg transition-colors duration-300 ${
                                ({ isActive }) => isActive ? "bg-blue-500/20" : "bg-slate-700/50 group-hover:bg-slate-600/50"
                            }`}>
                                <User className="w-[18px] h-[18px]" />
                            </div>
                            <span className="font-medium flex-1">Hồ sơ cá nhân</span>
                            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                        </NavLink>

                        <NavLink
                            to="/rating"
                            className={({ isActive }) => `
                                group flex items-center gap-3 px-4 py-3 rounded-xl
                                transition-all duration-300 ease-out relative overflow-hidden
                                ${
                                    isActive
                                        ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-white shadow-lg border border-yellow-400/20"
                                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                                }
                            `}
                        >
                            <div className={`p-2 rounded-lg transition-colors duration-300 ${
                                ({ isActive }) => isActive ? "bg-yellow-500/20" : "bg-slate-700/50 group-hover:bg-slate-600/50"
                            }`}>
                                <Star className="w-[18px] h-[18px]" />
                            </div>
                            <span className="font-medium flex-1">Hệ thống đánh giá</span>
                            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                        </NavLink>

                        <NavLink
                            to="/uploader/my-documents"
                            className={({ isActive }) => `
                                group flex items-center gap-3 px-4 py-3 rounded-xl
                                transition-all duration-300 ease-out relative overflow-hidden
                                ${
                                    isActive
                                        ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-white shadow-lg border border-green-400/20"
                                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                                }
                            `}
                        >
                            <div className={`p-2 rounded-lg transition-colors duration-300 ${
                                ({ isActive }) => isActive ? "bg-green-500/20" : "bg-slate-700/50 group-hover:bg-slate-600/50"
                            }`}>
                                <FileText className="w-[18px] h-[18px]" />
                            </div>
                            <span className="font-medium flex-1">Tài liệu của tôi</span>
                            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                        </NavLink>

                        <NavLink
                            to="/uploader/upload"
                            className={({ isActive }) => `
                                group flex items-center gap-3 px-4 py-3 rounded-xl
                                transition-all duration-300 ease-out relative overflow-hidden
                                ${
                                    isActive
                                        ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white shadow-lg border border-purple-400/20"
                                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                                }
                            `}
                        >
                            <div className={`p-2 rounded-lg transition-colors duration-300 ${
                                ({ isActive }) => isActive ? "bg-purple-500/20" : "bg-slate-700/50 group-hover:bg-slate-600/50"
                            }`}>
                                <Upload className="w-[18px] h-[18px]" />
                            </div>
                            <span className="font-medium flex-1">Đăng tài liệu</span>
                            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                        </NavLink>

                        <NavLink
                            to="/user/notifications"
                            className={({ isActive }) => `
                                group flex items-center gap-3 px-4 py-3 rounded-xl
                                transition-all duration-300 ease-out relative overflow-hidden
                                ${
                                    isActive
                                        ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-white shadow-lg border border-cyan-400/20"
                                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                                }
                            `}
                        >
                            <div className={`p-2 rounded-lg transition-colors duration-300 relative ${
                                ({ isActive }) => isActive ? "bg-cyan-500/20" : "bg-slate-700/50 group-hover:bg-slate-600/50"
                            }`}>
                                <Bell className="w-[18px] h-[18px]" />
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            </div>
                            <span className="font-medium flex-1">Thông báo</span>
                            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                        </NavLink>
                    </div>
                </nav>
            </div>
        </aside>
    );
}