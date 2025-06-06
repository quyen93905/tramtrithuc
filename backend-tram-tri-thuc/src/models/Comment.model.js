const mongoose = require("mongoose");
const { Schema } = mongoose;

const commentSchema = new Schema(
    {
        documentId: { type: Schema.Types.ObjectId, ref: "Document", required: true }, // Tham chiếu đến tài liệu
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Tham chiếu đến người dùng
        content: { type: String, required: true }, // Nội dung bình luận
        isDeleted: { type: Boolean, default: false }, // Trạng thái đã xóa
        isEdited: { type: Boolean, default: false }, // Trạng thái đã chỉnh sửa
        parentCommentId: { type: Schema.Types.ObjectId, ref: "Comment", required: false }, // ID bình luận cha (nếu có)
        isReported: { type: Boolean, default: false }, // Trạng thái đã báo cáo (tùy chọn mở rộng)
    },
    { timestamps: true }
);

// Tối ưu query lấy bình luận
commentSchema.index({ documentId: 1, isReported: 1, isDeleted: 1, createdAt: -1 });
commentSchema.index({ parentCommentId: 1 });

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
