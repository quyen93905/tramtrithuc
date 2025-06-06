import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import showToast from "../../utils/toast";
import customAxios from "../../utils/customAxios";
import debounce from "lodash/debounce";

// ========== Thunks ==========

// Làm mới danh sách bình luận admin với debounce
const debouncedFetchAdminComments = debounce(
    async (params, dispatch) => {
        try {
            dispatch(fetchAdminComments(params));
        } catch (err) {
            // Lỗi đã được xử lý trong rejected của fetchAdminComments
        }
    },
    500,
    { leading: false, trailing: true }
);

// Lấy danh sách bình luận (lọc theo báo cáo)
export const fetchAdminComments = createAsyncThunk(
    "admin/fetchComments",
    async (params, { rejectWithValue }) => {
        try {
            const res = await customAxios.get("/admin/comments", { params });
            return {
                ...res.data.data,
                items: res.data.data.items.map((comment) => ({
                    ...comment,
                    user: {
                        name: comment.user?.name || comment.user?.email || "Ẩn danh",
                        email: comment.user?.email || "",
                    },
                    document: {
                        title: comment.documentId?.title || "Không xác định",
                    },
                })),
            };
        } catch (err) {
            const message = err.response?.data?.message || "Không thể lấy danh sách bình luận.";
            showToast("error", message);
            return rejectWithValue({ message, status: err.response?.status });
        }
    }
);

// Xóa cứng bình luận
export const forceDeleteComment = createAsyncThunk(
    "admin/forceDeleteComment",
    async (commentId, { dispatch, getState, rejectWithValue }) => {
        try {
            const res = await customAxios.delete(`/admin/comments/${commentId}/force`);
            showToast("success", res.data.message);
            // Hủy debounce trước
            debouncedFetchAdminComments.cancel();
            // Làm mới danh sách bình luận
            debouncedFetchAdminComments({ page: getState().admin.currentPage }, dispatch);
            return { commentId };
        } catch (err) {
            const message = err.response?.data?.message || "Không thể xóa bình luận.";
            showToast("error", message);
            return rejectWithValue({ message, status: err.response?.status });
        }
    }
);

// Thử lại khi gặp lỗi
export const retryAdminAction = createAsyncThunk(
    "admin/retry",
    async ({ action, payload }, { dispatch }) => {
        return dispatch(action(payload));
    }
);

// ========== Initial State ==========

const initialState = {
    comments: [], // Danh sách bình luận admin
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

const adminSlice = createSlice({
    name: "admin",
    initialState,
    reducers: {
        resetAdminState: (state) => {
            state.comments = [];
            state.totalItems = 0;
            state.totalPages = 0;
            state.currentPage = 1;
            state.loading = false;
            state.error = null;
        },
        clearAdminError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch Admin Comments
        builder
            .addCase(fetchAdminComments.pending, handlePending)
            .addCase(fetchAdminComments.fulfilled, (state, action) => {
                state.loading = false;
                state.comments = action.payload.items;
                state.totalItems = action.payload.totalItems;
                state.totalPages = action.payload.totalPages;
                state.currentPage = action.payload.currentPage;
            })
            .addCase(fetchAdminComments.rejected, (state, action) => {
                handleRejected(state, action, "Lấy danh sách bình luận thất bại.");
            })
            // Force Delete Comment
            .addCase(forceDeleteComment.pending, handlePending)
            .addCase(forceDeleteComment.fulfilled, (state, action) => {
                state.loading = false;
                // Dữ liệu được làm mới qua debouncedFetchAdminComments
            })
            .addCase(forceDeleteComment.rejected, (state, action) => {
                handleRejected(state, action, "Xóa bình luận thất bại.");
            });
    },
});

export const { resetAdminState, clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
