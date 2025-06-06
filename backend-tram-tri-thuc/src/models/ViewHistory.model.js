const mongoose = require("mongoose");
const { Schema } = mongoose;

const viewHistorySchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        documentId: {
            type: Schema.Types.ObjectId,
            ref: "Document",
            required: true,
        },
        viewedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
        collection: "viewHistory",
    }
);

viewHistorySchema.index({ userId: 1, documentId: 1 }, { unique: true });
viewHistorySchema.index({ viewedAt: -1 });

const ViewHistory = mongoose.models.ViewHistory || mongoose.model("ViewHistory", viewHistorySchema);

module.exports = ViewHistory;
