import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Download, Heart, Eye, User, Tag } from "lucide-react";
import { downloadDocument, toggleFavorite } from "../../store/slices/documentSlice";
import { fetchFavoriteDocuments } from "../../store/slices/userSlice";
import { motion } from "framer-motion";

export default function DocumentCard({ document, type }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {
        userInfo,
        favoriteDocuments = [],
        loading: userLoading,
    } = useSelector((state) => state.user);

    const isFavorite = favoriteDocuments.some((fav) => fav._id === document._id);
    const favoriteCount = document.favoriteCount ?? 0;

    const handleDownload = () => {
        dispatch(downloadDocument(document._id));
    };

    const handleToggleFavorite = () => {
        if (!userInfo) {
            navigate("/auth/login");
            return;
        }
        dispatch(toggleFavorite(document._id))
            .unwrap()
            .then(() => {
                // Gọi lại fetchFavoriteDocuments để đồng bộ
                dispatch(fetchFavoriteDocuments({ page: 1, limit: 12 }));
            })
            .catch((error) => {
                console.error("Toggle favorite failed:", error);
            });
    };

    const tags = document.tag ? document.tag.split(",").map((tag) => tag.trim()) : [];

    // Hàm format ngày giờ
    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <motion.div
            whileHover={{
                translateY: -5,
                boxShadow:
                    "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            }}
            transition={{ duration: 0.2 }}
            className="relative h-full bg-white rounded-xl shadow-md p-6 flex flex-col justify-between border border-gray-100 hover:shadow-lg transition-all duration-300"
        >
            <div>
                <Link to={`/documents/${document.slug}`} className="block mb-2">
                    <h3 className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {document.title}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <User size={14} className="text-gray-400" />
                        {document.uploader?.name || "Người đăng ẩn danh"}
                    </p>
                </Link>
                <p className="text-sm text-gray-700 mt-2 line-clamp-3">
                    {document.description || "Không có mô tả cho tài liệu này."}
                </p>

                {/* Dynamic date info based on type */}
                {type === "download" && document.downloadedAt && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-2">
                        <Download size={12} className="text-blue-400" />
                        Tải xuống: {formatDateTime(document.downloadedAt)}
                    </p>
                )}
                {type === "favorite" && document.favoritedAt && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-2">
                        <Heart size={12} className="text-red-400" />
                        Yêu thích: {formatDateTime(document.favoritedAt)}
                    </p>
                )}
                {type === "view" && document.viewedAt && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-2">
                        <Eye size={12} className="text-green-400" />
                        Xem: {formatDateTime(document.viewedAt)}
                    </p>
                )}
            </div>

            {/* Tags */}
            {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                    <Tag size={14} className="text-gray-400 flex-shrink-0" />
                    {tags.map((tag, index) => (
                        <span
                            key={index}
                            className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full font-medium"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Actions and Stats */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                        <Eye size={16} className="text-gray-500" />
                        <span>{document.viewCount || 0}</span>
                    </div>
                    <motion.button
                        className={`flex items-center gap-1 ${isFavorite ? "text-red-600" : "text-gray-600"} hover:text-red-800 transition-colors`}
                        onClick={handleToggleFavorite}
                        disabled={userLoading}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <Heart
                            size={16}
                            className={isFavorite ? "fill-red-600" : "fill-none stroke-gray-600"}
                        />
                        <span>{favoriteCount}</span>
                    </motion.button>
                </div>
                <motion.button
                    className="flex items-center gap-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md"
                    onClick={handleDownload}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Download size={16} />
                    Tải xuống ({document.downloadCount || 0})
                </motion.button>
            </div>
        </motion.div>
    );
}
