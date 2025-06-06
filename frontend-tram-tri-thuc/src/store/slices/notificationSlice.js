import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import showToast from "../../utils/toast";
import customAxios from "../../utils/customAxios";

// ========== Thunks ==========

// Lấy danh sách thông báo của người dùng
export const fetchNotificationsByUser = createAsyncThunk(
    "notifications/fetchByUser",
    async (
        { page = 1, limit = 10, unreadOnly = false, sort = "-createdAt" },
        { rejectWithValue }
    ) => {
        try {
            const res = await customAxios.get("/notifications", {
                params: { page, limit, unreadOnly, sort },
            });
            return res.data.data;
        } catch (err) {
            let message;
            switch (err.response?.status) {
                case 401:
                    message = "Vui lòng đăng nhập để xem thông báo.";
                    break;
                case 400:
                    message = "Tham số không hợp lệ. Vui lòng kiểm tra lại.";
                    break;
                default:
                    message = err.response?.data?.message || "Không thể lấy danh sách thông báo.";
            }
            showToast("error", message);
            return rejectWithValue({ message, status: err.response?.status });
        }
    }
);

// Đánh dấu một thông báo là đã đọc
export const markNotificationAsRead = createAsyncThunk(
    "notifications/markAsRead",
    async (notificationId, { rejectWithValue }) => {
        try {
            const res = await customAxios.patch(`/notifications/${notificationId}/read`);
            return res.data.data;
        } catch (err) {
            let message;
            switch (err.response?.status) {
                case 404:
                    message = "Thông báo không tồn tại.";
                    break;
                case 403:
                    message = "Bạn không có quyền cập nhật thông báo này.";
                    break;
                case 401:
                    message = "Vui lòng đăng nhập để thực hiện thao tác.";
                    break;
                default:
                    message = err.response?.data?.message || "Không thể đánh dấu thông báo đã đọc.";
            }
            showToast("error", message);
            return rejectWithValue({ message, status: err.response?.status });
        }
    }
);

// Đánh dấu một thông báo là chưa đọc (mới)
export const markNotificationAsUnread = createAsyncThunk(
    "notifications/markAsUnread",
    async (notificationId, { rejectWithValue }) => {
        try {
            const res = await customAxios.patch(`/notifications/${notificationId}/unread`);
            return res.data.data;
        } catch (err) {
            let message;
            switch (err.response?.status) {
                case 404:
                    message = "Thông báo không tồn tại.";
                    break;
                case 403:
                    message = "Bạn không có quyền cập nhật thông báo này.";
                    break;
                case 401:
                    message = "Vui lòng đăng nhập để thực hiện thao tác.";
                    break;
                default:
                    message =
                        err.response?.data?.message || "Không thể đánh dấu thông báo chưa đọc.";
            }
            showToast("error", message);
            return rejectWithValue({ message, status: err.response?.status });
        }
    }
);

// Đánh dấu tất cả thông báo là đã đọc
export const markAllNotificationsAsRead = createAsyncThunk(
    "notifications/markAllAsRead",
    async (_, { rejectWithValue }) => {
        try {
            const res = await customAxios.patch("/notifications/read-all");
            showToast("success", res.data.message);
            return true;
        } catch (err) {
            let message;
            switch (err.response?.status) {
                case 401:
                    message = "Vui lòng đăng nhập để thực hiện thao tác.";
                    break;
                default:
                    message =
                        err.response?.data?.message ||
                        "Không thể đánh dấu tất cả thông báo đã đọc.";
            }
            showToast("error", message);
            return rejectWithValue({ message, status: err.response?.status });
        }
    }
);

// Xóa một thông báo
export const deleteNotification = createAsyncThunk(
    "notifications/delete",
    async (notificationId, { rejectWithValue }) => {
        try {
            const res = await customAxios.delete(`/notifications/${notificationId}`);
            showToast("success", res.data.message);
            return notificationId;
        } catch (err) {
            let message;
            switch (err.response?.status) {
                case 404:
                    message = "Thông báo không tồn tại.";
                    break;
                case 403:
                    message = "Bạn không có quyền xóa thông báo này.";
                    break;
                case 401:
                    message = "Vui lòng đăng nhập để thực hiện thao tác.";
                    break;
                default:
                    message = err.response?.data?.message || "Không thể xóa thông báo.";
            }
            showToast("error", message);
            return rejectWithValue({ message, status: err.response?.status });
        }
    }
);

// Xóa tất cả thông báo
export const deleteAllNotifications = createAsyncThunk(
    "notifications/deleteAll",
    async (_, { rejectWithValue }) => {
        try {
            const res = await customAxios.delete("/notifications");
            showToast("success", res.data.message);
            return true;
        } catch (err) {
            let message;
            switch (err.response?.status) {
                case 401:
                    message = "Vui lòng đăng nhập để thực hiện thao tác.";
                    break;
                default:
                    message = err.response?.data?.message || "Không thể xóa tất cả thông báo.";
            }
            showToast("error", message);
            return rejectWithValue({ message, status: err.response?.status });
        }
    }
);

// ========== Initial State ==========

const initialState = {
    notifications: [], // Danh sách thông báo
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    loading: false,
    error: null, // Lưu cả message và status
};

// ========== Helpers ==========

const handlePending = (state) => {
    state.loading = true;
    state.error = null;
};

const handleRejected = (state, action, messageFallback) => {
    state.loading = false;
    state.error = action.payload || { message: messageFallback };
};

// ========== Slice ==========

const notificationSlice = createSlice({
    name: "notifications",
    initialState,
    reducers: {
        resetNotificationState: (state) => {
            state.notifications = [];
            state.totalItems = 0;
            state.totalPages = 0;
            state.currentPage = 1;
            state.loading = false;
            state.error = null;
        },
        clearNotificationError: (state) => {
            state.error = null;
        },
        addNewNotification: (state, action) => {
            state.notifications.unshift({
                ...action.payload,
                message: action.payload.message || "Thông báo không có nội dung",
            });
            state.totalItems += 1;
            state.totalPages = Math.ceil(state.totalItems / 10);
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Notifications
            .addCase(fetchNotificationsByUser.pending, handlePending)
            .addCase(fetchNotificationsByUser.fulfilled, (state, action) => {
                state.loading = false;
                state.notifications = action.payload.items.map((notification) => ({
                    ...notification,
                    message: notification.message || "Thông báo không có nội dung",
                }));
                state.totalItems = action.payload.totalItems;
                state.totalPages = action.payload.totalPages;
                state.currentPage = action.payload.currentPage;
            })
            .addCase(fetchNotificationsByUser.rejected, (state, action) => {
                handleRejected(state, action, "Lấy danh sách thông báo thất bại.");
            })

            // Mark Notification as Read
            .addCase(markNotificationAsRead.pending, handlePending)
            .addCase(markNotificationAsRead.fulfilled, (state, action) => {
                state.loading = false;
                const notification = state.notifications.find((n) => n._id === action.payload._id);
                if (notification) {
                    notification.isRead = true;
                }
            })
            .addCase(markNotificationAsRead.rejected, (state, action) => {
                handleRejected(state, action, "Đánh dấu thông báo đã đọc thất bại.");
            })

            // Mark Notification as Unread (mới)
            .addCase(markNotificationAsUnread.pending, handlePending)
            .addCase(markNotificationAsUnread.fulfilled, (state, action) => {
                state.loading = false;
                const notification = state.notifications.find((n) => n._id === action.payload._id);
                if (notification) {
                    notification.isRead = false;
                }
            })
            .addCase(markNotificationAsUnread.rejected, (state, action) => {
                handleRejected(state, action, "Đánh dấu thông báo chưa đọc thất bại.");
            })

            // Mark All Notifications as Read
            .addCase(markAllNotificationsAsRead.pending, handlePending)
            .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
                state.loading = false;
                state.notifications.forEach((n) => (n.isRead = true));
            })
            .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
                handleRejected(state, action, "Đánh dấu tất cả thông báo đã đọc thất bại.");
            })

            // Delete Notification
            .addCase(deleteNotification.pending, handlePending)
            .addCase(deleteNotification.fulfilled, (state, action) => {
                state.loading = false;
                state.notifications = state.notifications.filter((n) => n._id !== action.payload);
                state.totalItems = Math.max(0, state.totalItems - 1);
            })
            .addCase(deleteNotification.rejected, (state, action) => {
                handleRejected(state, action, "Xóa thông báo thất bại.");
            })

            // Delete All Notifications
            .addCase(deleteAllNotifications.pending, handlePending)
            .addCase(deleteAllNotifications.fulfilled, (state) => {
                state.loading = false;
                state.notifications = [];
                state.totalItems = 0;
                state.totalPages = 0;
                state.currentPage = 1;
            })
            .addCase(deleteAllNotifications.rejected, (state, action) => {
                handleRejected(state, action, "Xóa tất cả thông báo thất bại.");
            });
    },
});

export const { resetNotificationState, clearNotificationError, addNewNotification } =
    notificationSlice.actions;

export default notificationSlice.reducer;
