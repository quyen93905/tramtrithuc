const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        documentId: { type: mongoose.Schema.Types.ObjectId, ref: "Document", required: true },
        favoritedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// Đảm bảo mỗi user chỉ yêu thích một tài liệu một lần
favoriteSchema.index({ userId: 1, documentId: 1 }, { unique: true });

const Favorite = mongoose.models.Favorite || mongoose.model("Favorite", favoriteSchema);
module.exports = Favorite;
