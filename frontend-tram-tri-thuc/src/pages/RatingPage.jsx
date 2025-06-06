import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { debounce } from "lodash";
import { Search, TrendingUp, Eye, Award, Heart, User, BookOpen, Filter } from "lucide-react";
import { FaFilePdf, FaFileWord, FaFilePowerpoint, FaFileArchive } from "react-icons/fa";
import { Button, Input } from "antd";
import { fetchDocuments, fetchDocumentById, toggleFavorite } from "../store/slices/documentSlice";
import {
    fetchRatingsByDocument,
    fetchAverageRating,
    fetchRatingDistribution,
    createOrUpdateRating,
    deleteRating,
} from "../store/slices/ratingSlice";
import { fetchCategories } from "../store/slices/categorySlice";
import DetailedRating from "../components/Rating/DetailedRating";
import RatingStar from "../components/Rating/RatingStar";

// Emoji cho từng loại tài liệu
const formatIcons = {
    pdf: <FaFilePdf className="text-red-500 text-2xl" />,
    docx: <FaFileWord className="text-blue-500 text-2xl" />,
    pptx: <FaFilePowerpoint className="text-orange-500 text-2xl" />,
    zip: <FaFileArchive className="text-gray-500 text-2xl" />,
};

// Trang chính quản lý danh sách tài liệu và đánh giá
const RatingPage = () => {
    const dispatch = useDispatch();
    const { documentId } = useParams();
    const {
        documents,
        currentDocument,
        loading: docLoading,
        error: docError,
    } = useSelector((state) => state.documents);
    const {
        ratings,
        averageRating,
        ratingDistribution,
        loading: ratingLoading,
        error: ratingError,
    } = useSelector((state) => state.ratings);
    const {
        categories,
        loading: catLoading,
        error: catError,
    } = useSelector((state) => state.categories);
    const { userInfo } = useSelector((state) => state.user);

    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("all");
    const [sortBy, setSortBy] = useState("averageRating:desc");
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [isFiltering, setIsFiltering] = useState(false);

    // Debounce tìm kiếm
    const debouncedSearch = useMemo(() => debounce((value) => setSearchTerm(value), 50), []);

    // Lấy danh mục
    useEffect(() => {
        dispatch(fetchCategories({ page: 1, limit: 100 }));
    }, [dispatch]);

    // Lấy danh sách tài liệu
    useEffect(() => {
        setIsFiltering(true);
        const params = {
            page: 1,
            limit: 10,
            search: searchTerm,
            category: filterCategory === "all" ? "" : filterCategory,
            sort: sortBy,
        };
        console.log("Fetching documents with params:", params); // Debug
        dispatch(fetchDocuments(params)).finally(() => setIsFiltering(false));
    }, [dispatch, searchTerm, filterCategory, sortBy]);

    // Debug filterCategory
    useEffect(() => {
        console.log("Current filterCategory:", filterCategory); // Debug
        const selectedCat = categories.find((cat) => cat.slug === filterCategory);
        console.log("Selected category:", selectedCat); // Debug
    }, [filterCategory, categories]);

    // Đồng bộ selectedDocument với currentDocument
    useEffect(() => {
        if (currentDocument) {
            const updatedDocument = {
                ...currentDocument,
                averageRating: averageRating.avgScore || 0,
                totalRatings: averageRating.totalRatings || 0,
            };
            setSelectedDocument(updatedDocument);
            console.log("SelectedDocument:", updatedDocument);
        }
    }, [currentDocument, averageRating]);

    // Xử lý lỗi
    useEffect(() => {
        if (docError) toast.error(docError);
        if (ratingError) toast.error(ratingError.message);
        if (catError) toast.error(catError);
    }, [docError, ratingError, catError]);

    // Xử lý chọn tài liệu
    const handleDocumentSelect = (docId) => {
        dispatch(fetchDocumentById(docId));
        dispatch(fetchRatingsByDocument({ documentId: docId, params: { page: 1, limit: 10 } }));
        dispatch(fetchAverageRating(docId));
        dispatch(fetchRatingDistribution(docId));
    };

    // Xử lý gửi đánh giá
    const handleNewRating = ({ documentId, score, review }) => {
        dispatch(createOrUpdateRating({ documentId, score, review })).then((result) => {
            if (result.meta.requestStatus === "rejected") {
                toast.error(result.payload.message);
            }
        });
    };

    // Xử lý xóa đánh giá
    const handleDeleteRating = (documentId) => {
        dispatch(deleteRating(documentId)).then((result) => {
            if (result.meta.requestStatus === "rejected") {
                toast.error(result.payload.message);
            }
        });
    };

    // Render danh sách tài liệu
    const renderDocumentList = (docs) => (
        <div className="space-y-3">
            {docs.map((doc) => (
                <div
                    key={doc._id}
                    className={`p-4 rounded-lg cursor-pointer transition-all bg-white shadow-sm ${
                        selectedDocument?._id === doc._id
                            ? "bg-blue-100 border-2 border-blue-300 shadow-md"
                            : "hover:bg-gray-100 border-2 border-transparent hover:shadow-sm"
                    }`}
                    onClick={() => handleDocumentSelect(doc._id)}
                >
                    <div className="flex items-start space-x-3">
                        <div>{formatIcons[doc.format]}</div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate mb-1">
                                {doc.title}
                            </h4>
                            <p className="text-xs text-gray-500 mb-2">
                                {doc.uploaderId?.name || "Ẩn danh"} • {doc.categoryId?.name}
                            </p>
                            <div className="flex items-center space-x-1 mb-2">
                                <RatingStar
                                    rating={doc.averageRating}
                                    readOnly={true}
                                    size="small"
                                    showLabel={false}
                                />
                                <span className="text-xs text-gray-600">
                                    {doc.averageRating?.toFixed(1)} ({doc.totalRatings})
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <div className="flex items-center space-x-1">
                                    <Eye className="w-3 h-3" />
                                    <span>{doc.viewCount.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <Award className="w-3 h-3" />
                                    <span>{doc.downloadCount.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
            </div>
            {/* Header */}
            <div className="bg-white shadow-sm border-b relative z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Hệ thống Đánh giá</h1>
                            <p className="text-gray-600 mt-1">Quản lý thư viện tài liệu online</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <Input
                                    placeholder="Tìm kiếm tiêu đề, tác giả..."
                                    value={searchTerm}
                                    onChange={(e) => debouncedSearch(e.target.value)}
                                    className="pl-10 w-64"
                                />
                            </div>
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                disabled={catLoading}
                            >
                                <option value="all">Tất cả danh mục</option>
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat.slug}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="averageRating:desc">Đánh giá cao nhất</option>
                                <option value="downloadCount:desc">Tải về nhiều nhất</option>
                                <option value="viewCount:desc">Xem nhiều nhất</option>
                                <option value="createdAt:desc">Mới nhất</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar - Danh sách tài liệu */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm sticky top-6 max-h-screen overflow-y-auto">
                            <div className="p-6 pb-4 border-b border-gray-200">
                                <div className="flex items-center space-x-2">
                                    <TrendingUp className="w-5 h-5 text-blue-500" />
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Danh sách tài liệu
                                    </h3>
                                </div>
                            </div>
                            <div className="p-6">
                                {isFiltering || docLoading ? (
                                    <p className="text-gray-500 text-sm text-center py-8">
                                        Đang tải tài liệu...
                                    </p>
                                ) : documents.length === 0 ? (
                                    <p className="text-gray-500 text-sm text-center py-8">
                                        Không có tài liệu trong danh mục{" "}
                                        {categories.find((cat) => cat.slug === filterCategory)
                                            ?.name || ""}
                                    </p>
                                ) : (
                                    renderDocumentList(documents)
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content - Rating Section */}
                    <div className="lg:col-span-2">
                        {docLoading || ratingLoading ? (
                            <div className="bg-white rounded-lg shadow-sm p-6 text-center py-8">
                                Đang tải...
                            </div>
                        ) : selectedDocument ? (
                            <>
                                {/* Document Info */}
                                <div className="bg-white rounded-lg shadow-sm mb-6">
                                    <div className="p-6">
                                        <div className="flex items-start space-x-4">
                                            <div className="text-4xl">
                                                {formatIcons[selectedDocument.format]}
                                            </div>
                                            <div className="flex-1">
                                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                                    {selectedDocument.title}
                                                </h2>
                                                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                                                    <div className="flex items-center space-x-1">
                                                        <User className="w-4 h-4" />
                                                        <span>
                                                            {selectedDocument.uploaderId?.name ||
                                                                "Ẩn danh"}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <BookOpen className="w-4 h-4" />
                                                        <span>
                                                            {selectedDocument.format.toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Filter className="w-4 h-4" />
                                                        <span>
                                                            {selectedDocument.categoryId?.name}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-3 gap-4 text-center">
                                                    <div className="bg-blue-50 p-3 rounded-lg">
                                                        <div className="text-2xl font-bold text-blue-600">
                                                            {selectedDocument.averageRating?.toFixed(
                                                                1
                                                            ) || 0}
                                                        </div>
                                                        <div className="text-xs text-gray-600">
                                                            Đánh giá
                                                        </div>
                                                    </div>
                                                    <div className="bg-green-50 p-3 rounded-lg">
                                                        <div className="text-2xl font-bold text-green-600">
                                                            {selectedDocument.downloadCount.toLocaleString()}
                                                        </div>
                                                        <div className="text-xs text-gray-600">
                                                            Tải về
                                                        </div>
                                                    </div>
                                                    <div className="bg-purple-50 p-3 rounded-lg">
                                                        <div className="text-2xl font-bold text-purple-600">
                                                            {selectedDocument.viewCount.toLocaleString()}
                                                        </div>
                                                        <div className="text-xs text-gray-600">
                                                            Lượt xem
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Rating Section */}
                                <DetailedRating
                                    documentId={selectedDocument._id}
                                    ratings={ratings}
                                    averageRating={averageRating}
                                    ratingDistribution={ratingDistribution}
                                    onNewRating={handleNewRating}
                                    onDeleteRating={handleDeleteRating}
                                    userId={userInfo?._id}
                                />
                            </>
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm p-6 text-center py-8">
                                Chọn một tài liệu để xem chi tiết
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RatingPage;
