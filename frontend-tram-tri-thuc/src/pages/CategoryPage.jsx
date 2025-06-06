import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategoryBySlug, fetchCategories, clearError } from "../store/slices/categorySlice";
import DocumentList from "../components/Document/DocumentList";
import SearchBar from "../components/Document/SearchBar";
import FilterPanel from "../components/Document/FilterPanel";
import useDebounce from "../utils/useDebounce";
import showToast from "../utils/toast";

export default function CategoryPage() {
    const { slug } = useParams();
    const dispatch = useDispatch();
    const {
        currentCategory,
        currentCategoryDocuments,
        categoryDocumentsPagination,
        loading,
        error,
    } = useSelector((state) => state.categories);
    const { categories, loading: categoriesLoading } = useSelector((state) => state.categories);

    // State cho filters
    const [filters, setFilters] = useState({
        search: "",
        startDate: "",
        endDate: "",
        dateField: "createdAt",
        sort: "createdAt:desc",
        page: 1,
    });
    const debouncedSearch = useDebounce(filters.search, 500);

    // Fetch categories
    useEffect(() => {
        dispatch(fetchCategories({ page: 1, limit: 100 }));
    }, [dispatch]);

    // Fetch documents khi filters thay đổi
    const fetchDocuments = useCallback(() => {
        const params = {
            page: filters.page,
            limit: 10,
            search: debouncedSearch || undefined,
            startDate: filters.startDate || undefined,
            endDate: filters.endDate || undefined,
            dateField: filters.dateField || undefined,
            sort: filters.sort || undefined,
        };

        // Clean params: remove empty values
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v != null && v !== "")
        );
        console.log("API Params:", cleanParams); // Debug params giống MyDocumentsPage
        dispatch(fetchCategoryBySlug({ slug, params }))
            .unwrap()
            .catch((err) => showToast("error", err.message || "Lỗi khi tải tài liệu."));
    }, [dispatch, slug, debouncedSearch, filters]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    // Handle lỗi
    useEffect(() => {
        if (error) {
            showToast("error", error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    // Handle page đổi
    const handlePageChange = useCallback((newPage) => {
        setFilters((prev) => ({ ...prev, page: newPage }));
    }, []);

    // Config cho FilterPanel
    const filtersConfig = useMemo(
        () => [
            {
                key: "startDate",
                label: "Ngày bắt đầu",
                type: "date",
                placeholder: "Chọn ngày bắt đầu",
            },
        ],
        []
    );

    const sortOptions = useMemo(
        () => [
            { value: "createdAt:desc", label: "Mới nhất" },
            { value: "createdAt:asc", label: "Cũ nhất" },
            { value: "viewCount:desc", label: "Xem nhiều nhất" },
            { value: "downloadCount:desc", label: "Tải xuống nhiều nhất" },
            { value: "favoriteCount:desc", label: "Yêu thích nhiều nhất" },
        ],
        []
    );

    // Hiển thị trạng thái bộ lọc hiện tại
    const activeFilters = useMemo(() => {
        const filtersList = [];
        if (filters.search) filtersList.push(`Tìm kiếm: ${filters.search}`);
        if (filters.startDate) filtersList.push(`Từ: ${filters.startDate}`);
        if (filters.endDate) filtersList.push(`Đến: ${filters.endDate}`);
        if (filters.dateField)
            filtersList.push(
                `Trường ngày: ${filters.dateField === "createdAt" ? "Ngày tạo" : "Ngày cập nhật"}`
            );
        if (filters.sort) {
            const sortLabel =
                sortOptions.find((opt) => opt.value === filters.sort)?.label || "Mới nhất";
            filtersList.push(`Sắp xếp: ${sortLabel}`);
        }
        return filtersList.length > 0 ? filtersList.join(" | ") : "Không có bộ lọc";
    }, [filters, sortOptions]);

    return (
        <div className="min-h-screen relative pt-16">
            {/* Background Gradients */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 opacity-90"></div>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-4">
                
                <h1 className="text-3xl font-bold text-gray-900 mb-6">
                    📁 Danh mục: {currentCategory?.name || slug.replace(/-/g, " ")}
                </h1>

                {/* Hiển thị trạng thái bộ lọc */}
                <div className="mb-4 text-sm text-gray-600">
                    <span className="font-medium">Bộ lọc hiện tại: </span>
                    {activeFilters}
                </div>

                {/* Search and Filter */}
                <div className="mb-6">
                    <SearchBar
                        onSearch={(value) =>
                            setFilters((prev) => ({ ...prev, search: value, page: 1 }))
                        }
                        placeholder="Tìm kiếm tiêu đề, mô tả, thẻ..."
                        isLoading={loading}
                    />
                    {categoriesLoading ? (
                        <div className="flex justify-center items-center h-10">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600" />
                        </div>
                    ) : (
                        <FilterPanel
                            filtersConfig={filtersConfig}
                            sortOptions={sortOptions}
                            onFilterChange={setFilters} // Truyền setFilters trực tiếp
                            filters={filters} // Truyền filters từ CategoryPage
                            defaultFilters={{
                                startDate: "",
                                endDate: "",
                                dateField: "createdAt",
                                sort: "createdAt:desc",
                            }}
                            hideDateField={false}
                        />
                    )}
                </div>

                {/* Document List */}
                <DocumentList
                    documents={currentCategoryDocuments}
                    pagination={categoryDocumentsPagination}
                    onPageChange={handlePageChange}
                    isLoading={loading}
                    type={null}
                />
            </div>
        </div>
    );
}
