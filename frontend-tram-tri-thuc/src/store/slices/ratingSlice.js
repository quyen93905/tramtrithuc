import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import showToast from "../../utils/toast";
import customAxios from "../../utils/customAxios";

// ========== Thunks ==========

// Lấy danh sách đánh giá của tài liệu
export const fetchRatingsByDocument = createAsyncThunk(
    "ratings/fetchByDocument",
    async ({ documentId, params }, { rejectWithValue }) => {
        try {
            const res = await customAxios.get(`/ratings/${documentId}`, { params });
            return res.data.data;
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
                    message = err.response?.data?.message || "Không thể lấy danh sách đánh giá.";
            }
            showToast("error", message);
            return rejectWithValue({ message, status: err.response?.status });
        }
    }
);

// Lấy điểm trung bình đánh giá
export const fetchAverageRating = createAsyncThunk(
    "ratings/fetchAverage",
    async (documentId, { rejectWithValue }) => {
        try {
            const res = await customAxios.get(`/ratings/${documentId}/average`);
            return res.data.data;
        } catch (err) {
            let message;
            switch (err.response?.status) {
                case 404:
                    message = "Tài liệu không tồn tại hoặc chưa được duyệt.";
                    break;
                default:
                    message =
                        err.response?.data?.message || "Không thể lấy điểm trung bình đánh giá.";
            }
            showToast("error", message);
            return rejectWithValue({ message, status: err.response?.status });
        }
    }
);

// Lấy phân phối đánh giá
export const fetchRatingDistribution = createAsyncThunk(
    "ratings/fetchDistribution",
    async (documentId, { rejectWithValue }) => {
        try {
            const res = await customAxios.get(`/ratings/${documentId}/distribution`);
            return res.data.data;
        } catch (err) {
            let message;
            switch (err.response?.status) {
                case 404:
                    message = "Tài liệu không tồn tại hoặc chưa được duyệt.";
                    break;
                case 400:
                    message = "ID tài liệu không hợp lệ.";
                    break;
                default:
                    message = err.response?.data?.message || "Không thể lấy phân phối đánh giá.";
            }
            showToast("error", message);
            return rejectWithValue({ message, status: err.response?.status });
        }
    }
);

// Tạo hoặc cập nhật đánh giá
export const createOrUpdateRating = createAsyncThunk(
    "ratings/createOrUpdate",
    async ({ documentId, score, review }, { dispatch, getState, rejectWithValue }) => {
        try {
            const res = await customAxios.post(`/ratings/${documentId}`, { score, review });
            showToast("success", res.data.message);
            // Làm mới danh sách đánh giá và điểm trung bình
            await Promise.all([
                dispatch(
                    fetchRatingsByDocument({
                        documentId,
                        params: { page: getState().ratings.currentPage },
                    })
                ),
                dispatch(fetchAverageRating(documentId)),
                dispatch(fetchRatingDistribution(documentId)),
            ]);
            return res.data.data;
        } catch (err) {
            let message;
            switch (err.response?.status) {
                case 404:
                    message = "Tài liệu không tồn tại hoặc chưa được duyệt.";
                    break;
                case 400:
                    message = "Điểm số không hợp lệ. Vui lòng chọn từ 1 đến 5 sao.";
                    break;
                case 401:
                    message = "Vui lòng đăng nhập để đánh giá.";
                    break;
                case 429:
                    message = "Bạn đang gửi quá nhiều yêu cầu. Vui lòng thử lại sau.";
                    break;
                default:
                    message = err.response?.data?.message || "Không thể gửi đánh giá.";
            }
            showToast("error", message);
            return rejectWithValue({ message, status: err.response?.status });
        }
    }
);

// Xóa đánh giá
export const deleteRating = createAsyncThunk(
    "ratings/delete",
    async (documentId, { dispatch, getState, rejectWithValue }) => {
        try {
            const res = await customAxios.delete(`/ratings/${documentId}`);
            showToast("success", res.data.message);
            // Làm mới danh sách đánh giá và điểm trung bình
            await Promise.all([
                dispatch(
                    fetchRatingsByDocument({
                        documentId,
                        params: { page: getState().ratings.currentPage },
                    })
                ),
                dispatch(fetchAverageRating(documentId)),
                dispatch(fetchRatingDistribution(documentId)),
            ]);
            return { documentId };
        } catch (err) {
            let message;
            switch (err.response?.status) {
                case 404:
                    message = "Đánh giá hoặc tài liệu không tồn tại.";
                    break;
                case 401:
                    message = "Vui lòng đăng nhập để xóa đánh giá.";
                    break;
                case 403:
                    message = "Bạn không có quyền xóa đánh giá này.";
                    break;
                default:
                    message = err.response?.data?.message || "Không thể xóa đánh giá.";
            }
            showToast("error", message);
            return rejectWithValue({ message, status: err.response?.status });
        }
    }
);

// Thử lại khi gặp lỗi
export const retryRatingAction = createAsyncThunk(
    "ratings/retry",
    async ({ action, payload }, { dispatch }) => {
        return dispatch(action(payload));
    }
);

// ========== Initial State ==========

const initialState = {
    ratings: [], // Danh sách đánh giá
    averageRating: { avgScore: 0, totalRatings: 0 }, // Điểm trung bình
    ratingDistribution: [], // Phân phối đánh giá
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

const ratingSlice = createSlice({
    name: "ratings",
    initialState,
    reducers: {
        resetRatingState: (state) => {
            state.ratings = [];
            state.averageRating = { avgScore: 0, totalRatings: 0 };
            state.totalItems = 0;
            state.totalPages = 0;
            state.currentPage = 1;
            state.loading = false;
            state.error = null;
        },
        clearRatingError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Ratings
            .addCase(fetchRatingsByDocument.pending, handlePending)
            .addCase(fetchRatingsByDocument.fulfilled, (state, action) => {
                state.loading = false;
                state.ratings = action.payload.items.map((rating) => ({
                    ...rating,
                    user: {
                        name: rating.user?.name || rating.user?.email || "Ẩn danh",
                        email: rating.user?.email || "",
                    },
                }));
                state.totalItems = action.payload.totalItems;
                state.totalPages = action.payload.totalPages;
                state.currentPage = action.payload.currentPage;
            })
            .addCase(fetchRatingsByDocument.rejected, (state, action) => {
                handleRejected(state, action, "Lấy danh sách đánh giá thất bại.");
            })

            // Fetch Average Rating
            .addCase(fetchAverageRating.pending, handlePending)
            .addCase(fetchAverageRating.fulfilled, (state, action) => {
                state.loading = false;
                state.averageRating = action.payload;
            })
            .addCase(fetchAverageRating.rejected, (state, action) => {
                handleRejected(state, action, "Lấy điểm trung bình thất bại.");
            })

            // Fetch Rating Distribution
            .addCase(fetchRatingDistribution.pending, handlePending)
            .addCase(fetchRatingDistribution.fulfilled, (state, action) => {
                state.loading = false;
                state.ratingDistribution = action.payload;
            })
            .addCase(fetchRatingDistribution.rejected, (state, action) => {
                handleRejected(state, action, "Lấy phân phối đánh giá thất bại.");
            })

            // Create or Update Rating
            .addCase(createOrUpdateRating.pending, handlePending)
            .addCase(createOrUpdateRating.fulfilled, (state, action) => {
                state.loading = false;
                // Dữ liệu được làm mới qua fetchRatingsByDocument và fetchAverageRating và fetchRatingDistribution
            })
            .addCase(createOrUpdateRating.rejected, (state, action) => {
                handleRejected(state, action, "Gửi đánh giá thất bại.");
            })

            // Delete Rating
            .addCase(deleteRating.pending, handlePending)
            .addCase(deleteRating.fulfilled, (state, action) => {
                state.loading = false;
                // Dữ liệu được làm mới qua fetchRatingsByDocument và fetchAverageRating và fetchRatingDistribution
            })
            .addCase(deleteRating.rejected, (state, action) => {
                handleRejected(state, action, "Xóa đánh giá thất bại.");
            });
    },
});

export const { resetRatingState, clearRatingError } = ratingSlice.actions;
export default ratingSlice.reducer;
