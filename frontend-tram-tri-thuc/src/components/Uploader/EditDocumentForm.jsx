import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearError, updateDocument } from "../../store/slices/documentSlice";
import showToast from "../../utils/toast";
import { FaSave, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const EditDocumentForm = ({ document, onSuccess }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.documents);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        tags: [], // Mảng chuỗi
    });

    // Khởi tạo formData từ document
    useEffect(() => {
        if (document) {
            setFormData({
                title: document.title || "",
                description: document.description || "",
                tags: Array.isArray(document.tags) ? document.tags : [],
            });
        }
        return () => dispatch(clearError());
    }, [document, dispatch]);

    // Xử lý thay đổi input
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "tags") {
            // Chuyển chuỗi tags thành mảng, tách bằng dấu phẩy
            setFormData((prev) => ({
                ...prev,
                tags: value
                    ? value
                          .split(",")
                          .map((tag) => tag.trim())
                          .filter(Boolean)
                    : [],
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    // Xử lý submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await dispatch(
                updateDocument({
                    id: document._id,
                    data: {
                        title: formData.title,
                        description: formData.description,
                        tags: formData.tags,
                    },
                })
            ).unwrap();
            showToast("success", "Cập nhật tài liệu thành công!");
            if (onSuccess) onSuccess(); // Chuyển hướng về MyDocumentsPage
        } catch (err) {
            showToast("error", err.message || "Không thể cập nhật tài liệu.");
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6 max-w-xl mx-auto bg-white/80 p-6 rounded-lg shadow-lg"
        >
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}
            <div>
                <label className="block text-sm font-medium text-gray-700">Tiêu đề</label>
                <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Nhập tiêu đề"
                    className="mt-1 w-full p-3 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Nhập mô tả"
                    rows={4}
                    className="mt-1 w-full p-3 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Tags</label>
                <input
                    name="tags"
                    value={formData.tags.join(", ")}
                    onChange={handleChange}
                    placeholder="Nhập tags, cách nhau bằng dấu phẩy"
                    className="mt-1 w-full p-3 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                />
            </div>
            <div className="flex space-x-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 transition-colors"
                >
                    <FaSave className="mr-2" />
                    {loading ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
                <button
                    type="button"
                    onClick={() => navigate("/uploader/my-documents")}
                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                    <FaTimes className="mr-2" />
                    Hủy
                </button>
            </div>
        </form>
    );
};

export default EditDocumentForm;
