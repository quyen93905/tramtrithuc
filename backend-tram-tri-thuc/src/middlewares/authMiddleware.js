const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const logger = require("../utils/logger");
const { Types } = require("mongoose");

if (!process.env.JWT_SECRET) {
    throw new Error("Thiếu JWT_SECRET trong biến môi trường");
}

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Không có token. Vui lòng đăng nhập.",
            });
        }

        const token = authHeader.replace("Bearer ", "");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!Types.ObjectId.isValid(decoded.id)) {
            logger.error("Invalid user ID in token", { id: decoded.id });
            return res.status(400).json({
                success: false,
                message: "ID người dùng không hợp lệ trong token.",
            });
        }

        const user = await User.findById(decoded.id).select("_id email role isActive");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Tài khoản không tồn tại.",
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Tài khoản của bạn đã bị vô hiệu hóa.",
            });
        }

        req.user = { _id: user._id, email: user.email, role: user.role };
        next();
    } catch (error) {
        logger.error("Authentication error", {
            error: error.message,
            url: req.originalUrl,
            ip: req.ip,
            userAgent: req.headers["user-agent"],
        });

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token đã hết hạn.",
            });
        }

        return res.status(401).json({
            success: false,
            message: "Token không hợp lệ.",
        });
    }
};

module.exports = authMiddleware;
