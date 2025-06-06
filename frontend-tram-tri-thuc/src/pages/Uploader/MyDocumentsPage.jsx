import { useState, useMemo, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { clearError, deleteDocument, fetchMyDocuments } from "../../store/slices/documentSlice";
import showToast from "../../utils/toast";
import { motion } from "framer-motion";
import { FiEdit2, FiTrash2, FiUpload, FiClock, FiCheck, FiFileText } from "react-icons/fi";

import useDebounce from "../../utils/useDebounce";
import { fetchCategories } from "../../store/slices/categorySlice";
import SearchBar from "../../components/Document/SearchBar";
import FilterPanel from "../../components/Document/FilterPanel";
import Pagination from "../../components/Common/Pagination";

export default function MyDocumentsPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {
        myDocuments,
        loading: documentsLoading,
        error: documentsError,
        myDocumentsPagination,
    } = useSelector((state) => state.documents);
    const {
        categories,
        loading: categoriesLoading,
        error: categoriesError,
    } = useSelector((state) => state.categories);
    const { userInfo } = useSelector((state) => state.user);

    const [filters, setFilters] = useState({
        search: "",
        category: "",
        status: "",
        startDate: "",
        endDate: "",
        dateField: "createdAt",
        sort: "createdAt:desc",
        page: 1,
    });
    const debouncedSearch = useDebounce(filters.search, 500);

    // Fetch categories
    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    // Fetch documents
    const fetchDocuments = useCallback(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            showToast("error", "Vui lòng đăng nhập để xem tài liệu.");
            navigate("/auth/login");
            return;
        }

        const params = {
            ...filters,
            search: debouncedSearch,
            page: filters.page,
        };
        // Clean params: remove empty values
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v != null && v !== "")
        );
        dispatch(fetchMyDocuments(cleanParams))
            .unwrap()
            .catch((err) => {
                showToast("error", err.message || "Lỗi khi tải tài liệu.");
            });
    }, [
        dispatch,
        navigate,
        debouncedSearch,
        filters.page,
        filters.category,
        filters.status,
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
        if (documentsError) {
            showToast("error", documentsError);
            dispatch(clearError());
        }
        if (categoriesError) {
            showToast("error", categoriesError);
            dispatch(clearError());
        }
    }, [documentsError, categoriesError, dispatch]);

    const handleDelete = useCallback(
        (id) => {
            if (!window.confirm("Bạn có chắc muốn xóa tài liệu này?")) return;

            dispatch(deleteDocument(id))
                .unwrap()
                .then(() => {
                    showToast("success", "Xóa tài liệu thành công!");
                    fetchDocuments(); // Refresh danh sách
                })
                .catch((err) => showToast("error", err?.message || "Lỗi khi xóa tài liệu."));
        },
        [dispatch, fetchDocuments]
    );

    const handleFilterChange = useCallback((newFilters) => {
        setFilters({ ...newFilters, page: 1 }); // Reset page when filters change
    }, []);

    const handlePageChange = useCallback((newPage) => {
        setFilters((prev) => ({ ...prev, page: newPage }));
    }, []);

    const filtersConfig = useMemo(
        () => [
            {
                key: "category",
                label: "Danh mục",
                type: "select",
                placeholder: "Chọn danh mục",
                options: categories.map((cat) => ({
                    value: cat.slug,
                    label: cat.name,
                })),
            },
            {
                key: "status",
                label: "Trạng thái",
                type: "select",
                placeholder: "Chọn trạng thái",
                options: [
                    { value: "approved", label: "Đã duyệt" },
                    { value: "pending", label: "Chờ duyệt" },
                    { value: "rejected", label: "Bị từ chối" },
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

    const sortOptions = useMemo(
        () => [
            { value: "createdAt:desc", label: "Mới nhất" },
            { value: "createdAt:asc", label: "Cũ nhất" },
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

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header Section */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-10"
                >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                    <FiFileText className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent font-['Inter']">
                                        Tài liệu của tôi
                                    </h1>
                                    <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mt-1"></div>
                                </div>
                            </div>
                            <p className="text-gray-600 text-lg max-w-2xl">
                                Quản lý và theo dõi các tài liệu bạn đã đăng tải một cách dễ dàng
                            </p>
                        </div>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link
                                to="/uploader/upload"
                                className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-2xl font-semibold shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <FiUpload className="mr-3 w-5 h-5 relative z-10" />
                                <span className="relative z-10">Tải lên tài liệu mới</span>
                                <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Filter and Search */}
                <div className="mb-6">
                    <SearchBar
                        onSearch={(value) =>
                            setFilters((prev) => ({ ...prev, search: value, page: 1 }))
                        }
                        placeholder="Tìm kiếm tiêu đề, mô tả, thẻ..."
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
                                status: "",
                                startDate: "",
                                endDate: "",
                                dateField: "createdAt",
                                sort: "createdAt:desc",
                            }}
                        />
                    )}
                </div>

                {/* Loading State */}
                {documentsLoading && (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
                    </div>
                )}

                {/* Error State */}
                {documentsError && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg
                                    className="h-5 w-5 text-red-400"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{documentsError}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Documents List */}
                {!documentsLoading && !documentsError && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
                        {myDocuments.length > 0 ? (
                            <>
                                <ul className="divide-y divide-gray-200">
                                    {myDocuments.map((doc) => (
                                        <motion.li
                                            key={doc._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5 }}
                                            className="hover:bg-gray-50/50 transition-colors"
                                        >
                                            <div className="px-6 py-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                            {doc.title}
                                                        </h3>
                                                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                                                            <span>
                                                                Đăng ngày: {new Date(doc.createdAt).toLocaleDateString("vi-VN")}
                                                            </span>
                                                            <span className="flex items-center">
                                                                <span
                                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                        doc.status === "approved"
                                                                            ? "bg-green-100 text-green-800"
                                                                            : doc.status === "pending"
                                                                            ? "bg-yellow-100 text-yellow-800"
                                                                            : "bg-red-100 text-red-800"
                                                                    }`}
                                                                >
                                                                    {doc.status === "approved" ? (
                                                                        <FiCheck className="w-4 h-4 mr-1" />
                                                                    ) : (
                                                                        <FiClock className="w-4 h-4 mr-1" />
                                                                    )}
                                                                    {doc.status === "approved"
                                                                        ? "Đã duyệt"
                                                                        : doc.status === "pending"
                                                                        ? "Chờ duyệt"
                                                                        : "Bị từ chối"}
                                                                </span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        <Link
                                                            to={`/uploader/edit-document/${doc._id}`}
                                                            className="inline-flex items-center p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                                                            title="Chỉnh sửa"
                                                        >
                                                            <FiEdit2 className="w-5 h-5" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(doc._id)}
                                                            className="inline-flex items-center p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                                                            title="Xóa"
                                                        >
                                                            <FiTrash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.li>
                                    ))}
                                </ul>
                                <Pagination
                                    page={myDocumentsPagination.currentPage}
                                    totalPages={myDocumentsPagination.totalPages}
                                    onNext={() =>
                                        handlePageChange(myDocumentsPagination.currentPage + 1)
                                    }
                                    onPrev={() =>
                                        handlePageChange(myDocumentsPagination.currentPage - 1)
                                    }
                                    onPageChange={handlePageChange}
                                    isLoading={documentsLoading}
                                />
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500">Chưa có tài liệu nào.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
