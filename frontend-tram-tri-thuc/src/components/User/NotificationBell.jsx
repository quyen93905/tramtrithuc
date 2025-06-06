import { useState, useEffect, useCallback } from "react";
import { Bell } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
    fetchNotificationsByUser,
    clearNotificationError,
    addNewNotification,
    markNotificationAsRead,
} from "../../store/slices/notificationSlice";
import showToast from "../../utils/toast";
import PropTypes from "prop-types";
import { io } from "socket.io-client";

const NotificationBell = ({ onClick, className = "" }) => {
    const dispatch = useDispatch();
    const { notifications, loading, error } = useSelector((state) => state.notifications);
    const userInfo = useSelector((state) => state.auth.user);
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    const [isHovered, setIsHovered] = useState(false);
    const [socket, setSocket] = useState(null);

    // Khởi tạo Socket.IO
    useEffect(() => {
        if (!userInfo?._id) return;

        const newSocket = io("http://localhost:5000", {
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        setSocket(newSocket);

        newSocket.on("connect", () => {
            newSocket.emit("join", userInfo._id);
        });

        newSocket.on("newNotification", (notification) => {
            dispatch(addNewNotification(notification));
            showToast(
                "info",
                <div className="flex items-start gap-3">
                    <Bell className="w-5 h-5 text-blue-500 mt-1" />
                    <div>
                        <p className="text-sm font-medium">{notification.message}</p>
                        <p className="text-xs text-gray-500">
                            {formatTimeAgo(notification.createdAt)}
                        </p>
                        <button
                            onClick={() => dispatch(markNotificationAsRead(notification._id))}
                            className="mt-2 text-xs text-blue-500 hover:text-blue-600"
                        >
                            Đánh dấu đã đọc
                        </button>
                    </div>
                </div>,
                {
                    position: "top-right",
                    autoClose: 5000,
                    closeOnClick: false,
                    pauseOnHover: true,
                    theme: "light",
                }
            );
        });

        return () => {
            newSocket.disconnect();
        };
    }, [dispatch, userInfo?._id]);

    // Xử lý lỗi
    useEffect(() => {
        if (error) {
            showToast("error", error.message);
            dispatch(clearNotificationError());
        }
    }, [error, dispatch]);

    // Lấy thông báo ban đầu
    const fetchNotifications = useCallback(() => {
        dispatch(fetchNotificationsByUser({ page: 1, limit: 10, unreadOnly: false }));
    }, [dispatch]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Format thời gian tương đối
    const formatTimeAgo = useCallback((dateString) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        if (diffInMinutes < 1) return "Vừa xong";
        if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
        return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
    }, []);

    return (
        <div className={`relative ${className}`}>
            <button
                onClick={onClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="relative p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label={`Thông báo${unreadCount > 0 ? ` (${unreadCount} chưa đọc)` : ""}`}
            >
                <Bell
                    className={`w-6 h-6 transition-colors duration-300 ${
                        unreadCount > 0 ? "text-blue-600" : "text-gray-600"
                    } ${isHovered ? "text-blue-700" : ""}`}
                />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
                        <span className="text-xs font-bold text-white">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    </span>
                )}
                {loading && (
                    <div className="absolute inset-0 rounded-full border-2 border-blue-200 border-t-blue-500 animate-spin" />
                )}
            </button>
            {isHovered && (
                <div
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap z-50"
                    role="tooltip"
                >
                    {unreadCount > 0 ? `${unreadCount} thông báo mới` : "Không có thông báo mới"}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                </div>
            )}
        </div>
    );
};

NotificationBell.propTypes = {
    onClick: PropTypes.func,
    className: PropTypes.string,
};

export default NotificationBell;
