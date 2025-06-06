// frontend/src/components/Document/CommentItem.jsx
import { useState } from "react";
import { format } from "date-fns";
import ReplyForm from "./ReplyForm";

const CommentItem = ({ comment, documentId, userId, onUpdate, onDelete, onReport, onReply }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [showReplyForm, setShowReplyForm] = useState(false);

    const handleSubmitEdit = (e) => {
        e.preventDefault();
        if (!editContent.trim()) return;
        onUpdate(comment._id, editContent);
        setIsEditing(false);
    };

    return (
        <div className="border-b py-3">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-semibold">{comment.user.name}</p>
                    <p className="text-gray-700">{comment.content}</p>
                    <p className="text-xs text-gray-500">
                        {format(new Date(comment.createdAt), "dd/MM/yyyy HH:mm")}{" "}
                        {comment.isEdited && "(đã chỉnh sửa)"}
                    </p>
                </div>
                {userId && (
                    <div className="flex gap-2">
                        {userId === comment.userId && (
                            <>
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="text-blue-600 hover:underline text-sm"
                                >
                                    {isEditing ? "Hủy" : "Sửa"}
                                </button>
                                <button
                                    onClick={() => onDelete(comment._id)}
                                    className="text-red-600 hover:underline text-sm"
                                >
                                    Xóa
                                </button>
                            </>
                        )}
                        {!comment.isReported && (
                            <button
                                onClick={() => onReport(comment._id)}
                                className="text-orange-600 hover:underline text-sm"
                            >
                                Báo cáo
                            </button>
                        )}
                        <button
                            onClick={() => setShowReplyForm(!showReplyForm)}
                            className="text-blue-600 hover:underline text-sm"
                        >
                            Trả lời
                        </button>
                    </div>
                )}
            </div>
            {isEditing && (
                <form onSubmit={handleSubmitEdit} className="mt-2">
                    <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full p-2 border rounded"
                        rows="2"
                    />
                    <button
                        type="submit"
                        className="mt-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                        Lưu
                    </button>
                </form>
            )}
            {showReplyForm && (
                <ReplyForm
                    onSubmit={(content) => {
                        onReply(content, comment._id);
                        setShowReplyForm(false);
                    }}
                    onCancel={() => setShowReplyForm(false)}
                />
            )}
            {comment.replies?.length > 0 && (
                <div className="ml-6 mt-2">
                    {comment.replies.map((reply) => (
                        <CommentItem
                            key={reply._id}
                            comment={reply}
                            documentId={documentId}
                            userId={userId}
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                            onReport={onReport}
                            onReply={onReply}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommentItem;
