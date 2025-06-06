const mongoose = require("mongoose");
const { Schema } = mongoose;

const notificationSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            enum: ["new_comment", "document_approved", "new_rating", "system"],
            required: true,
        }, // Loại thông báo
        message: {
            type: String,
            required: true,
            trim: true,
        },
        link: {
            type: String,
            required: false,
        }, // Đường dẫn liên kết (nếu có)
        isRead: {
            type: Boolean,
            default: false,
        }, // Trạng thái đã đọc
    },
    { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ isRead: 1 });

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
