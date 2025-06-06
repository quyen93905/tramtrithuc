// frontend/src/pages/SearchPage.js
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import SearchBar from "../components/Document/SearchBar";
import FilterPanel from "../components/Document/FilterPanel";
import DocumentList from "../components/Document/DocumentList";
import { fetchDocuments, clearError } from "../store/slices/documentSlice";
import { fetchCategories } from "../store/slices/categorySlice";
import useDebounce from "../utils/useDebounce";
import { toast } from "react-toastify";

const SearchPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {
        documents,
        loading: documentsLoading,
        error: documentsError,
        pagination,
    } = useSelector((state) => state.documents);
    const {
        categories,
        loading: categoriesLoading,
        error: categoriesError,
    } = useSelector((state) => state.categories);

    const [filters, setFilters] = useState({
        search: "",
        category: "", // Single-select: chuỗi thay vì mảng
        startDate: "",
        endDate: "",
        dateField: "createdAt",
        sort: "createdAt:desc",
        page: 1,
        limit: 12,
    });
    const debouncedSearch = useDebounce(filters.search, 300);
    const prevParamsRef = useRef({});

    // Fetch categories
    useEffect(() => {
        dispatch(fetchCategories({ page: 1, limit: 100 }));
    }, [dispatch]);

    // Debug category
    useEffect(() => {
        console.log("Current filters.category:", filters.category);
        console.log(
            "Selected category:",
            categories.find((cat) => cat.slug === filters.category)
        );
    }, [filters.category, categories]);

    // Fetch documents
    const fetchDocumentsCallback = useCallback(() => {
        const params = {
            status: "approved",
            search: debouncedSearch,
            category: filters.category, // Single category slug
            startDate: filters.startDate,
            endDate: filters.endDate,
            dateField: filters.dateField,
            sort: filters.sort,
            page: filters.page,
            limit: filters.limit,
        };
        // Clean params
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v != null && v !== "")
        );
        // Skip if params unchanged
        if (JSON.stringify(cleanParams) === JSON.stringify(prevParamsRef.current)) return;
        prevParamsRef.current = cleanParams;

        console.log("Fetching documents with params:", cleanParams);
        dispatch(fetchDocuments(cleanParams))
            .unwrap()
            .then((data) => console.log("API Response:", data))
            .catch((err) => {
                console.error("API Error:", err);
                if (err.status === 401) {
                    toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
                    localStorage.removeItem("accessToken");
                    navigate("/auth/login");
                } else {
                    toast.error(err.message || "Lỗi khi tải tài liệu.");
                }
            });
    }, [
        dispatch,
        navigate,
        debouncedSearch,
        filters.category,
        filters.startDate,
        filters.endDate,
        filters.dateField,
        filters.sort,
        filters.page,
        filters.limit,
    ]);

    // Trigger fetch
    useEffect(() => {
        fetchDocumentsCallback();
    }, [fetchDocumentsCallback]);

    // Handle errors
    useEffect(() => {
        if (documentsError) {
            toast.error(documentsError);
            dispatch(clearError());
        }
        if (categoriesError) {
            toast.error(categoriesError);
            dispatch(clearError());
        }
    }, [documentsError, categoriesError, dispatch]);

    // Handle filter change
    const handleFilterChange = useCallback((newFilters) => {
        setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
    }, []);

    // Handle page change
    const handlePageChange = useCallback((newPage) => {
        setFilters((prev) => ({ ...prev, page: newPage }));
    }, []);

    // Filters configuration
    const filtersConfig = useMemo(
        () => [
            {
                key: "category",
                label: "Danh mục",
                type: "select", // Chuyển sang single-select
                placeholder: "Tất cả danh mục", // Cập nhật placeholder để rõ ràng hơn
                defaultValue: "",
                options: [
                    ...categories.map((cat) => ({
                        value: cat.slug,
                        label: cat.name,
                    })),
                ],
            },
            {
                key: "startDate",
                label: "Ngày bắt đầu",
                type: "date",
                placeholder: "Chọn ngày bắt đầu",
            },
        ],
        [categories]
    );

    // Sort options
    const sortOptions = useMemo(
        () => [
            { value: "createdAt:desc", label: "Mới nhất" },
            { value: "createdAt:asc", label: "Cũ nhất" },
            { value: "viewCount:desc", label: "Xem nhiều nhất" },
            { value: "downloadCount:desc", label: "Tải nhiều nhất" },
        ],
        []
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
            </div>
            {/* Content */}
            <div className="relative z-10 pt-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-7xl mx-auto px-4"
                >
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-3xl font-bold mb-6 text-center text-gray-800"
                    >
                        🔍 Tìm kiếm tài liệu
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-md mb-4"
                    >
                        <SearchBar
                            onSearch={(value) =>
                                setFilters((prev) => ({ ...prev, search: value, page: 1 }))
                            }
                            placeholder="Tìm tiêu đề, mô tả, thẻ..."
                            isLoading={documentsLoading}
                        />
                        {categoriesLoading ? (
                            <div className="flex justify-center items-center h-10">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600" />
                            </div>
                        ) : (
                            <FilterPanel
                                filtersConfig={filtersConfig}
                                sortOptions={sortOptions}
                                onFilterChange={handleFilterChange}
                                defaultFilters={{
                                    category: "",
                                    startDate: "",
                                    endDate: "",
                                    dateField: "createdAt",
                                    sort: "createdAt:desc",
                                }}
                            />
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        {documentsLoading ? (
                            <div className="text-center text-gray-500 py-8">
                                Đang tải tài liệu...
                            </div>
                        ) : documents.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                                Không có tài liệu trong danh mục{" "}
                                {filters.category
                                    ? categories.find((cat) => cat.slug === filters.category)
                                          ?.name || "đã chọn"
                                    : "tất cả"}
                            </div>
                        ) : (
                            <DocumentList
                                documents={documents}
                                pagination={pagination}
                                onPageChange={handlePageChange}
                                isLoading={documentsLoading}
                            />
                        )}
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default SearchPage;
