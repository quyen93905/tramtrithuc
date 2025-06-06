const mongoose = require("mongoose");
const { Schema } = mongoose;

const ratingSchema = new Schema(
    {
        documentId: { type: Schema.Types.ObjectId, ref: "Document", required: true }, // Tham chiếu đến tài liệu
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Tham chiếu đến người dùng
        score: { type: Number, required: true, min: 1, max: 5 }, // Số sao (1 đến 5)
        review: { type: String, trim: true, maxLength: 500 },
    },
    {
        timestamps: true, // Tự động thêm trường createdAt và updatedAt
    }
);

// Đảm bảo mỗi user chỉ đánh giá một lần cho mỗi tài liệu
ratingSchema.index({ userId: 1, documentId: 1, score: 1 }, { unique: true });

// Tạo model Rating
const Rating = mongoose.models.Rating || mongoose.model("Rating", ratingSchema);

module.exports = Rating;
