import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import customAxios from "../../utils/customAxios";

// Lấy danh sách tất cả danh mục với phân trang
export const fetchCategories = createAsyncThunk(
    "categories/fetchCategories",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await customAxios.get("/categories", { params });
            return response.data.data; // { totalItems, totalPages, currentPage, items }
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Không thể lấy danh sách danh mục"
            );
        }
    }
);

// Lấy chi tiết danh mục theo slug
export const fetchCategoryBySlug = createAsyncThunk(
    "categories/fetchCategoryBySlug",
    async ({ slug, params = {} }, { rejectWithValue }) => {
        try {
            const defaultParams = {
                page: 1,
                limit: 10,
                ...params,
            };
            const response = await customAxios.get(`/categories/${slug}`, {
                params: defaultParams,
            });
            return response.data.data; // { category, documents, pagination }
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Không thể lấy chi tiết danh mục"
            );
        }
    }
);

// Tạo danh mục mới (admin)
export const createCategory = createAsyncThunk(
    "categories/createCategory",
    async (data, { rejectWithValue }) => {
        try {
            const response = await customAxios.post("/categories", data);
            return response.data.data; // category
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Không thể tạo danh mục");
        }
    }
);

// Cập nhật danh mục (admin)
export const updateCategory = createAsyncThunk(
    "categories/updateCategory",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await customAxios.patch(`/categories/${id}`, data);
            return response.data.data; // category
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Không thể cập nhật danh mục");
        }
    }
);

// Xóa danh mục (admin)
export const deleteCategory = createAsyncThunk(
    "categories/deleteCategory",
    async (id, { rejectWithValue }) => {
        try {
            await customAxios.delete(`/categories/${id}`);
            return id; // Trả về id để xóa trong state
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Không thể xóa danh mục");
        }
    }
);

// ========== Slice ==========

const categorySlice = createSlice({
    name: "categories",
    initialState: {
        categories: [], // Danh sách danh mục
        currentCategory: null, // Chi tiết danh mục hiện tại
        currentCategoryDocuments: [], // Danh sách tài liệu của danh mục hiện tại
        loading: false,
        error: null,
        pagination: {
            totalItems: 0,
            totalPages: 0,
            currentPage: 1,
        },
        categoryDocumentsPagination: {
            // Phân trang cho tài liệu của danh mục
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
            _id: doc._id?.toString(),
            favoriteCount: doc.favoriteCount ?? 0,
            viewCount: doc.viewCount ?? 0,
            downloadCount: doc.downloadCount ?? 0,
            category: doc.category || { _id: null, name: "", slug: "" },
            uploader: doc.uploader || { _id: null, name: "" },
            createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
        });

        builder
            // fetchCategories
            .addCase(fetchCategories.pending, handlePending)
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.categories = action.payload.items;
                state.pagination = {
                    totalItems: action.payload.totalItems,
                    totalPages: action.payload.totalPages,
                    currentPage: action.payload.currentPage,
                };
            })
            .addCase(fetchCategories.rejected, handleRejected)

            // fetchCategoryBySlug
            .addCase(fetchCategoryBySlug.pending, handlePending)
            .addCase(fetchCategoryBySlug.fulfilled, (state, action) => {
                state.loading = false;
                state.currentCategory = {
                    _id: action.payload._id,
                    name: action.payload.name,
                    slug: action.payload.slug,
                    description: action.payload.description,
                    createdAt: action.payload.createdAt,
                };
                state.currentCategoryDocuments =
                    action.payload.documents?.map(normalizeDocument) || [];
                state.categoryDocumentsPagination = action.payload.pagination || {
                    totalItems: 0,
                    totalPages: 0,
                    currentPage: 1,
                };
            })
            .addCase(fetchCategoryBySlug.rejected, handleRejected)

            // createCategory
            .addCase(createCategory.pending, handlePending)
            .addCase(createCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.categories.push(action.payload);
                state.pagination.totalItems += 1;
            })
            .addCase(createCategory.rejected, handleRejected)

            // updateCategory
            .addCase(updateCategory.pending, handlePending)
            .addCase(updateCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.categories = state.categories.map((cat) =>
                    cat._id === action.payload._id ? action.payload : cat
                );
                if (state.currentCategory?._id === action.payload._id) {
                    state.currentCategory = action.payload;
                }
            })
            .addCase(updateCategory.rejected, handleRejected)

            // deleteCategory
            .addCase(deleteCategory.pending, handlePending)
            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.categories = state.categories.filter((cat) => cat._id !== action.payload);
                if (state.currentCategory?._id === action.payload) {
                    state.currentCategory = null;
                    state.currentCategoryDocuments = [];
                    state.categoryDocumentsPagination = {
                        totalItems: 0,
                        totalPages: 0,
                        currentPage: 1,
                    };
                }
                state.pagination.totalItems -= 1;
            })
            .addCase(deleteCategory.rejected, handleRejected);
    },
});

export const { clearError } = categorySlice.actions;
export default categorySlice.reducer;
