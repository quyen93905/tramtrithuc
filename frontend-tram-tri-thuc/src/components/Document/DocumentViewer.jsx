import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import {
    FileText,
    Download,
    ExternalLink,
    AlertCircle,
    Eye,
    FileImage,
    FileVideo,
    FileAudio,
    File,
} from "lucide-react";

export default function DocumentViewer({
    fileUrl,
    fileType,
    fileName,
    title = "Xem nội dung tài liệu",
    className = "",
    showHeader = true,
    height = "600px",
}) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        setHasError(false);
    }, [fileUrl]);

    const handleLoad = () => {
        setIsLoading(false);
        setHasError(false);
    };

    const handleError = () => {
        setIsLoading(false);
        setHasError(true);
    };

    const getFileIcon = (type) => {
        if (!type) return File;

        if (type.includes("pdf")) return FileText;
        if (type.includes("image")) return FileImage;
        if (type.includes("video")) return FileVideo;
        if (type.includes("audio")) return FileAudio;
        return File;
    };

    const getFileTypeDisplay = (type) => {
        if (!type) return "Không xác định";

        const typeMap = {
            "application/pdf": "PDF",
            "image/jpeg": "JPEG",
            "image/png": "PNG",
            "image/gif": "GIF",
            "image/webp": "WebP",
            "video/mp4": "MP4",
            "video/webm": "WebM",
            "audio/mp3": "MP3",
            "audio/wav": "WAV",
            "application/msword": "Word",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word",
            "application/vnd.ms-excel": "Excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Excel",
            "application/vnd.ms-powerpoint": "PowerPoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation":
                "PowerPoint",
            "text/plain": "Text",
        };

        return typeMap[type] || type.split("/")[1]?.toUpperCase() || "Không xác định";
    };

    const renderViewer = () => {
        if (!fileUrl) {
            return (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-700 mb-2">
                        Không có file đính kèm
                    </h4>
                    <p className="text-gray-600">
                        Tài liệu này không có file đính kèm để xem trước.
                    </p>
                </div>
            );
        }

        if (hasError) {
            return (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h4 className="text-lg font-semibold text-red-800 mb-2">Lỗi tải tài liệu</h4>
                    <p className="text-red-600 mb-4">
                        Không thể tải tài liệu. Vui lòng thử lại sau.
                    </p>
                    <div className="flex justify-center space-x-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                            Thử lại
                        </button>
                        <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
                        >
                            <ExternalLink size={16} />
                            <span>Mở trong tab mới</span>
                        </a>
                    </div>
                </div>
            );
        }

        // PDF Viewer
        if (fileType === "application/pdf") {
            return (
                <div className="relative bg-gray-50 rounded-2xl overflow-hidden" style={{ height }}>
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                            <div className="flex flex-col items-center space-y-4">
                                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-sm text-gray-600">Đang tải PDF...</p>
                            </div>
                        </div>
                    )}
                    <iframe
                        src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                        className="w-full h-full border-0"
                        title="PDF Viewer"
                        onLoad={handleLoad}
                        onError={handleError}
                        allowFullScreen
                    >
                        <p>Trình duyệt của bạn không hỗ trợ hiển thị PDF.</p>
                    </iframe>
                </div>
            );
        }

        // Image Viewer
        if (fileType?.includes("image")) {
            return (
                <div className="relative bg-gray-50 rounded-2xl overflow-hidden p-4">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                            <div className="flex flex-col items-center space-y-4">
                                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-sm text-gray-600">Đang tải hình ảnh...</p>
                            </div>
                        </div>
                    )}
                    <img
                        src={fileUrl}
                        alt={fileName || "Document image"}
                        className="w-full h-auto max-h-96 object-contain mx-auto rounded-lg shadow-md"
                        onLoad={handleLoad}
                        onError={handleError}
                    />
                </div>
            );
        }

        // Video Viewer
        if (fileType?.includes("video")) {
            return (
                <div className="relative bg-gray-50 rounded-2xl overflow-hidden">
                    <video
                        src={fileUrl}
                        controls
                        className="w-full h-auto max-h-96 rounded-lg"
                        onLoadedData={handleLoad}
                        onError={handleError}
                    >
                        Trình duyệt của bạn không hỗ trợ video.
                    </video>
                </div>
            );
        }

        // Audio Viewer
        if (fileType?.includes("audio")) {
            return (
                <div className="bg-gray-50 rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileAudio className="w-8 h-8 text-blue-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-700 mb-4">File âm thanh</h4>
                    <audio
                        src={fileUrl}
                        controls
                        className="w-full max-w-md mx-auto"
                        onLoadedData={handleLoad}
                        onError={handleError}
                    >
                        Trình duyệt của bạn không hỗ trợ audio.
                    </audio>
                </div>
            );
        }

        // Text files
        if (fileType?.includes("text")) {
            return (
                <div className="bg-gray-50 rounded-2xl overflow-hidden" style={{ height }}>
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                            <div className="flex flex-col items-center space-y-4">
                                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-sm text-gray-600">Đang tải văn bản...</p>
                            </div>
                        </div>
                    )}
                    <iframe
                        src={fileUrl}
                        className="w-full h-full border-0"
                        title="Text Viewer"
                        onLoad={handleLoad}
                        onError={handleError}
                    />
                </div>
            );
        }

        // Office documents (Word, Excel, PowerPoint)
        if (
            fileType?.includes("officedocument") ||
            fileType?.includes("msword") ||
            fileType?.includes("ms-excel") ||
            fileType?.includes("ms-powerpoint")
        ) {
            const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;

            return (
                <div className="relative bg-gray-50 rounded-2xl overflow-hidden" style={{ height }}>
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                            <div className="flex flex-col items-center space-y-4">
                                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-sm text-gray-600">Đang tải tài liệu Office...</p>
                            </div>
                        </div>
                    )}
                    <iframe
                        src={officeViewerUrl}
                        className="w-full h-full border-0"
                        title="Office Document Viewer"
                        onLoad={handleLoad}
                        onError={handleError}
                    />
                </div>
            );
        }

        // Unsupported file types
        const FileIcon = getFileIcon(fileType);
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileIcon className="w-8 h-8 text-yellow-600" />
                </div>
                <h4 className="text-lg font-semibold text-yellow-800 mb-2">Không thể xem trước</h4>
                <p className="text-yellow-700 mb-4">
                    Không thể xem trước tài liệu loại {getFileTypeDisplay(fileType)} trực tiếp.
                </p>
                <div className="flex justify-center space-x-3">
                    <a
                        href={fileUrl}
                        download={fileName}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center space-x-2"
                    >
                        <Download size={16} />
                        <span>Tải xuống</span>
                    </a>
                    <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
                    >
                        <ExternalLink size={16} />
                        <span>Mở trong tab mới</span>
                    </a>
                </div>
            </div>
        );
    };

    return (
        <div
            className={`bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden ${className}`}
        >
            {showHeader && (
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
                            <Eye className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                            {fileName && (
                                <p className="text-sm text-gray-600">
                                    {fileName} • {getFileTypeDisplay(fileType)}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="p-6">{renderViewer()}</div>
        </div>
    );
}

DocumentViewer.propTypes = {
    fileUrl: PropTypes.string,
    fileType: PropTypes.string,
    fileName: PropTypes.string,
    title: PropTypes.string,
    className: PropTypes.string,
    showHeader: PropTypes.bool,
    height: PropTypes.string,
};
