import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import showToast from "../../utils/toast";
import customAxios from "../../utils/customAxios";
import { loginThunk, logoutThunk } from "./authSlice";
import { toggleFavorite } from "./documentSlice";

// Lấy thông tin người dùng
export const fetchUserInfo = createAsyncThunk(
    "user/fetchUserInfo",
    async (_, { rejectWithValue }) => {
        try {
            const response = await customAxios.get("/users/me");
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || { message: "Lỗi khi lấy thông tin người dùng.", error }
            );
        }
    }
);

// Cập nhật thông tin người dùng
export const updateUserInfo = createAsyncThunk(
    "user/updateUserInfo",
    async (data, { rejectWithValue, dispatch }) => {
        try {
            const allowedFields = ["name", "avatar", "email"];
            const filteredData = {};
            allowedFields.forEach((field) => {
                if (data[field] !== undefined) filteredData[field] = data[field];
            });

            if (Object.keys(filteredData).length === 0) {
                throw new Error("Không có dữ liệu hợp lệ để cập nhật");
            }

            // Validate email format
            if (filteredData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(filteredData.email)) {
                throw new Error("Email không hợp lệ");
            }

            const response = await customAxios.put("/users/me", filteredData);
            showToast("success", response.data.message);

            // Gọi fetchFavoriteDocuments để đồng bộ danh sách yêu thích
            dispatch(fetchFavoriteDocuments());
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || { message: "Lỗi khi cập nhật thông tin." }
            );
        }
    }
);

// Xóa tài khoản người dùng
export const deleteMyAccount = createAsyncThunk(
    "user/deleteMyAccount",
    async (_, { rejectWithValue, dispatch }) => {
        try {
            const response = await customAxios.delete("/users/me");
            showToast("success", response.data.message);
            // Gọi logoutThunk để clear session
            dispatch(logoutThunk());
            return null;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: "Lỗi khi xóa tài khoản." });
        }
    }
);

// Lấy lịch sử tài liệu đã xem
export const fetchViewedHistory = createAsyncThunk(
    "user/fetchUserHistory",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await customAxios.get("/users/me/history", { params });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: "Lỗi khi lấy lịch sử xem." });
        }
    }
);

// Lấy danh sách tài liệu đã tải xuống
export const fetchDownloadedHistory = createAsyncThunk(
    "user/fetchUserDownloads",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await customAxios.get("/users/me/downloads", { params });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: "Lỗi khi lấy lịch sử tải." });
        }
    }
);

// Lấy danh sách tài liệu đã yêu thích
export const fetchFavoriteDocuments = createAsyncThunk(
    "user/fetchUserFavorites",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await customAxios.get("/users/me/favorites", { params });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || { message: "Lỗi khi lấy danh sách yêu thích." }
            );
        }
    }
);

// Initial State
const initialState = {
    userInfo: null,
    viewedHistory: [],
    favoriteDocuments: [],
    downloadedHistory: [],
    loading: false,
    error: null,
    pagination: {
        viewedHistory: { totalItems: 0, totalPages: 0, currentPage: 1, limit: 10 },
        favoriteDocuments: { totalItems: 0, totalPages: 0, currentPage: 1, limit: 10 },
        downloadedHistory: { totalItems: 0, totalPages: 0, currentPage: 1, limit: 10 },
    },
};

// ========== Helpers ==========

const handlePending = (state) => {
    state.loading = true;
    state.error = null;
};

const handleRejected = (state, action) => {
    state.loading = false;
    let errorMessage = action.payload?.message || "Đã xảy ra lỗi không xác định.";
    if (action.payload?.status === 401) {
        errorMessage = "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.";
    } else if (action.payload?.status === 404) {
        errorMessage = action.payload?.message || "Không tìm thấy tài nguyên.";
    }
    state.error = errorMessage;
    console.error("API Error:", action.payload || action.error);
    showToast("error", errorMessage);
};

// ========== Slice ==========

// User Slice
const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        resetUserState: (state) => {
            state.userInfo = null;
            state.viewedHistory = [];
            state.favoriteDocuments = [];
            state.downloadedHistory = [];
            state.loading = false;
            state.error = null;
            state.pagination = {
                viewedHistory: { totalItems: 0, totalPages: 0, currentPage: 1, limit: 100 },
                favoriteDocuments: { totalItems: 0, totalPages: 0, currentPage: 1, limit: 100 },
                downloadedHistory: { totalItems: 0, totalPages: 0, currentPage: 1, limit: 10 },
            };
        },
    },
    extraReducers: (builder) => {
        // Đồng bộ với login/logout
        builder
            .addCase(loginThunk.fulfilled, (state, action) => {
                state.userInfo = action.payload.user; // Đồng bộ userInfo ngay sau login
            })
            .addCase(logoutThunk.fulfilled, (state) => {
                return initialState; // Reset userSlice khi logout
            });

        // fetchUserInfo
        builder
            .addCase(fetchUserInfo.pending, handlePending)
            .addCase(fetchUserInfo.fulfilled, (state, action) => {
                state.loading = false;
                state.userInfo = action.payload;
            })
            .addCase(fetchUserInfo.rejected, handleRejected);

        // updateUserInfo
        builder
            .addCase(updateUserInfo.pending, handlePending)
            .addCase(updateUserInfo.fulfilled, (state, action) => {
                state.loading = false;
                state.userInfo = action.payload;
                // favoriteDocuments đã được đồng bộ qua dispatch(fetchFavoriteDocuments)
            })
            .addCase(updateUserInfo.rejected, handleRejected);

        // deleteMyAccount
        builder
            .addCase(deleteMyAccount.pending, handlePending)
            .addCase(deleteMyAccount.fulfilled, (state) => {
                return initialState;
            })
            .addCase(deleteMyAccount.rejected, handleRejected);

        // fetchUserHistory
        builder
            .addCase(fetchViewedHistory.pending, handlePending)
            .addCase(fetchViewedHistory.fulfilled, (state, action) => {
                state.loading = false;
                state.viewedHistory = action.payload.items;
                state.pagination.viewedHistory = {
                    totalItems: action.payload.totalItems || 0,
                    totalPages: action.payload.totalPages || 1,
                    currentPage: action.payload.currentPage || 1,
                    limit: action.payload.limit || state.pagination.viewedHistory.limit,
                };
            })
            .addCase(fetchViewedHistory.rejected, handleRejected);

        // fetchUserDownloads
        builder
            .addCase(fetchDownloadedHistory.pending, handlePending)
            .addCase(fetchDownloadedHistory.fulfilled, (state, action) => {
                state.loading = false;
                state.downloadedHistory = action.payload.items;
                state.pagination.downloadedHistory = {
                    totalItems: action.payload.totalItems || 0,
                    totalPages: action.payload.totalPages || 1,
                    currentPage: action.payload.currentPage || 1,
                    limit: action.payload.limit || state.pagination.downloadedHistory.limit,
                };
            })
            .addCase(fetchDownloadedHistory.rejected, handleRejected);

        // fetchUserFavorites
        builder
            .addCase(fetchFavoriteDocuments.pending, handlePending)
            .addCase(fetchFavoriteDocuments.fulfilled, (state, action) => {
                state.loading = false;
                state.favoriteDocuments = action.payload.items;
                state.pagination.favoriteDocuments = {
                    totalItems: action.payload.totalItems || 0,
                    totalPages: action.payload.totalPages || 1,
                    currentPage: action.payload.currentPage || 1,
                    limit: action.payload.limit || state.pagination.favoriteDocuments.limit,
                };
            })
            .addCase(fetchFavoriteDocuments.rejected, handleRejected);

        // toggleFavorite từ documentSlice
        builder
            .addCase(toggleFavorite.pending, handlePending)
            .addCase(toggleFavorite.fulfilled, (state, action) => {
                state.loading = false;
                // Không cập nhật favoriteDocuments trực tiếp, đã gọi fetchFavoriteDocuments trong toggleFavorite
                showToast("success", action.payload.message);
            })
            .addCase(toggleFavorite.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload.message;
                showToast("error", action.payload);
            });
    },
});

export const { clearError, resetUserState } = userSlice.actions;
export default userSlice.reducer;
