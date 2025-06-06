import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import customAxios from "../../utils/customAxios";
import showToast from "../../utils/toast";

// Lấy danh sách tài liệu với (search,bộ lọc,phân trang)
export const fetchDocuments = createAsyncThunk(
    "documents/fetchDocuments",
    async (params, { rejectWithValue }) => {
        try {
            const response = await customAxios.get("/documents", { params });
            return response.data.data; // { totalItems, totalPages, currentPage, items }
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Không thể lấy danh sách tài liệu"
            );
        }
    }
);

// Lấy chi tiết tài liệu theo ID
export const fetchDocumentById = createAsyncThunk(
    "documents/fetchDocumentById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await customAxios.get(`/documents/${id}`);
            return response.data.data; // document
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Không thể lấy chi tiết tài liệu"
            );
        }
    }
);

// Lấy chi tiết tài liệu theo slug
export const fetchDocumentBySlug = createAsyncThunk(
    "documents/fetchDocumentBySlug",
    async (slug, { rejectWithValue }) => {
        try {
            const response = await customAxios.get(`/documents/slug/${slug}`);
            return response.data.data; // document
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Không thể lấy chi tiết tài liệu"
            );
        }
    }
);

// Tải file tài liệu
export const downloadDocument = createAsyncThunk(
    "documents/downloadDocument",
    async (id, { rejectWithValue, getState }) => {
        try {
            // Lấy thông tin tài liệu để có fileName
            const state = getState();
            const document =
                state.documents.currentDocument ||
                state.documents.documents.find((doc) => doc._id === id) ||
                state.documents.myDocuments.find((doc) => doc._id === id);

            const response = await customAxios.get(`/documents/download/${id}`, {
                responseType: "blob",
            });

            const fileName = document?.fileName || `document-${id}`;
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            showToast("success", "Tải tài liệu thành công.");
            return id;
        } catch (error) {
            let message;
            switch (error.response?.status) {
                case 404:
                    message = "Tài liệu không tồn tại.";
                    break;
                case 403:
                    message = "Bạn không có quyền tải tài liệu này.";
                    break;
                case 401:
                    message = "Vui lòng đăng nhập để tải tài liệu.";
                    break;
                default:
                    message = error.response?.data?.message || "Không thể tải tài liệu.";
            }
            showToast("error", message);
            return rejectWithValue({ message, status: error.response?.status });
        }
    }
);

// Upload tài liệu mới
export const uploadDocument = createAsyncThunk(
    "documents/uploadDocument",
    async (formData, { rejectWithValue }) => {
        try {
            const response = await customAxios.post("/documents", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            showToast("success", response.data.message);
            return response.data.data; // document
        } catch (error) {
            let message;
            switch (error.response?.status) {
                case 400:
                    message = "Dữ liệu không hợp lệ hoặc thiếu file tài liệu.";
                    break;
                case 401:
                    message = "Vui lòng đăng nhập để upload tài liệu.";
                    break;
                case 403:
                    message = "Bạn không có quyền upload tài liệu.";
                    break;
                default:
                    message = error.response?.data?.message || "Không thể upload tài liệu.";
            }
            showToast("error", message);
            return rejectWithValue({ message, status: error.response?.status });
        }
    }
);

// Lấy danh sách tài liệu của người dùng
export const fetchMyDocuments = createAsyncThunk(
    "documents/fetchMyDocuments",
    async (_, { rejectWithValue }) => {
        try {
            const response = await customAxios.get("/documents/me");
            return response.data.data; // documents array
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Không thể lấy danh sách tài liệu cá nhân"
            );
        }
    }
);

// Cập nhật tài liệu
export const updateDocument = createAsyncThunk(
    "documents/updateDocument",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await customAxios.patch(`/documents/${id}`, data);
            showToast("success", response.data.message);
            return response.data.data; // document
        } catch (error) {
            let message;
            switch (error.response?.status) {
                case 400:
                    message = "Dữ liệu không hợp lệ.";
                    break;
                case 401:
                    message = "Vui lòng đăng nhập để cập nhật tài liệu.";
                    break;
                case 403:
                    message = "Bạn không có quyền cập nhật tài liệu này.";
                    break;
                case 404:
                    message = "Tài liệu không tồn tại.";
                    break;
                default:
                    message = error.response?.data?.message || "Không thể cập nhật tài liệu.";
            }
            showToast("error", message);
            return rejectWithValue({ message, status: error.response?.status });
        }
    }
);

// Xóa tài liệu
export const deleteDocument = createAsyncThunk(
    "documents/deleteDocument",
    async (id, { rejectWithValue }) => {
        try {
            const response = await customAxios.delete(`/documents/${id}`);
            showToast("success", response.data.message);
            return id; // Trả về id để xóa trong state
        } catch (error) {
            let message;
            switch (error.response?.status) {
                case 400:
                    message = "ID tài liệu không hợp lệ.";
                    break;
                case 401:
                    message = "Vui lòng đăng nhập để xóa tài liệu.";
                    break;
                case 403:
                    message = "Bạn không có quyền xóa tài liệu này.";
                    break;
                case 404:
                    message = "Tài liệu không tồn tại.";
                    break;
                default:
                    message = error.response?.data?.message || "Không thể xóa tài liệu.";
            }
            showToast("error", message);
            return rejectWithValue({ message, status: error.response?.status });
        }
    }
);

// Duyệt tài liệu (admin)
export const approveDocument = createAsyncThunk(
    "documents/approveDocument",
    async (id, { rejectWithValue }) => {
        try {
            const response = await customAxios.patch(`/documents/approve/${id}`);
            showToast("success", response.data.message);
            return response.data.data; // document
        } catch (error) {
            let message;
            switch (error.response?.status) {
                case 400:
                    message = "ID tài liệu không hợp lệ.";
                    break;
                case 401:
                    message = "Vui lòng đăng nhập để duyệt tài liệu.";
                    break;
                case 403:
                    message = "Chỉ admin mới có quyền duyệt tài liệu.";
                    break;
                case 404:
                    message = "Tài liệu không tồn tại.";
                    break;
                default:
                    message = error.response?.data?.message || "Không thể duyệt tài liệu.";
            }
            showToast("error", message);
            return rejectWithValue({ message, status: error.response?.status });
        }
    }
);

// Gắn/bỏ nổi bật tài liệu (admin)
export const featureDocument = createAsyncThunk(
    "documents/featureDocument",
    async (id, { rejectWithValue }) => {
        try {
            const response = await customAxios.patch(`/documents/feature/${id}`);
            showToast("success", response.data.message);
            return response.data.data; // document
        } catch (error) {
            let message;
            switch (error.response?.status) {
                case 400:
                    message = "Tài liệu phải được duyệt để gắn nổi bật.";
                    break;
                case 401:
                    message = "Vui lòng đăng nhập để gắn/bỏ nổi bật.";
                    break;
                case 403:
                    message = "Chỉ admin mới có quyền gắn/bỏ nổi bật.";
                    break;
                case 404:
                    message = "Tài liệu không tồn tại.";
                    break;
                default:
                    message =
                        error.response?.data?.message || "Không thể cập nhật trạng thái nổi bật.";
            }
            showToast("error", message);
            return rejectWithValue({ message, status: error.response?.status });
        }
    }
);

// Lấy danh sách tài liệu nổi bật
export const fetchFeaturedDocuments = createAsyncThunk(
    "documents/fetchFeaturedDocuments",
    async (params, { rejectWithValue }) => {
        try {
            const response = await customAxios.get("/documents/featured", { params });
            return response.data.data; // { totalItems, totalPages, currentPage, items }
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Không thể lấy danh sách tài liệu nổi bật"
            );
        }
    }
);

// Async thunk để toggle yêu thích
export const toggleFavorite = createAsyncThunk(
    "documents/toggleFavorite",
    async (docId, { rejectWithValue, getState }) => {
        try {
            const { user } = getState();
            if (!user.userInfo) {
                showToast("error", "Vui lòng đăng nhập để yêu thích tài liệu.");
                throw new Error("Vui lòng đăng nhập để yêu thích tài liệu");
            }
            const response = await customAxios.post(`/documents/${docId}/favorite`);
            showToast("success", response.data.data.message);
            return response.data.data; // { document, favoriteDocuments, isFavorite, message }
        } catch (error) {
            let message;
            switch (error.response?.status) {
                case 400:
                    message = "ID tài liệu không hợp lệ hoặc danh sách yêu thích đã đầy.";
                    break;
                case 401:
                    message = "Vui lòng đăng nhập để yêu thích tài liệu.";
                    break;
                case 404:
                    message = "Tài liệu không tồn tại hoặc chưa được duyệt.";
                    break;
                default:
                    message = error.response?.data?.message || "Lỗi khi cập nhật yêu thích.";
            }
            if (!error.response) {
                // Lỗi đã được xử lý trong getState
                return rejectWithValue({ message, status: null });
            }
            showToast("error", message);
            return rejectWithValue({ message, status: error.response?.status });
        }
    }
);

// ========== Slice ==========

const documentSlice = createSlice({
    name: "documents",
    initialState: {
        documents: [], // Danh sách tài liệu công khai
        featuredDocuments: [], // Danh sách tài liệu nổi bật
        currentDocument: null, // Chi tiết tài liệu hiện tại
        myDocuments: [], // Danh sách tài liệu của user
        loading: false,
        error: null,
        pagination: {
            totalItems: 0,
            totalPages: 0,
            currentPage: 1,
        },
        featuredPagination: {
            totalItems: 0,
            totalPages: 0,
            currentPage: 1,
        },
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        const handlePending = (state) => {
            state.loading = true;
            state.error = null;
        };

        const handleRejected = (state, action) => {
            state.loading = false;
            state.error = action.payload || "Đã xảy ra lỗi không xác định";
        };

        const normalizeDocument = (doc) => ({
            ...doc,
            favoriteCount: doc.favoriteCount ?? 0,
        });

        builder
            // fetchDocuments
            .addCase(fetchDocuments.pending, handlePending)
            .addCase(fetchDocuments.fulfilled, (state, action) => {
                state.loading = false;
                state.documents = action.payload.items.map(normalizeDocument);
                state.pagination = {
                    totalItems: action.payload.totalItems,
                    totalPages: action.payload.totalPages,
                    currentPage: action.payload.currentPage,
                };
            })
            .addCase(fetchDocuments.rejected, handleRejected)
            // fetchFeaturedDocuments
            .addCase(fetchFeaturedDocuments.pending, handlePending)
            .addCase(fetchFeaturedDocuments.fulfilled, (state, action) => {
                state.loading = false;
                state.featuredDocuments = action.payload.items.map(normalizeDocument);
                state.featuredPagination = {
                    totalItems: action.payload.totalItems,
                    totalPages: action.payload.totalPages,
                    currentPage: action.payload.currentPage,
                };
            })
            .addCase(fetchFeaturedDocuments.rejected, handleRejected)

            // fetchDocumentById
            .addCase(fetchDocumentById.pending, handlePending)
            .addCase(fetchDocumentById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentDocument = normalizeDocument(action.payload);
            })
            .addCase(fetchDocumentById.rejected, handleRejected)

            // fetchDocumentBySlug
            .addCase(fetchDocumentBySlug.pending, handlePending)
            .addCase(fetchDocumentBySlug.fulfilled, (state, action) => {
                state.loading = false;
                state.currentDocument = normalizeDocument(action.payload);
            })
            .addCase(fetchDocumentBySlug.rejected, handleRejected)

            // downloadDocument
            .addCase(downloadDocument.pending, handlePending)
            .addCase(downloadDocument.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(downloadDocument.rejected, handleRejected)

            // uploadDocument
            .addCase(uploadDocument.pending, handlePending)
            .addCase(uploadDocument.fulfilled, (state, action) => {
                state.loading = false;
                state.myDocuments.push(normalizeDocument(action.payload));
            })
            .addCase(uploadDocument.rejected, handleRejected)

            // fetchMyDocuments
            .addCase(fetchMyDocuments.pending, handlePending)
            .addCase(fetchMyDocuments.fulfilled, (state, action) => {
                state.loading = false;
                state.myDocuments = action.payload.map(normalizeDocument);
            })
            .addCase(fetchMyDocuments.rejected, handleRejected)

            // updateDocument
            .addCase(updateDocument.pending, handlePending)
            .addCase(updateDocument.fulfilled, (state, action) => {
                state.loading = false;
                const updatedDoc = normalizeDocument(action.payload);
                state.myDocuments = state.myDocuments.map((doc) =>
                    doc._id === updatedDoc._id ? updatedDoc : doc
                );
                state.documents = state.documents.map((doc) =>
                    doc._id === updatedDoc._id ? updatedDoc : doc
                );
                state.featuredDocuments = state.featuredDocuments.map((doc) =>
                    doc._id === updatedDoc._id ? updatedDoc : doc
                );
                if (state.currentDocument?._id === updatedDoc._id) {
                    state.currentDocument = updatedDoc;
                }
            })
            .addCase(updateDocument.rejected, handleRejected)

            // deleteDocument
            .addCase(deleteDocument.pending, handlePending)
            .addCase(deleteDocument.fulfilled, (state, action) => {
                state.loading = false;
                state.myDocuments = state.myDocuments.filter((doc) => doc._id !== action.payload);
                state.documents = state.documents.filter((doc) => doc._id !== action.payload);
                state.featuredDocuments = state.featuredDocuments.filter(
                    (doc) => doc._id !== action.payload
                );
                if (state.currentDocument?._id === action.payload) {
                    state.currentDocument = null;
                }
            })
            .addCase(deleteDocument.rejected, handleRejected)

            // approveDocument
            .addCase(approveDocument.pending, handlePending)
            .addCase(approveDocument.fulfilled, (state, action) => {
                state.loading = false;
                const updatedDoc = normalizeDocument(action.payload);
                state.documents = state.documents.map((doc) =>
                    doc._id === updatedDoc._id ? updatedDoc : doc
                );
                state.myDocuments = state.myDocuments.map((doc) =>
                    doc._id === updatedDoc._id ? updatedDoc : doc
                );
                state.featuredDocuments = state.featuredDocuments.map((doc) =>
                    doc._id === updatedDoc._id ? updatedDoc : doc
                );
                if (state.currentDocument?._id === updatedDoc._id) {
                    state.currentDocument = updatedDoc;
                }
            })
            .addCase(approveDocument.rejected, handleRejected)

            // featureDocument
            .addCase(featureDocument.pending, handlePending)
            .addCase(featureDocument.fulfilled, (state, action) => {
                state.loading = false;
                const updatedDoc = normalizeDocument(action.payload);
                state.documents = state.documents.map((doc) =>
                    doc._id === updatedDoc._id ? updatedDoc : doc
                );
                state.myDocuments = state.myDocuments.map((doc) =>
                    doc._id === updatedDoc._id ? updatedDoc : doc
                );
                if (updatedDoc.isFeatured) {
                    state.featuredDocuments.push(updatedDoc);
                } else {
                    state.featuredDocuments = state.featuredDocuments.filter(
                        (doc) => doc._id !== updatedDoc._id
                    );
                }
                if (state.currentDocument?._id === updatedDoc._id) {
                    state.currentDocument = updatedDoc;
                }
            })
            .addCase(featureDocument.rejected, handleRejected)

            // toggleFavorite
            .addCase(toggleFavorite.pending, handlePending)
            .addCase(toggleFavorite.fulfilled, (state, action) => {
                state.loading = false;
                const { document } = action.payload;
                const docId = document._id;
                const updatedDoc = normalizeDocument(document);

                state.documents = state.documents.map((doc) =>
                    doc._id === docId ? updatedDoc : doc
                );
                state.featuredDocuments = state.featuredDocuments.map((doc) =>
                    doc._id === docId ? updatedDoc : doc
                );
                if (state.currentDocument?._id === docId) {
                    state.currentDocument = updatedDoc;
                }
            })
            .addCase(toggleFavorite.rejected, handleRejected);
    },
});

export const { clearError } = documentSlice.actions;
export default documentSlice.reducer;
