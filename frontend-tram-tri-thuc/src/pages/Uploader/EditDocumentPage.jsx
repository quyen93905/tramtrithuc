import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearError, fetchDocumentById } from "../../store/slices/documentSlice";
import showToast from "../../utils/toast";
import EditDocumentForm from "../../components/Uploader/EditDocumentForm";

const EditDocumentPage = () => {
    const { documentId } = useParams(); // Lấy document ID từ URL
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentDocument, loading, error } = useSelector((state) => state.documents);

    // Lấy tài liệu khi component mount
    useEffect(() => {
        // Kiểm tra documentId
        if (!documentId || documentId === "undefined") {
            showToast("error", "ID tài liệu không hợp lệ.");
            navigate("/uploader/my-documents");
            return;
        }
        // Kiểm tra định dạng MongoId đơn giản
        if (!/^[0-9a-fA-F]{24}$/.test(documentId)) {
            showToast("error", "Định dạng ID tài liệu không hợp lệ.");
            navigate("/uploader/my-documents");
            return;
        }

        dispatch(fetchDocumentById(documentId))
            .unwrap()
            .catch((err) => {
                showToast("error", err.message || "Không thể lấy thông tin tài liệu.");
            });

        return () => dispatch(clearError());
    }, [dispatch, documentId, navigate]);

    // Xử lý lỗi
    useEffect(() => {
        if (error && !loading) {
            showToast("error", error);
            dispatch(clearError());
            navigate("/uploader/my-documents");
        }
    }, [error, dispatch, loading, navigate]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
            </div>
        );
    }

    if (!currentDocument || currentDocument._id !== documentId) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">
                    Tài liệu không tồn tại hoặc bạn không có quyền truy cập.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Chỉnh sửa tài liệu</h1>
            <EditDocumentForm
                document={currentDocument}
                onSuccess={() => navigate("/uploader/my-documents")}
            />
        </div>
    );
};

export default EditDocumentPage;
