const logger = require("../utils/logger");

const isUploader = (req, res, next) => {
    if (!req.user?.role) {
        logger.error("Role not found in req.user", { user: req.user });
        return res.status(400).json({
            success: false,
            message: "Không tìm thấy vai trò người dùng.",
        });
    }
    if (["uploader", "admin"].includes(req.user.role)) {
        return next();
    }
    logger.warn("Access denied for non-uploader user", { user: req.user });
    return res.status(403).json({
        success: false,
        message: "Yêu cầu quyền uploader hoặc admin.",
    });
};

module.exports = isUploader;
