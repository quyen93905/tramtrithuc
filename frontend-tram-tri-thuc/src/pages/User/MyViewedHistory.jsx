import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";

import SearchBar from "../../components/Document/SearchBar";
import FilterPanel from "../../components/Document/FilterPanel";
import DocumentList from "../../components/Document/DocumentList";
import { fetchViewedHistory } from "../../store/slices/userSlice";
import { fetchCategories } from "../../store/slices/categorySlice";
import useDebounce from "../../utils/useDebounce";
import { toast } from "react-toastify";

const MyViewedHistory = () => {
    const dispatch = useDispatch();
    const {
        viewedHistory = [],
        pagination,
        loading: userLoading,
        error: userError,
    } = useSelector((state) => state.user);
    const {
        categories,
        loading: categoriesLoading,
        error: categoriesError,
    } = useSelector((state) => state.categories);
    const { userInfo } = useSelector((state) => state.user);

    const [filters, setFilters] = useState({
        search: "",
        category: "",
        startDate: "",
        endDate: "",
        sort: "viewedAt:desc",
        page: 1,
        limit: 12,
    });

    const debouncedSearch = useDebounce(filters.search, 300);
    const prevParamsRef = useRef({});

    // Fetch categories
    useEffect(() => {
        dispatch(fetchCategories({ page: 1, limit: 100 }));
    }, [dispatch]);

    // Fetch viewed history
    const fetchHistoryCallback = useCallback(() => {
        if (!userInfo) return; // Không gọi API nếu chưa đăng nhập
        const params = {
            search: debouncedSearch,
            category: filters.category,
            startDate: filters.startDate,
            endDate: filters.endDate,
            sort: filters.sort,
            page: filters.page,
            limit: filters.limit,
        };
        // Clean params
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v != null && v !== "")
        );
        // Skip if params unchanged
        if (JSON.stringify(cleanParams) === JSON.stringify(prevParamsRef.current)) {
            return;
        }
        prevParamsRef.current = cleanParams;

        console.log("Fetching viewed history with params:", cleanParams);
        dispatch(fetchViewedHistory(cleanParams))
            .unwrap()
            .catch((err) => {
                console.error("API Error:", err);
                toast.error(err.message || "Lỗi khi tải lịch sử xem.");
            });
    }, [
        dispatch,
        userInfo,
        debouncedSearch,
        filters.category,
        filters.startDate,
        filters.endDate,
        filters.sort,
        filters.page,
        filters.limit,
    ]);

    useEffect(() => {
        fetchHistoryCallback();
    }, [fetchHistoryCallback]);

    // Handle errors
    useEffect(() => {
        if (userError) {
            toast.error(userError);
            dispatch({ type: "user/clearError" });
        }
        if (categoriesError) {
            toast.error(categoriesError);
            dispatch({ type: "categories/clearError" });
        }
    }, [userError, categoriesError, dispatch]);

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
                type: "select",
                placeholder: "Tất cả danh mục",
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
                label: "Ngày xem từ",
                type: "date",
                placeholder: "Chọn ngày bắt đầu",
            },
        ],
        [categories]
    );

    // Sort options
    const sortOptions = useMemo(
        () => [
            { value: "viewedAt:desc", label: "Mới xem nhất" },
            { value: "viewedAt:asc", label: "Xem cũ nhất" },
        ],
        []
    );

    // Transform viewedHistory for DocumentList
    const transformedDocuments = viewedHistory.map((view) => {
        console.log("Document data:", view.documentId); // Debug dữ liệu
        return {
            ...view.documentId,
            viewedAt: view.viewedAt,
        };
    });

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
                        👁️‍🗨️ Lịch sử xem tài liệu
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
                            isLoading={userLoading}
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
                                    sort: "viewedAt:desc",
                                }}
                                hideDateField={true}
                            />
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        {userLoading ? (
                            <div className="text-center text-gray-500 py-8">
                                Đang tải lịch sử xem...
                            </div>
                        ) : transformedDocuments.length === 0 ? (
                            <div className="text-center text-gray-500 py-8 flex flex-col items-center">
                                <img
                                    src="/empty-history.svg"
                                    alt="Empty"
                                    className="w-24 h-24 mb-2"
                                />
                                Bạn chưa xem tài liệu nào cả 😢 <br />
                                Hãy khám phá ngay nào!
                            </div>
                        ) : (
                            <DocumentList
                                documents={transformedDocuments}
                                pagination={pagination.viewedHistory}
                                onPageChange={handlePageChange}
                                isLoading={userLoading}
                                type="view"
                            />
                        )}
                    </motion.div>
                </motion.div>
            </div>

            {/* Animation Styles */}
            <style jsx>{`
                @keyframes float {
                    0%,
                    100% {
                        transform: translate(0, 0) rotate(0deg);
                    }
                    25% {
                        transform: translate(20px, -20px) rotate(5deg);
                    }
                    50% {
                        transform: translate(-10px);
                    }
                    75% {
                        transform: translate(-20px, -10px);
                    }
                }
                .animate-float-slow {
                    animation: float 20s ease-in-out infinite;
                }
                .animate-float-medium {
                    animation: float 15s ease-in-out infinite;
                }
                .animate-float-fast {
                    animation: float 10s ease-in-out infinite;
                }
                .animate-float-icon-1 {
                    animation: float 20s ease-in-out infinite;
                }
                .animate-float-icon-2 {
                    animation: float 15s ease-in-out infinite;
                }
                .animate-float-icon-3 {
                    animation: float 10s ease-in-out infinite;
                }
                .animate-float-icon-4 {
                    animation: float 18s ease-in-out infinite;
                }
                .animate-float-icon-5 {
                    animation: float 20s ease-in-out infinite;
                }
                .animate-float-icon-6 {
                    animation: float 22s ease-in-out infinite;
                }
                .animate-float-icon-7 {
                    animation: float 19s ease-in-out infinite;
                }
                .animate-float-icon-8 {
                    animation: float 21s ease-in-out infinite;
                }
                .animate-float-icon-9 {
                    animation: float 17s ease-in-out infinite;
                }
                .animate-float-icon-10 {
                    animation: float 23s ease-in-out infinite;
                }
                .animate-float-icon-11 {
                    animation: float 16s ease-in-out infinite;
                }
                .animate-float-icon-12 {
                    animation: float 24s ease-in-out infinite;
                }
                .animate-float-icon-13 {
                    animation: float 18s ease-in-out infinite;
                }
                .animate-float-icon-14 {
                    animation: float 20s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default MyViewedHistory;
