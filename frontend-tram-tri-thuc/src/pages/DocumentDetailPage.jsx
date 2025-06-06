import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import DownloadButton from "../components/Document/DownloadButton";
import CommentSection from "../components/Document/CommentSection";
import RatingStars from "../components/Rating/RatingStar";
import { fetchDocumentBySlug, toggleFavorite } from "../store/slices/documentSlice";
import { motion } from "framer-motion";
import { Heart, FileText, User, Calendar, Eye } from "lucide-react";
import DocumentViewer from "../components/Document/DocumentViewer";

export default function DocumentDetailPage() {
    const { slug } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentDocument, loading, error } = useSelector((state) => state.documents);
    const {
        userInfo,
        favoriteDocuments = [],
        loading: userLoading,
    } = useSelector((state) => state.user);

    useEffect(() => {
        dispatch(fetchDocumentBySlug(slug));
    }, [dispatch, slug]);

    const isFavorite = favoriteDocuments.some((fav) => fav._id === currentDocument?._id);
    const favoriteCount = currentDocument?.favoriteCount ?? 0;

    const handleToggleFavorite = () => {
        if (!userInfo) {
            navigate("/auth/login");
            return;
        }
        dispatch(toggleFavorite(currentDocument?._id))
            .unwrap()
            .catch((error) => {
                console.error("Toggle favorite failed:", error);
            });
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col justify-center items-center h-64 space-y-4">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-400 rounded-full animate-spin animate-reverse"></div>
                    </div>
                    <div className="text-center">
                        <p className="text-xl font-semibold text-gray-700 mb-2">
                            Đang tải tài liệu...
                        </p>
                        <p className="text-sm text-gray-500">Vui lòng chờ trong giây lát</p>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md mx-auto"
                >
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center shadow-lg">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-red-800 mb-2">Có lỗi xảy ra</h3>
                        <p className="text-red-600">
                            {typeof error === "string"
                                ? error
                                : error.message || "Đã xảy ra lỗi không xác định"}
                        </p>
                    </div>
                </motion.div>
            );
        }

        if (!currentDocument) {
            return (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md mx-auto"
                >
                    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-8 text-center shadow-lg">
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-orange-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-orange-800 mb-2">
                            Không tìm thấy tài liệu
                        </h3>
                        <p className="text-orange-600">
                            Tài liệu bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
                        </p>
                    </div>
                </motion.div>
            );
        }

        // ✅ BƯỚC 1: Xác định URL của backend.
        // Cách tốt nhất là dùng biến môi trường (ví dụ: VITE_API_URL=http://localhost:5000)
        const backendUrl = "http://localhost:5000";

        // ✅ BƯỚC 2: Tạo URL đầy đủ cho file để component DocumentViewer có thể truy cập.
        const fullFileUrl = `${backendUrl}${currentDocument.fileUrl}`;

        return (
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20"
                >
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                        {currentDocument.title}
                                    </h1>
                                </div>
                            </div>

                            <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                                <div className="flex items-center space-x-2">
                                    <User className="w-4 h-4" />
                                    <span>
                                        Tác giả:{" "}
                                        <span className="font-medium">
                                            {currentDocument.uploaderId?.name || "Unknown"}
                                        </span>
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>
                                        {new Date(currentDocument.createdAt).toLocaleDateString(
                                            "vi-VN"
                                        )}
                                    </span>
                                </div>
                            </div>

                            <div className="mb-6">
                                <RatingStars documentId={currentDocument._id} />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-4">
                        <DownloadButton documentId={currentDocument._id} />
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
                                isFavorite
                                    ? "bg-red-500 text-white shadow-lg shadow-red-500/25"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                            onClick={handleToggleFavorite}
                            disabled={userLoading}
                        >
                            <Heart
                                size={18}
                                className={`${isFavorite ? "fill-current" : "fill-none"} transition-all duration-300`}
                            />
                            <span>{favoriteCount} Yêu thích</span>
                        </motion.button>
                    </div>
                </motion.div>

                {/* Document Viewer Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <DocumentViewer
                        fileUrl={fullFileUrl}
                        fileType={currentDocument.mimeType}
                        fileName={currentDocument.fileName || currentDocument.title}
                        title="Xem nội dung tài liệu"
                        height="700px"
                    />
                </motion.div>

                {/* Comments Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20"
                >
                    <CommentSection documentId={currentDocument._id} />
                </motion.div>
            </div>
        );
    };

    return (
        <div className="min-h-screen relative -mt-16">
            {/* Enhanced Background */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-teal-50"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,rgba(255,182,193,0.1),transparent_50%)]"></div>
                <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_20%_80%,rgba(173,216,230,0.1),transparent_50%)]"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 pt-24 pb-16 px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="container mx-auto"
                >
                    {renderContent()}
                </motion.div>
            </div>
        </div>
    );
}
