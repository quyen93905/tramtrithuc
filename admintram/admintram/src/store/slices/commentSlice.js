import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import showToast from "../../utils/toast";
import customAxios from "../../utils/customAxios";

// ========== Thunks ==========

// Lấy danh sách bình luận của tài liệu
export const fetchCommentsByDocument = createAsyncThunk(
    "comments/fetchByDocument",
    async ({ documentId, params }, { rejectWithValue }) => {
        try {
            const res = await customAxios.get(`/comments/${documentId}`, { params });
            // Lọc bình luận hợp lệ (isDeleted: false)
            const filteredData = {
                ...res.data.data,
                items: res.data.data.items.filter((comment) => !comment.isDeleted),
            };
            return filteredData;
        } catch (err) {
            let message;
            switch (err.response?.status) {
                case 404:
                    message = "Tài liệu không tồn tại hoặc chưa được duyệt.";
                    break;
                case 400:
                    message = "Tham số không hợp lệ.";
                    break;
                default:
                    message = err.response?.data?.message || "Không thể lấy danh sách bình luận.";
            }
            showToast("error", message);
            return rejectWithValue({ message, status: err.response?.status });
        }
    }
);

// Tạo bình luận
export const createComment = createAsyncThunk(
    "comments/create",
    async ({ documentId, content, parentCommentId }, { dispatch, getState, rejectWithValue }) => {
        try {
            const res = await customAxios.post(`/comments/${documentId}`, {
                content,
                parentCommentId,
            });
            showToast("success", res.data.message);
            // Làm mới danh sách bình luận
            await dispatch(
                fetchCommentsByDocument({
                    documentId,
                    params: { page: getState().comments.currentPage },
                })
            );
            return res.data.data;
        } catch (err) {
            let message;
            switch (err.response?.status) {
                case 404:
                    message = "Tài liệu hoặc bình luận cha không tồn tại.";
                    break;
                case 400:
                    message = "Nội dung bình luận không hợp lệ.";
                    break;
                case 401:
                    message = "Vui lòng đăng nhập để bình luận.";
                    break;
                case 429:
                    message = "Bạn đang gửi quá nhiều yêu cầu. Vui lòng thử lại sau.";
                    break;
                default:
                    message = err.response?.data?.message || "Không thể gửi bình luận.";
            }
            showToast("error", message);
            return rejectWithValue({ message, status: err.response?.status });
        }
    }
);

// Cập nhật bình luận
export const updateComment = createAsyncThunk(
    "comments/update",
    async ({ commentId, content }, { dispatch, getState, rejectWithValue }) => {
        try {
            const res = await customAxios.put(`/comments/${commentId}`, { content });
            showToast("success", res.data.message);
            // Làm mới danh sách bình luận
            const documentId = getState().comments.comments.find(
                (c) => c._id === commentId
            )?.documentId;
            if (documentId) {
                await dispatch(
                    fetchCommentsByDocument({
                        documentId,
                        params: { page: getState().comments.currentPage },
                    })
                );
            }
            return res.data.data;
        } catch (err) {
            let message;
            switch (err.response?.status) {
                case 404:
                    message = "Bình luận không tồn tại.";
                    break;
                case 400:
                    message = "Nội dung bình luận không hợp lệ.";
                    break;
                case 401:
                    message = "Vui lòng đăng nhập để cập nhật bình luận.";
                    break;
                case 403:
                    message = "Bạn không có quyền cập nhật bình luận này.";
                    break;
                case 429:
                    message = "Bạn đang gửi quá nhiều yêu cầu. Vui lòng thử lại sau.";
                    break;
                default:
                    message = err.response?.data?.message || "Không thể cập nhật bình luận.";
            }
            showToast("error", message);
            return rejectWithValue({ message, status: err.response?.status });
        }
    }
);

// Xóa bình luận
export const deleteComment = createAsyncThunk(
    "comments/delete",
    async (commentId, { dispatch, getState, rejectWithValue }) => {
        try {
            const res = await customAxios.delete(`/comments/${commentId}`);
            showToast("success", res.data.message);
            // Làm mới danh sách bình luận
            const documentId = getState().comments.comments.find(
                (c) => c._id === commentId
            )?.documentId;
            if (documentId) {
                await dispatch(
                    fetchCommentsByDocument({
                        documentId,
                        params: { page: getState().comments.currentPage },
                    })
                );
            }
            return { commentId };
        } catch (err) {
            let message;
            switch (err.response?.status) {
                case 404:
                    message = "Bình luận không tồn tại.";
                    break;
                case 401:
                    message = "Vui lòng đăng nhập để xóa bình luận.";
                    break;
                case 403:
                    message = "Bạn không có quyền xóa bình luận này.";
                    break;
                default:
                    message = err.response?.data?.message || "Không thể xóa bình luận.";
            }
            showToast("error", message);
            return rejectWithValue({ message, status: err.response?.status });
        }
    }
);

// Báo cáo bình luận
export const reportComment = createAsyncThunk(
    "comments/report",
    async (commentId, { dispatch, getState, rejectWithValue }) => {
        try {
            const res = await customAxios.post(`/comments/${commentId}/report`);
            showToast("success", res.data.message);
            // Làm mới danh sách bình luận
            const documentId = getState().comments.comments.find(
                (c) => c._id === commentId
            )?.documentId;
            if (documentId) {
                await dispatch(
                    fetchCommentsByDocument({
                        documentId,
                        params: { page: getState().comments.currentPage },
                    })
                );
            }
            return { commentId };
        } catch (err) {
            let message;
            switch (err.response?.status) {
                case 404:
                    message = "Bình luận không tồn tại hoặc đã bị xóa.";
                    break;
                case 400:
                    message = "Bình luận này đã được báo cáo.";
                    break;
                case 401:
                    message = "Vui lòng đăng nhập để báo cáo bình luận.";
                    break;
                case 429:
                    message = "Bạn đang gửi quá nhiều yêu cầu. Vui lòng thử lại sau.";
                    break;
                default:
                    message = err.response?.data?.message || "Không thể báo cáo bình luận.";
            }
            showToast("error", message);
            return rejectWithValue({ message, status: err.response?.status });
        }
    }
);

// Thử lại khi gặp lỗi
export const retryCommentAction = createAsyncThunk(
    "comments/retry",
    async ({ action, payload }, { dispatch }) => {
        return dispatch(action(payload));
    }
);

// ========== Initial State ==========

const initialState = {
    comments: [], // Danh sách bình luận
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

const commentSlice = createSlice({
    name: "comments",
    initialState,
    reducers: {
        resetCommentState: (state) => {
            state.comments = [];
            state.totalItems = 0;
            state.totalPages = 0;
            state.currentPage = 1;
            state.loading = false;
            state.error = null;
        },
        clearCommentError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Comments
            .addCase(fetchCommentsByDocument.pending, handlePending)
            .addCase(fetchCommentsByDocument.fulfilled, (state, action) => {
                state.loading = false;
                state.comments = action.payload.items.map((comment) => ({
                    ...comment,
                    user: {
                        name: comment.user?.name || comment.user?.email || "Ẩn danh",
                        email: comment.user?.email || "",
                    },
                    replies:
                        comment.replies?.map((reply) => ({
                            ...reply,
                            user: {
                                name: reply.user?.name || reply.user?.email || "Ẩn danh",
                                email: reply.user?.email || "",
                            },
                        })) || [],
                }));
                state.totalItems = action.payload.totalItems;
                state.totalPages = action.payload.totalPages;
                state.currentPage = action.payload.currentPage;
            })
            .addCase(fetchCommentsByDocument.rejected, (state, action) => {
                handleRejected(state, action, "Lấy danh sách bình luận thất bại.");
            })

            // Create Comment
            .addCase(createComment.pending, handlePending)
            .addCase(createComment.fulfilled, (state, action) => {
                state.loading = false;
                // Dữ liệu được làm mới qua fetchCommentsByDocument
            })
            .addCase(createComment.rejected, (state, action) => {
                handleRejected(state, action, "Gửi bình luận thất bại.");
            })

            // Update Comment
            .addCase(updateComment.pending, handlePending)
            .addCase(updateComment.fulfilled, (state, action) => {
                state.loading = false;
                // Dữ liệu được làm mới qua fetchCommentsByDocument
            })
            .addCase(updateComment.rejected, (state, action) => {
                handleRejected(state, action, "Cập nhật bình luận thất bại.");
            })

            // Delete Comment
            .addCase(deleteComment.pending, handlePending)
            .addCase(deleteComment.fulfilled, (state, action) => {
                state.loading = false;
                // Dữ liệu được làm mới qua fetchCommentsByDocument
                state.totalItems -= 1;
            })
            .addCase(deleteComment.rejected, (state, action) => {
                handleRejected(state, action, "Xóa bình luận thất bại.");
            })

            // Report Comment
            .addCase(reportComment.pending, handlePending)
            .addCase(reportComment.fulfilled, (state, action) => {
                state.loading = false;
                // Dữ liệu được làm mới qua fetchCommentsByDocument
            })
            .addCase(reportComment.rejected, (state, action) => {
                handleRejected(state, action, "Báo cáo bình luận thất bại.");
            });
    },
});

export const { resetCommentState, clearCommentError } = commentSlice.actions;
export default commentSlice.reducer;
