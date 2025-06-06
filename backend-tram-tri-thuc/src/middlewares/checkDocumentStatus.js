const logger = require("../utils/logger");

const checkDocumentStatus = (req, res, next) => {
    if (!req.document) {
        return res.status(404).json({ success: false, message: "Tài liệu không tồn tại." });
    }
    // Cho phép admin hoặc uploader truy cập tài liệu chưa duyệt
    if (
        req.document.status === "approved" ||
        (req.user && (req.user.role === "admin" || req.document.uploaderId.equals(req.user._id)))
    ) {
        return next();
    }
    logger.warn("Access denied to unapproved document", {
        documentId: req.document._id,
        user: req.user,
    });
    return res.status(403).json({ success: false, message: "Tài liệu chưa được duyệt." });
};

module.exports = checkDocumentStatus;
