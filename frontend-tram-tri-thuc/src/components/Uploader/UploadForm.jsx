import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../../store/slices/categorySlice";
import { clearError, uploadDocument } from "../../store/slices/documentSlice";
import showToast from "../../utils/toast";
import { FaCloudUploadAlt, FaImage, FaTags, FaFolder, FaHeading, FaTrash, FaShieldAlt } from "react-icons/fa";
import { MdDescription } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";

export default function UploadForm() {
    const dispatch = useDispatch();
    const { categories } = useSelector((state) => state.categories);
    const { loading, error } = useSelector((state) => state.documents);

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        categoryId: "",
        tag: "",
        file: null,
        thumbnail: null,
    });
    const [dragActive, setDragActive] = useState({ document: false, thumbnail: false });
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        dispatch(fetchCategories({ page: 1, limit: 100 }));
        return () => dispatch(clearError());
    }, [dispatch]);

    const handleDrag = (e, type) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive((prev) => ({ ...prev, [type]: true }));
        } else if (e.type === "dragleave") {
            setDragActive((prev) => ({ ...prev, [type]: false }));
        }
    };

    const handleDrop = (e, type) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive((prev) => ({ ...prev, [type]: false }));

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (type === "document" && file.type === "application/pdf") {
                setFormData((prev) => ({ ...prev, file }));
            } else if (type === "thumbnail" && file.type.startsWith("image/")) {
                setFormData((prev) => ({ ...prev, thumbnail: file }));
                setPreviewUrl(URL.createObjectURL(file));
            } else {
                showToast(
                    "error",
                    type === "document" ? "Chỉ chấp nhận file PDF" : "Chỉ chấp nhận file ảnh"
                );
            }
        }
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (type === "document" && file && file.type === "application/pdf") {
            setFormData((prev) => ({ ...prev, file }));
        } else if (type === "thumbnail" && file && file.type.startsWith("image/")) {
            setFormData((prev) => ({ ...prev, thumbnail: file }));
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            showToast(
                "error",
                type === "document" ? "Chỉ chấp nhận file PDF" : "Chỉ chấp nhận file ảnh"
            );
        }
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.categoryId || !formData.file) {
            showToast("error", "Vui lòng điền đầy đủ tiêu đề, danh mục và file PDF");
            return;
        }

        const data = new FormData();
        data.append("title", formData.title);
        data.append("description", formData.description);
        data.append("categoryId", formData.categoryId);
        data.append("tag", formData.tag);
        if (formData.file) data.append("file", formData.file);
        if (formData.thumbnail) data.append("thumbnail", formData.thumbnail);

        try {
            await dispatch(uploadDocument(data)).unwrap();
            showToast("success", "Tải tài liệu thành công!");
            setFormData({
                title: "",
                description: "",
                categoryId: "",
                tag: "",
                file: null,
                thumbnail: null,
            });
            setPreviewUrl(null);
            setStep(1);
        } catch {
            showToast("error", "Không thể tải tài liệu");
        }
    };

    const nextStep = () => {
        if (formData.title && formData.categoryId) {
            setStep(2);
        } else {
            showToast("error", "Vui lòng điền tiêu đề và chọn danh mục");
        }
    };

    const clearFile = (type) => {
        setFormData((prev) => ({ ...prev, [type]: null }));
        if (type === "thumbnail") setPreviewUrl(null);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-5xl mx-auto p-6 bg-gray-50 min-h-screen flex"
        >
            {/* Main Form Section */}
            <div className="flex-1 bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Upload Tài Liệu</h2>

                {/* Progress Steps */}
                <div className="mb-8 flex items-center justify-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                            step >= 1 ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"
                        }`}>
                            1
                        </div>
                        <span className={`text-sm font-medium ${
                            step >= 1 ? "text-green-500" : "text-gray-500"
                        }`}>
                            Thông tin chi tiết
                        </span>
                    </div>
                    <div className="w-12 h-1 rounded-full bg-gray-200">
                        <div className={`h-full rounded-full transition-all duration-300 ${
                            step >= 2 ? "bg-green-500 w-full" : "bg-gray-300 w-0"
                        }`}></div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                            step >= 2 ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"
                        }`}>
                            2
                        </div>
                        <span className={`text-sm font-medium ${
                            step >= 2 ? "text-green-500" : "text-gray-500"
                        }`}>
                            Tệp đính kèm
                        </span>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên file <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Nhập tên tài liệu"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Danh mục <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.categoryId}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="">--Chọn danh mục--</option>
                                    {categories.map((cat) => (
                                        <option key={cat._id} value={cat._id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Từ khóa
                                </label>
                                <input
                                    type="text"
                                    value={formData.tag}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, tag: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Nhập từ khóa, phân cách bằng dấu phẩy"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mô tả
                                </label>
                                <textarea
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                    placeholder="Nhập mô tả tài liệu"
                                />
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={nextStep}
                                className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all"
                            >
                                Tiếp tục
                            </motion.button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            <div
                                className={`p-6 border-2 ${
                                    dragActive.document ? "border-purple-500 bg-purple-50" : "border-gray-300"
                                } border-dashed rounded-lg text-center`}
                                onDragEnter={(e) => handleDrag(e, "document")}
                                onDragLeave={(e) => handleDrag(e, "document")}
                                onDragOver={(e) => handleDrag(e, "document")}
                                onDrop={(e) => handleDrop(e, "document")}
                            >
                                <FaCloudUploadAlt className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="mt-4">
                                    <label className="cursor-pointer text-purple-600 hover:text-purple-700 font-semibold">
                                        <span>Chọn tệp</span>
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            onChange={(e) => handleFileChange(e, "document")}
                                            className="hidden"
                                        />
                                    </label>
                                    <p className="text-sm text-gray-500 mt-2">
                                        {formData.file ? formData.file.name : "Kéo thả file hoặc nhấp để chọn"}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Chỉ hỗ trợ định dạng PDF
                                    </p>
                                </div>
                                {formData.file && (
                                    <div className="mt-4 flex items-center justify-center space-x-3">
                                        <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium truncate max-w-xs">
                                            {formData.file.name}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => clearFile("file")}
                                            className="text-red-500 hover:text-red-700 transition-colors"
                                        >
                                            <FaTrash className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div
                                className={`p-6 border-2 ${
                                    dragActive.thumbnail ? "border-purple-500 bg-purple-50" : "border-gray-300"
                                } border-dashed rounded-lg text-center`}
                                onDragEnter={(e) => handleDrag(e, "thumbnail")}
                                onDragLeave={(e) => handleDrag(e, "thumbnail")}
                                onDragOver={(e) => handleDrag(e, "thumbnail")}
                                onDrop={(e) => handleDrop(e, "thumbnail")}
                            >
                                <FaImage className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="mt-4">
                                    <label className="cursor-pointer text-purple-600 hover:text-purple-700 font-semibold">
                                        <span>Chọn ảnh</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, "thumbnail")}
                                            className="hidden"
                                        />
                                    </label>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Kéo thả ảnh hoặc nhấp để chọn (không bắt buộc)
                                    </p>
                                </div>
                                {previewUrl && (
                                    <div className="mt-4 relative group">
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="mx-auto h-40 w-auto rounded-lg object-cover shadow-sm"
                                        />
                                        <button
                                            onClick={() => clearFile("thumbnail")}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm"
                                        >
                                            <FaTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex space-x-4">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                                >
                                    Quay lại
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                                        loading ? "bg-purple-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
                                    }`}
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center">
                                            <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                />
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                />
                                            </svg>
                                            Đang tải...
                                        </div>
                                    ) : (
                                        "Tải lên"
                                    )}
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Sidebar with Instructions */}
            <div className="w-80 ml-6">
                <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
                    <div className="flex items-center text-blue-600 mb-4">
                        <FaCloudUploadAlt className="w-5 h-5 mr-2" />
                        <h3 className="text-lg font-semibold">Hướng dẫn upload</h3>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">Yêu cầu tài liệu</h4>
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li className="flex items-start">
                                    <span className="text-blue-500 mr-2">•</span>
                                    Định dạng: Chỉ chấp nhận file PDF
                                </li>
                                <li className="flex items-start">
                                    <span className="text-blue-500 mr-2">•</span>
                                    Dung lượng: Tối đa 20MB/tài liệu
                                </li>
                                <li className="flex items-start">
                                    <span className="text-blue-500 mr-2">•</span>
                                    Font chữ: Khuyến khích sử dụng Unicode
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">Quy định nội dung</h4>
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li className="flex items-start">
                                    <span className="text-blue-500 mr-2">•</span>
                                    Tài liệu phải đảm bảo tính học thuật và chuyên môn
                                </li>
                                <li className="flex items-start">
                                    <span className="text-blue-500 mr-2">•</span>
                                    Không vi phạm bản quyền và sở hữu trí tuệ
                                </li>
                                <li className="flex items-start">
                                    <span className="text-blue-500 mr-2">•</span>
                                    Không chứa nội dung vi phạm pháp luật
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center text-purple-600 mb-4">
                        <FaShieldAlt className="w-5 h-5 mr-2" />
                        <h3 className="text-lg font-semibold">Chính sách & Quyền riêng tư</h3>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">Quyền sở hữu</h4>
                            <p className="text-sm text-gray-600">
                                Bạn vẫn giữ toàn bộ quyền sở hữu đối với tài liệu của mình. Bằng việc upload, bạn cấp cho chúng tôi quyền lưu trữ và phân phối tài liệu theo điều khoản sử dụng.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">Bảo mật</h4>
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li className="flex items-start">
                                    <span className="text-purple-500 mr-2">•</span>
                                    Tài liệu được mã hóa và lưu trữ an toàn
                                </li>
                                <li className="flex items-start">
                                    <span className="text-purple-500 mr-2">•</span>
                                    Kiểm soát quyền truy cập và chia sẻ
                                </li>
                                <li className="flex items-start">
                                    <span className="text-purple-500 mr-2">•</span>
                                    Bảo vệ thông tin cá nhân theo GDPR
                                </li>
                            </ul>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <p className="text-xs text-gray-500">
                                Bằng việc upload tài liệu, bạn đồng ý với{" "}
                                <a href="#" className="text-purple-600 hover:text-purple-700">
                                    Điều khoản sử dụng
                                </a>{" "}
                                và{" "}
                                <a href="#" className="text-purple-600 hover:text-purple-700">
                                    Chính sách quyền riêng tư
                                </a>{" "}
                                của chúng tôi.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}   