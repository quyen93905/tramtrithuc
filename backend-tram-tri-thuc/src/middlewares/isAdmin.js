const logger = require("../utils/logger");

const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        logger.warn("Access denied for non-admin user", { user: req.user });
        return res.status(403).json({
            success: false,
            message: "Bạn không có quyền truy cập tài nguyên này. Chỉ dành cho admin.",
        });
    }
    next();
};

module.exports = isAdmin;
