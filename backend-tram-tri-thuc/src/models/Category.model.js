const mongoose = require("mongoose");
const { Schema } = mongoose;

const categorySchema = new Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 100 },
        slug: { type: String, required: true, unique: true, match: /^[a-z0-9-]+$/ },
        description: { type: String, maxlength: 500 },
    },
    { timestamps: true }
);

categorySchema.index({ slug: 1 });

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
