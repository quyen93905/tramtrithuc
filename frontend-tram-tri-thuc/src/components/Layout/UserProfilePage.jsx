import { Outlet, NavLink } from "react-router-dom";
import { motion } from "framer-motion";

const tabs = [
    { to: "/user/profile", label: "Thông tin", end: true },
    { to: "downloads", label: "Đã tải" },
    { to: "favorites", label: "Yêu thích" },
    { to: "views", label: "Đã xem" },
];

export default function UserProfilePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden -mt-16">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
            </div>
            {/* Content */}
            <div className="relative z-10 pt-16 max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">
                        👤 Hồ sơ cá nhân
                    </h2>

                    <nav className="flex flex-wrap gap-4 justify-center mb-8">
                        {tabs.map(({ to, label, end }) => (
                            <NavLink
                                key={to}
                                to={to}
                                end={end}
                                className={({ isActive }) =>
                                    `px-6 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2
                                    ${
                                        isActive
                                            ? "bg-green-500 text-white shadow-lg shadow-green-200"
                                            : "bg-white/80 text-gray-700 hover:bg-white hover:shadow-md"
                                    }`
                                }
                            >
                                {label}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/20">
                        <Outlet />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}