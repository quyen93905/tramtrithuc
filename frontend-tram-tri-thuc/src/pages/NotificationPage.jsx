import { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import {
    fetchNotificationsByUser,
    markNotificationAsRead,
    markNotificationAsUnread,
    markAllNotificationsAsRead,
    deleteNotification,
    clearNotificationError,
} from "../store/slices/notificationSlice";
import showToast from "../utils/toast";
import PropTypes from "prop-types";

// Component hiển thị danh sách thông báo với bộ lọc, bulk actions, và modal xóa
const NotificationPage = ({ className = "" }) => {
    const dispatch = useDispatch();
    const { notifications, loading, error, currentPage, totalPages } = useSelector(
        (state) => state.notifications
    );
    // State cho modal xóa và danh sách ID được chọn
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, notificationId: null });
    const [selectedIds, setSelectedIds] = useState(new Set());
    // State cho bộ lọc: 'all', 'unread', 'read'
    const [filter, setFilter] = useState("all");

    // Xử lý lỗi từ Redux, hiển thị toast và xóa lỗi
    useEffect(() => {
        if (error) {
            showToast("error", error.message);
            dispatch(clearNotificationError());
        }
    }, [error, dispatch]);

    // Hàm lấy danh sách thông báo từ API
    const fetchNotifications = useCallback(() => {
        dispatch(fetchNotificationsByUser({ page: 1, limit: 10, unreadOnly: false }));
    }, [dispatch]);

    // Lấy thông báo khi component mount
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Lọc thông báo dựa trên filter
    const filteredNotifications = useMemo(() => {
        return notifications.filter((notification) => {
            if (filter === "unread") return !notification.isRead;
            if (filter === "read") return notification.isRead;
            return true;
        });
    }, [notifications, filter]);

    // Tính số thông báo chưa đọc
    const unreadCount = useMemo(
        () => notifications.filter((n) => !n.isRead).length,
        [notifications]
    );

    // Xử lý thay đổi trạng thái checkbox (đọc/chưa đọc)
    const handleCheckboxChange = useCallback(
        (notificationId, isRead) => {
            const action = isRead
                ? markNotificationAsUnread(notificationId)
                : markNotificationAsRead(notificationId);
            dispatch(action).then(fetchNotifications);
        },
        [dispatch, fetchNotifications]
    );

    // Chọn hoặc bỏ chọn tất cả thông báo
    const handleSelectAll = useCallback(() => {
        if (selectedIds.size === filteredNotifications.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredNotifications.map((n) => n._id)));
        }
    }, [selectedIds.size, filteredNotifications]);

    // Đánh dấu các thông báo đã chọn là đã đọc
    const handleBulkMarkAsRead = useCallback(() => {
        selectedIds.forEach((id) => {
            const notification = notifications.find((n) => n._id === id);
            if (notification && !notification.isRead) {
                dispatch(markNotificationAsRead(id));
            }
        });
        setSelectedIds(new Set());
        fetchNotifications();
    }, [dispatch, selectedIds, notifications, fetchNotifications]);

    // Xóa các thông báo đã chọn
    const handleBulkDelete = useCallback(() => {
        selectedIds.forEach((id) => {
            dispatch(deleteNotification(id));
        });
        setSelectedIds(new Set());
        fetchNotifications();
    }, [dispatch, selectedIds, fetchNotifications]);

    // Đánh dấu tất cả thông báo là đã đọc
    const handleMarkAllAsRead = useCallback(() => {
        dispatch(markAllNotificationsAsRead()).then(fetchNotifications);
    }, [dispatch, fetchNotifications]);

    // Mở modal xác nhận xóa
    const handleOpenDeleteModal = useCallback((notificationId) => {
        setDeleteModal({ isOpen: true, notificationId });
    }, []);

    // Đóng modal xóa
    const handleCloseModal = useCallback(() => {
        setDeleteModal({ isOpen: false, notificationId: null });
    }, []);

    // Xử lý xóa thông báo
    const handleDelete = useCallback(() => {
        if (deleteModal.notificationId) {
            dispatch(deleteNotification(deleteModal.notificationId)).then(fetchNotifications);
            setDeleteModal({ isOpen: false, notificationId: null });
        }
    }, [dispatch, deleteModal.notificationId, fetchNotifications]);

    // Format thời gian tương đối (VD: "30 phút trước")
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
        // Container chính với gradient background
        <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden pt-8 pb-16 ${className}`}>
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
            </div>
            {/* Nội dung chính */}
            <div className="relative z-10 pt-8 pb-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header với tiêu đề và bộ lọc */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            {/* Tiêu đề và số thông báo chưa đọc */}
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800 mb-2">Thông báo</h1>
                                <p className="text-gray-600 text-sm sm:text-base">
                                    {unreadCount > 0
                                        ? `Bạn có ${unreadCount} thông báo chưa đọc`
                                        : "Tất cả thông báo đã được đọc"}
                                </p>
                            </div>
                            {/* Bộ lọc và nút đánh dấu tất cả đã đọc */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                                {/* Bộ lọc: Tất cả, Chưa đọc, Đã đọc */}
                                <div className="flex bg-gray-100 rounded-lg p-1 w-full sm:w-auto">
                                    {[
                                        {
                                            key: "all",
                                            label: "Tất cả",
                                            count: notifications.length,
                                        },
                                        { key: "unread", label: "Chưa đọc", count: unreadCount },
                                        {
                                            key: "read",
                                            label: "Đã đọc",
                                            count: notifications.length - unreadCount,
                                        },
                                    ].map(({ key, label, count }) => (
                                        <button
                                            key={key}
                                            onClick={() => setFilter(key)}
                                            className={`flex-1 sm:flex-none px-3 py-2 rounded-md text-sm font-medium transition-all ${
                                                filter === key
                                                    ? "bg-white text-blue-600 shadow-sm"
                                                    : "text-gray-600 hover:text-gray-800"
                                            }`}
                                            aria-label={`Lọc ${label}`}
                                        >
                                            {label} ({count})
                                        </button>
                                    ))}
                                </div>
                                {/* Nút đánh dấu tất cả đã đọc */}
                                <button
                                    onClick={handleMarkAllAsRead}
                                    disabled={loading || unreadCount === 0}
                                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                                    aria-label="Đánh dấu tất cả đã đọc"
                                >
                                    <CheckCheck className="w-4 h-4" />
                                    Đánh dấu tất cả đã đọc
                                </button>
                            </div>
                        </div>
                        {/* Bulk actions khi có thông báo được chọn */}
                        {selectedIds.size > 0 && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                    <span className="text-sm text-blue-700 font-medium">
                                        Đã chọn {selectedIds.size} thông báo
                                    </span>
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <button
                                            onClick={handleBulkMarkAsRead}
                                            className="flex-1 sm:flex-none px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors flex items-center gap-1"
                                            aria-label="Đánh dấu đã đọc các thông báo đã chọn"
                                        >
                                            <Check className="w-3 h-3" />
                                            Đánh dấu đã đọc
                                        </button>
                                        <button
                                            onClick={handleBulkDelete}
                                            className="flex-1 sm:flex-none px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition-colors flex items-center gap-1"
                                            aria-label="Xóa các thông báo đã chọn"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Danh sách thông báo */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
                        {/* Skeleton loading */}
                        {loading && (
                            <div className="p-8">
                                <div className="animate-pulse space-y-4">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="flex items-center space-x-4">
                                            <div className="w-4 h-4 bg-gray-200 rounded" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-gray-200 rounded w-3/4" />
                                                <div className="h-3 bg-gray-200 rounded w-1/2" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {/* Thông báo khi danh sách rỗng */}
                        {!loading && filteredNotifications.length === 0 && (
                            <div className="p-12 text-center">
                                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">
                                    {filter === "unread"
                                        ? "Không có thông báo chưa đọc"
                                        : filter === "read"
                                          ? "Không có thông báo đã đọc"
                                          : "Không có thông báo nào"}
                                </p>
                            </div>
                        )}
                        {/* Danh sách thông báo */}
                        {!loading && filteredNotifications.length > 0 && (
                            <>
                                {/* Header chọn tất cả */}
                                <div className="p-4 border-b border-gray-200 bg-gray-50/50">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={
                                                selectedIds.size === filteredNotifications.length
                                            }
                                            onChange={handleSelectAll}
                                            className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-300"
                                            aria-label="Chọn tất cả thông báo"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            Chọn tất cả ({filteredNotifications.length})
                                        </span>
                                    </label>
                                </div>
                                {/* Danh sách từng thông báo */}
                                <div className="divide-y divide-gray-100">
                                    {filteredNotifications.map((notification) => (
                                        <div
                                            key={notification._id}
                                            className={`p-4 hover:bg-gray-50 transition-all duration-200 group ${
                                                !notification.isRead
                                                    ? "bg-blue-50/50 border-l-4 border-blue-500"
                                                    : ""
                                            } ${selectedIds.has(notification._id) ? "bg-blue-100" : ""}`}
                                        >
                                            <div className="flex items-start gap-4">
                                                {/* Checkbox chọn thông báo */}
                                                <label className="flex items-center pt-1">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.has(notification._id)}
                                                        onChange={(e) => {
                                                            const newSelected = new Set(
                                                                selectedIds
                                                            );
                                                            if (e.target.checked) {
                                                                newSelected.add(notification._id);
                                                            } else {
                                                                newSelected.delete(
                                                                    notification._id
                                                                );
                                                            }
                                                            setSelectedIds(newSelected);
                                                        }}
                                                        className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-300"
                                                        aria-label={`Chọn thông báo ${notification.message}`}
                                                    />
                                                </label>
                                                {/* Nội dung thông báo */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1">
                                                            <Link
                                                                to={notification.link}
                                                                onClick={() =>
                                                                    handleCheckboxChange(
                                                                        notification._id,
                                                                        false
                                                                    )
                                                                }
                                                                className="block text-gray-800 hover:text-blue-600 transition-colors group-hover:text-blue-600"
                                                            >
                                                                <p
                                                                    className={`text-sm leading-relaxed ${
                                                                        !notification.isRead
                                                                            ? "font-semibold"
                                                                            : ""
                                                                    }`}
                                                                >
                                                                    {notification.message}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-2">
                                                                    <span className="text-xs text-gray-500">
                                                                        {formatTimeAgo(
                                                                            notification.createdAt
                                                                        )}
                                                                    </span>
                                                                    {!notification.isRead && (
                                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                            Mới
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </Link>
                                                        </div>
                                                        {/* Action buttons (đọc/xóa) */}
                                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() =>
                                                                    handleCheckboxChange(
                                                                        notification._id,
                                                                        notification.isRead
                                                                    )
                                                                }
                                                                className={`p-2 rounded-full transition-colors ${
                                                                    notification.isRead
                                                                        ? "text-gray-400 hover:text-blue-500 hover:bg-blue-50"
                                                                        : "text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                                                }`}
                                                                title={
                                                                    notification.isRead
                                                                        ? "Đánh dấu chưa đọc"
                                                                        : "Đánh dấu đã đọc"
                                                                }
                                                                aria-label={
                                                                    notification.isRead
                                                                        ? "Đánh dấu chưa đọc"
                                                                        : "Đánh dấu đã đọc"
                                                                }
                                                            >
                                                                {notification.isRead ? (
                                                                    <Bell className="w-4 h-4" />
                                                                ) : (
                                                                    <Check className="w-4 h-4" />
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleOpenDeleteModal(
                                                                        notification._id
                                                                    )
                                                                }
                                                                className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                                title="Xóa thông báo"
                                                                aria-label="Xóa thông báo"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                        {/* Phân trang */}
                        {totalPages > 1 && (
                            <div className="p-6 border-t border-gray-200 bg-gray-50/50">
                                <div className="flex justify-center items-center space-x-4">
                                    <button
                                        onClick={() =>
                                            dispatch(
                                                fetchNotificationsByUser({
                                                    page: currentPage - 1,
                                                    limit: 10,
                                                    unreadOnly: false,
                                                })
                                            )
                                        }
                                        disabled={currentPage === 1 || loading}
                                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        aria-label="Trang trước"
                                    >
                                        Trang trước
                                    </button>
                                    <span className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg border">
                                        Trang {currentPage} / {totalPages}
                                    </span>
                                    <button
                                        onClick={() =>
                                            dispatch(
                                                fetchNotificationsByUser({
                                                    page: currentPage + 1,
                                                    limit: 10,
                                                    unreadOnly: false,
                                                })
                                            )
                                        }
                                        disabled={currentPage === totalPages || loading}
                                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        aria-label="Trang sau"
                                    >
                                        Trang sau
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Modal xác nhận xóa */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <Trash2 className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        Xác nhận xóa thông báo
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Hành động này không thể hoàn tác
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                    aria-label="Hủy xóa thông báo"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                    aria-label="Xác nhận xóa thông báo"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

NotificationPage.propTypes = {
    className: PropTypes.string,
};

export default NotificationPage;
