import { useState, useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import FilterPanel from "../../components/Document/FilterPanel";
import CategorySidebar from "../../components/Document/CategorySidebar";
import DocumentList from "../../components/Document/DocumentList";
import { fetchFeaturedDocuments, clearError } from "../../store/slices/documentSlice";
import { fetchCategories } from "../../store/slices/categorySlice";
import useDebounce from "../../utils/useDebounce";
import showToast from "../../utils/toast";

// Import hero background image
import heroBackground from "../../assets/images/library-bg.jpg";

export default function HomePage() {
    const dispatch = useDispatch();
    const { featuredDocuments, loading, error, featuredPagination } = useSelector(
        (state) => state.documents
    );
    const {
        categories,
        loading: categoriesLoading,
        error: categoriesError,
    } = useSelector((state) => state.categories);

    const [filters, setFilters] = useState({
        search: "",
        startDate: "",
        endDate: "",
        dateField: "createdAt",
        sort: "createdAt:desc",
        page: 1,
        limit: 6,
    });
    const debouncedSearch = useDebounce(filters.search, 500);

    // Fetch categories
    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    // Fetch featured documents
    const fetchDocuments = useCallback(() => {
        const params = {
            ...filters,
            search: debouncedSearch,
            page: filters.page,
            limit: filters.limit,
        };
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v != null && v !== "")
        );
        dispatch(fetchFeaturedDocuments(cleanParams))
            .unwrap()
            .then((data) => console.log("Featured Documents Response:", data))
            .catch((err) => {
                showToast("error", err.message || "Lỗi khi tải tài liệu nổi bật.");
            });
    }, [
        dispatch,
        debouncedSearch,
        filters.page,
        filters.limit,
        filters.startDate,
        filters.endDate,
        filters.dateField,
        filters.sort,
    ]);

    // Trigger fetch when debouncedSearch or other filters change
    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments, debouncedSearch]);

    // Handle errors
    useEffect(() => {
        if (error) {
            showToast("error", error);
            dispatch(clearError());
        }
        if (categoriesError) {
            showToast("error", categoriesError);
            dispatch(clearError());
        }
    }, [error, categoriesError, dispatch]);

    // Handle filter changes
    const handleFilterChange = useCallback((newFilters) => {
        setFilters((prev) => ({ ...newFilters, page: 1 }));
    }, []);

    // Handle page change
    const handlePageChange = useCallback((newPage) => {
        setFilters((prev) => ({ ...prev, page: newPage }));
    }, []);

    // Filter configuration
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

    // Sort options
    const sortOptions = useMemo(
        () => [
            { value: "createdAt:desc", label: "Mới nhất" },
            { value: "createdAt:asc", label: "Cũ nhất" },
        ],
        []
    );

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div
                className="relative bg-cover bg-center min-h-[600px] flex items-center"
                style={{
                    backgroundImage: `url(${heroBackground})`,
                }}
            >
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/50"></div>

                <div className="container mx-auto px-4 py-16 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.h1
                            className="text-4xl md:text-6xl font-bold mb-6 text-white drop-shadow-lg"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            Khám Phá Kho Tàng Tri Thức
                        </motion.h1>
                        <motion.p
                            className="text-xl md:text-2xl mb-8 text-gray-100 drop-shadow-lg"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            Truy cập hàng nghìn tài liệu chất lượng cao từ cộng đồng học thuật
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="max-w-2xl mx-auto"
                        >
                            {categoriesLoading ? (
                                <div className="flex justify-center items-center h-10">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                                </div>
                            ) : (
                                <FilterPanel
                                    filtersConfig={filtersConfig}
                                    sortOptions={sortOptions}
                                    onFilterChange={handleFilterChange}
                                    defaultFilters={{
                                        startDate: "",
                                        endDate: "",
                                        dateField: "createdAt",
                                        sort: "createdAt:desc",
                                    }}
                                    className="backdrop-blur-sm bg-white/10 rounded-lg p-4"
                                />
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <motion.aside
                        variants={itemVariants}
                        className="lg:col-span-1"
                    >
                        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                            <h2 className="text-xl font-semibold mb-4 text-gray-900">Danh Mục</h2>
                            <CategorySidebar />
                        </div>
                    </motion.aside>

                    {/* Featured Documents */}
                    <main className="lg:col-span-3">
                        <motion.div
                            variants={itemVariants}
                            className="bg-white rounded-xl shadow-sm p-6 mb-8"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Tài Liệu Nổi Bật
                                </h2>
                            </div>

                            {loading && (
                                <div className="flex justify-center items-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                                    <p className="text-red-700">{error}</p>
                                </div>
                            )}

                            {!loading && !error && featuredDocuments?.length === 0 && (
                                <div className="bg-gray-50 p-6 rounded-lg text-center">
                                    <p className="text-gray-600">Chưa có tài liệu nổi bật.</p>
                                </div>
                            )}

                            <DocumentList
                                type="featured"
                                documents={featuredDocuments}
                                pagination={featuredPagination}
                                onPageChange={handlePageChange}
                                isLoading={loading}
                            />
                        </motion.div>
                    </main>
                </div>
            </div>
        </div>
    );
}