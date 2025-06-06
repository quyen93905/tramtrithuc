const mongoose = require("mongoose");

const downloadHistorySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        documentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Document",
            required: true,
        },
        downloadedAt: {
            type: Date,
            default: Date.now,
        },
        ipAddress: {
            type: String,
            required: true,
        },
        deviceInfo: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
        collection: "downloadHistory",
    }
);

downloadHistorySchema.index({ userId: 1, documentId: 1 });
downloadHistorySchema.index({ downloadedAt: -1 });

const Download = mongoose.models.Download || mongoose.model("Download", downloadHistorySchema);

module.exports = Download;
