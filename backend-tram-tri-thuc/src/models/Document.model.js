const mongoose = require("mongoose");
const { Schema } = mongoose;

const documentSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true, maxlength: 200 },
        description: { type: String, maxlength: 1000 },
        fileUrl: { type: String, required: true },
        fileName: { type: String, required: true },
        mimeType: {
            type: String,
            required: true,
            enum: [
                "application/pdf",
                "image/jpeg",
                "image/png",
                "image/gif",
                "image/webp",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/vnd.ms-excel",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/vnd.ms-powerpoint",
                "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                "video/mp4",
                "video/webm",
                "audio/mpeg",
                "audio/wav",
                "text/plain",
                "application/zip",
                "application/x-rar-compressed",
            ],
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        format: { type: String, required: true },
        size: { type: Number, required: true },
        slug: { type: String, required: true, unique: true },
        thumbnailUrl: { type: String },
        tags: [{ type: String, trim: true, maxlength: 50 }],
        uploaderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
        isPublic: { type: Boolean, default: true },
        isFeatured: { type: Boolean, default: false },
        viewCount: { type: Number, default: 0 },
        downloadCount: { type: Number, default: 0 },
        favoriteCount: { type: Number, default: 0, min: 0 },
    },
    { timestamps: true }
);

documentSchema.index({ title: "text", slug: "text", description: "text", tags: "text" });
documentSchema.index({
    slug: 1,
    categoryId: 1,
    uploaderId: 1,
    status: 1,
    isPublic: 1,
    isFeatured: 1,
});

const Document = mongoose.models.Document || mongoose.model("Document", documentSchema);

module.exports = Document;
