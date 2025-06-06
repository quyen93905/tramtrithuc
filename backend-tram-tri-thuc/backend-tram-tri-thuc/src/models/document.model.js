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
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/zip",
      ],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    format: {
      type: String,
      enum: ["pdf", "docx", "pptx", "zip"],
      required: true,
    },
    size: { type: Number, required: true },
    slug: { type: String, required: true, unique: true },
    thumbnailUrl: { type: String },
    tags: [{ type: String, trim: true, maxlength: 50 }],

    isPublic: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    viewCount: { type: Number, default: 0 },
    downloadCount: { type: Number, default: 0 },
    favoriteCount: { type: Number, default: 0, min: 0 },
    uploaderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  { timestamps: true }
);

documentSchema.index({
  title: "text",
  slug: "text",
  description: "text",
  tags: "text",
});
documentSchema.index({
  slug: 1,
  categoryId: 1,
  uploaderId: 1,
  status: 1,
  isPublic: 1,
  isFeatured: 1,
});

const Document =
  mongoose.models.Document || mongoose.model("Document", documentSchema);

module.exports = Document;
