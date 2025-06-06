import { Link, useNavigate } from "react-router-dom";
import { Bell, UserCircle, Search, Upload, Home, Menu, LogOut, User, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import showToast from "../../../utils/toast";
import LoadingSpinner from "../../Common/LoadingSpinner";
import { logoutThunk } from "../../../store/slices/authSlice";
import { fetchUserInfo, resetUserState } from "../../../store/slices/userSlice";

export default function Navbar() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, loading: authLoading } = useSelector((state) => state.auth);
    const { userInfo, loading: userLoading, error: userError } = useSelector((state) => state.user);

    const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);
    const closeDropdown = () => setIsDropdownOpen(false);
    const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

    // Lấy thông tin người dùng khi đã đăng nhập
    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchUserInfo());
        }
    }, [dispatch, isAuthenticated]);

    // Xử lý lỗi khi lấy thông tin người dùng
    useEffect(() => {
        if (userError) {
            showToast("error", userError);
        }
    }, [userError]);

    // Đóng dropdown khi không đăng nhập
    useEffect(() => {
        if (!isAuthenticated) {
            closeDropdown();
            dispatch(resetUserState()); // Reset user state khi đăng xuất
        }
    }, [isAuthenticated, dispatch]);

    // Xử lý đăng xuất
    const handleLogout = async () => {
        try {
            closeDropdown();
            await dispatch(logoutThunk()).unwrap();
            setTimeout(() => navigate("/"), 100);
        } catch (error) {
            showToast("error", "Đăng xuất thất bại. Vui lòng thử lại.");
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest(".dropdown-avatar")) {
                closeDropdown();
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    const navLinks = [
        { to: "/", icon: Home, label: "Trang chủ" },
        { to: "/search", icon: Search, label: "Tìm kiếm" },
        { to: "/uploader/upload", icon: Upload, label: "Tải lên" },
    ];

    return (
        <motion.nav 
            className="bg-white/90 backdrop-blur-md shadow-lg sticky top-0 z-40"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link 
                        to="/" 
                        className="flex items-center space-x-2 text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                        <span className="text-3xl">📚</span>
                        <span className="hidden sm:block">DocuLib</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className="nav-link flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-md text-sm font-medium"
                            >
                                <link.icon className="w-4 h-4" />
                                <span>{link.label}</span>
                            </Link>
                        ))}
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center space-x-4">
                        {/* Notifications */}
                        <Link
                            to="/user/notifications"
                            className="relative text-gray-600 hover:text-blue-600 transition-colors p-2"
                        >
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                        </Link>

                        {/* User Menu */}
                        {isAuthenticated ? (
                            <div className="relative dropdown-avatar">
                                {authLoading || userLoading ? (
                                    <LoadingSpinner size="small" />
                                ) : (
                                    <button
                                        onClick={toggleDropdown}
                                        className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                                    >
                                        <img
                                            src={userInfo?.avatar || "/src/assets/default-avatar.png"}
                                            onError={(e) => (e.currentTarget.src = "/src/assets/default-avatar.png")}
                                            alt="User Avatar"
                                            className="w-8 h-8 rounded-full ring-2 ring-blue-100 hover:ring-blue-300 transition-all"
                                        />
                                    </button>
                                )}

                                <AnimatePresence>
                                    {isDropdownOpen && isAuthenticated && userInfo && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
                                        >
                                            {/* User Info Section */}
                                            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                                                <div className="flex items-center space-x-4">
                                                    <img
                                                        src={userInfo?.avatar || "/src/assets/default-avatar.png"}
                                                        onError={(e) => (e.currentTarget.src = "/src/assets/default-avatar.png")}
                                                        alt="User Avatar"
                                                        className="w-12 h-12 rounded-full ring-4 ring-white shadow-md"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-base font-semibold text-gray-900 truncate">
                                                            {userInfo.name || "Người dùng"}
                                                        </p>
                                                        <p className="text-sm text-gray-500 truncate">
                                                            {userInfo.email || "Không có email"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Menu Items */}
                                            <div className="p-2 bg-white">
                                                <Link
                                                    to="/user/profile"
                                                    onClick={closeDropdown}
                                                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors group"
                                                >
                                                    <User className="w-5 h-5 group-hover:stroke-blue-600" />
                                                    <span className="text-sm font-medium">Hồ sơ cá nhân</span>
                                                </Link>

                                                <Link
                                                    to="/user/settings"
                                                    onClick={closeDropdown}
                                                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors group"
                                                >
                                                    <Settings className="w-5 h-5 group-hover:stroke-blue-600" />
                                                    <span className="text-sm font-medium">Cài đặt tài khoản</span>
                                                </Link>

                                                <div className="h-[1px] bg-gray-100 my-2 mx-4"></div>

                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
                                                    disabled={authLoading || userLoading}
                                                >
                                                    <LogOut className="w-5 h-5 group-hover:stroke-red-700" />
                                                    <span className="text-sm font-medium">Đăng xuất</span>
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <Link
                                to="/auth/login"
                                className="flex items-center space-x-2 text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                <UserCircle className="w-4 h-4" />
                                <span>Đăng nhập</span>
                            </Link>
                        )}

                        {/* Mobile menu button */}
                        <button
                            onClick={toggleMobileMenu}
                            className="md:hidden p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-100 transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-gray-100"
                    >
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md text-base font-medium transition-colors"
                                >
                                    <link.icon className="w-5 h-5" />
                                    <span>{link.label}</span>
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Styles */}
            <style jsx>{`
                .nav-link {
                    position: relative;
                }

                .nav-link::after {
                    content: '';
                    position: absolute;
                    bottom: -2px;
                    left: 50%;
                    width: 0;
                    height: 2px;
                    background-color: #2563eb;
                    transition: all 0.3s ease;
                    transform: translateX(-50%);
                }

                .nav-link:hover::after {
                    width: 100%;
                }

                @media (max-width: 768px) {
                    .nav-link::after {
                        display: none;
                    }
                }
            `}</style>
        </motion.nav>
    );
}
