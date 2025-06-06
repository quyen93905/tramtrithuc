import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchCommentsByDocument,
    createComment,
    updateComment,
    deleteComment,
    reportComment,
    retryCommentAction,
    clearCommentError,
} from "../../store/slices/commentSlice";
import showToast from "../../utils/toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function CommentSection({ documentId }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { comments, loading, error, currentPage, totalPages } = useSelector(
        (state) => state.comments
    );
    const { userInfo } = useSelector((state) => state.user);
    const [newComment, setNewComment] = useState("");
    const [replyContent, setReplyContent] = useState({});
    const [editingComment, setEditingComment] = useState(null);
    const [editContent, setEditContent] = useState("");

    // Lấy danh sách bình luận khi component mount hoặc documentId thay đổi
    useEffect(() => {
        if (documentId) {
            dispatch(fetchCommentsByDocument({ documentId, params: { page: currentPage } }));
        }
        return () => {
            dispatch(clearCommentError());
        };
    }, [dispatch, documentId, currentPage]);

    // Xử lý lỗi
    useEffect(() => {
        if (error) {
            showToast("error", error.message);
        }
    }, [error]);

    // Gửi bình luận mới
    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) {
            showToast("error", "Bình luận không được để trống.");
            return;
        }
        if (newComment.length > 500) {
            showToast("error", "Bình luận không được vượt quá 500 ký tự.");
            return;
        }
        if (!userInfo) {
            showToast("error", "Vui lòng đăng nhập để bình luận.");
            return;
        }
        if (!localStorage.getItem("token")) {
            showToast("error", "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
            dispatch({ type: "user/logout" });
            navigate("/auth/login");
            return;
        }

        try {
            console.log("Sending comment:", newComment);
            await dispatch(createComment({ documentId, content: newComment })).unwrap();
            setNewComment("");
        } catch (err) {
            // Lỗi đã được xử lý trong thunk và showToast
        }
    };

    // Gửi phản hồi (reply)
    const handleReply = async (parentCommentId) => {
        const content = replyContent[parentCommentId]?.trim();
        if (!content) {
            showToast("error", "Phản hồi không được để trống.");
            return;
        }
        if (!userInfo) {
            showToast("error", "Vui lòng đăng nhập để phản hồi.");
            return;
        }

        try {
            await dispatch(createComment({ documentId, content, parentCommentId })).unwrap();
            setReplyContent((prev) => ({ ...prev, [parentCommentId]: "" }));
        } catch (err) {
            // Lỗi đã được xử lý trong thunk và showToast
        }
    };

    // Cập nhật bình luận
    const handleUpdateComment = async (commentId) => {
        if (!editContent.trim()) {
            showToast("error", "Bình luận không được để trống.");
            return;
        }
        try {
            await dispatch(updateComment({ commentId, content: editContent })).unwrap();
            setEditingComment(null);
            setEditContent("");
        } catch (err) {
            // Lỗi đã được xử lý trong thunk và showToast
        }
    };

    // Xóa bình luận
    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Bạn có chắc muốn xóa bình luận này?")) return;
        try {
            await dispatch(deleteComment(commentId)).unwrap();
        } catch (err) {
            // Lỗi đã được xử lý trong thunk và showToast
        }
    };

    // Báo cáo bình luận
    const handleReportComment = async (commentId) => {
        if (!window.confirm("Bạn có muốn báo cáo bình luận này vì vi phạm?")) return;
        try {
            await dispatch(reportComment(commentId)).unwrap();
        } catch (err) {
            // Lỗi đã được xử lý trong thunk và showToast
        }
    };

    // Retry khi gặp lỗi
    const handleRetry = () => {
        dispatch(
            retryCommentAction({
                action: fetchCommentsByDocument,
                payload: { documentId, params: { page: currentPage } },
            })
        );
    };

    // Render bình luận và replies
    const renderComment = (comment, level = 0) => {
        const canEditOrDelete =
            userInfo && (userInfo._id === comment.userId || userInfo.role === "admin");

        return (
            <CommentItem
                key={comment._id}
                comment={comment}
                level={level}
                userInfo={userInfo}
                setReplyContent={setReplyContent}
                replyContent={replyContent}
                handleReply={handleReply}
                editingComment={editingComment}
                setEditingComment={setEditingComment}
                setEditContent={setEditContent}
                handleUpdateComment={handleUpdateComment}
                handleDeleteComment={handleDeleteComment}
                handleReportComment={handleReportComment}
                canEditOrDelete={canEditOrDelete}
                navigate={navigate}
                renderComment={renderComment}
            />
        );
    };

    if (loading) {
        return <p className="text-center">Đang tải bình luận...</p>;
    }

    if (error) {
        return (
            <div className="text-center">
                <p className="text-red-500">{error.message}</p>
                <button
                    onClick={handleRetry}
                    className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto p-4"
        >
            <div className="max-w-4xl mx-auto">
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-gray-800">Bình luận</h3>
                    </div>

                    {/* New Comment Input */}
                    <div className="mb-8 p-6 bg-white rounded-2xl shadow-md border border-gray-100">
                        <h4 className="text-xl font-semibold text-gray-800 mb-4">Để lại bình luận của bạn</h4>
                        <form onSubmit={handleAddComment} className="space-y-4">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Viết bình luận của bạn..."
                                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 resize-y min-h-[100px] shadow-sm"
                                rows="3"
                                disabled={!userInfo}
                            ></textarea>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all duration-300 shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!userInfo || loading}
                            >
                                Gửi bình luận
                            </button>
                        </form>
                        {!userInfo && (
                            <p className="text-sm text-gray-500 mt-3 text-center">
                                Vui lòng <span className="text-blue-600 cursor-pointer hover:underline" onClick={() => navigate("/auth/login")}>đăng nhập</span> để bình luận.
                            </p>
                        )}
                    </div>
                    {/* Comments List */}
                    <div className="space-y-6">
                        {comments.length > 0 ? (
                            comments.map((comment) => renderComment(comment))
                        ) : (
                            <p className="text-center text-gray-500">Chưa có bình luận nào.</p>
                        )}
                        {totalPages > 1 && (
                            <div className="flex justify-center mt-6">
                                {/* Pagination (implement if needed) */}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

const CommentItem = ({ comment, renderComment, level, userInfo, setReplyContent, replyContent, handleReply, editingComment, setEditingComment, setEditContent, handleUpdateComment, handleDeleteComment, handleReportComment, canEditOrDelete, navigate }) => {
    const isEditing = editingComment === comment._id;
    return (
        <div
            key={comment._id}
            className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 transition-all duration-300 ease-in-out ${level > 0 ? "ml-8 mt-4" : ""} hover:shadow-md`}
        >
            {isEditing ? (
                <div>
                    <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all duration-200 resize-y min-h-[80px]"
                        rows="2"
                    />
                    <div className="flex gap-3 mt-3 justify-end">
                        <button
                            onClick={() => handleUpdateComment(comment._id)}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200 text-sm font-medium shadow-md"
                        >
                            Lưu
                        </button>
                        <button
                            onClick={() => setEditingComment(null)}
                            className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors duration-200 text-sm font-medium shadow-md"
                        >
                            Hủy
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex items-center mb-2">
                        <div>
                            <strong className="text-gray-900 font-semibold">{comment.user?.name || "Ẩn danh"}</strong>
                            <p className="text-xs text-gray-500">
                                {new Date(comment.createdAt).toLocaleString('vi-VN')}
                                {comment.isEdited && <span className="ml-1 text-gray-400">(Đã chỉnh sửa)</span>}
                                {comment.isReported && <span className="ml-1 text-red-500 font-medium">(Đã báo cáo)</span>}
                            </p>
                        </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-3">{comment.content}</p>
                    {userInfo && (
                        <div className="flex gap-2 items-center text-sm mt-3 pt-3 border-t border-gray-100">
                            <button
                                onClick={() =>
                                    setReplyContent((prev) => ({
                                        ...prev,
                                        [comment._id]: prev[comment._id] === undefined ? "" : undefined,
                                    }))
                                }
                                className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>Phản hồi</span>
                            </button>
                            {canEditOrDelete && (
                                <>
                                    <button
                                        onClick={() => {
                                            setEditingComment(comment._id);
                                            setEditContent(comment.content);
                                        }}
                                        className="flex items-center space-x-1 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors duration-200 font-medium"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-7.793 7.793-2.828-2.828 7.793-7.793zM5 10.793L10.793 5 13 7.207 7.207 13 5 10.793zM3 17V15h2v2H3z" />
                                        </svg>
                                        <span>Sửa</span>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteComment(comment._id)}
                                        className="flex items-center space-x-1 px-3 py-1 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors duration-200 font-medium"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                                        </svg>
                                        <span>Xóa</span>
                                    </button>
                                </>
                            )}
                            {!canEditOrDelete && (
                                <button
                                    onClick={() => handleReportComment(comment._id)}
                                    className={`flex items-center space-x-1 px-3 py-1 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors duration-200 font-medium ${comment.isReported ? "opacity-50 cursor-not-allowed" : ""}`}
                                    disabled={comment.isReported}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3.293 6.707a1 1 0 011.414 0L10 11.586l5.293-5.293a1 1 0 111.414 1.414L11.414 13l5.293 5.293a1 1 0 01-1.414 1.414L10 14.414l-5.293 5.293a1 1 0 01-1.414-1.414L8.586 13 3.293 7.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    <span>Báo cáo</span>
                                </button>
                            )}
                        </div>
                    )}
                    {replyContent[comment._id] !== undefined && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <textarea
                                value={replyContent[comment._id]}
                                onChange={(e) =>
                                    setReplyContent((prev) => ({
                                        ...prev,
                                        [comment._id]: e.target.value,
                                    }))
                                }
                                placeholder="Viết phản hồi của bạn..."
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 resize-y min-h-[80px]"
                                rows="2"
                            />
                            <div className="flex gap-3 mt-3 justify-end">
                                <button
                                    onClick={() => handleReply(comment._id)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium shadow-md"
                                >
                                    Gửi phản hồi
                                </button>
                                <button
                                    onClick={() => setReplyContent((prev) => ({ ...prev, [comment._id]: undefined }))}
                                    className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors duration-200 text-sm font-medium shadow-md"
                                >
                                    Hủy
                                </button>
                            </div>
                        </div>
                    )}
                    <div className="pl-6 border-l-2 border-gray-200 mt-4">
                        {comment.replies && comment.replies.map((reply) => renderComment(reply, level + 1))}
                    </div>
                </>
            )}
        </div>
    );
};
