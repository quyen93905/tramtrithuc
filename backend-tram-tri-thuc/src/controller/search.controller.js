const Document = require("../models/document.model");

// /api/search?keyword=python
exports.searchDocuments = async (req, res) => {
    const { keyword } = req.query;

    try {
        const result = await Document.find({
            $text: { $search: keyword },
            deleted: false,
        });

        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// /api/filter?category=AI&tags=deep-learning,ML&type=file&minSize=1000&maxSize=200000
exports.filterDocuments = async (req, res) => {
    const { category, tags, type, minSize, maxSize, startDate, endDate } = req.query;

    let filter = { deleted: false };

    if (category) filter.category = category;
    if (type) filter.type = type;
    if (tags) filter.tags = { $in: tags.split(",") };
    if (minSize || maxSize) {
        filter.size = {};
        if (minSize) filter.size.$gte = parseInt(minSize);
        if (maxSize) filter.size.$lte = parseInt(maxSize);
    }
    if (startDate || endDate) {
        filter.uploadDate = {};
        if (startDate) filter.uploadDate.$gte = new Date(startDate);
        if (endDate) filter.uploadDate.$lte = new Date(endDate);
    }

    try {
        const result = await Document.find(filter).sort({ uploadDate: -1 });
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
