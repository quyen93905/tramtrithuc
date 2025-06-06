const Notification = require("../models/notification.model");
const User = require("../models/user.model");
const logger = require("../utils/logger");
const { getPagination, getPagingData } = require("../utils/paginate");

exports.createNotification = async (req, res) => {
    try {
        const { userId, type, message, link } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Người dùng không tồn tại.",
            });
        }

        const notification = new Notification({
            userId,
            type,
            message,
            link,
        });

        await notification.save();

        // Gửi thông báo qua WebSocket tới userId
        req.io.to(userId).emit("newNotification", notification);
        logger.info(`Notification created for user ${userId}, type: ${type}`);

        res.status(201).json({
            success: true,
            message: "Gửi thông báo thành công.",
            data: notification,
        });
    } catch (error) {
        logger.error(`Create notification error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Không thể gửi thông báo.",
        });
    }
};

exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const { page, limit, skip } = getPagination(req.query);
        const unreadOnly = req.query.unreadOnly ? JSON.parse(req.query.unreadOnly) : undefined;
        const sort = req.query.sort || "-createdAt";

        const query = { userId };
        if (unreadOnly) query.isRead = false;

        const notifications = await Notification.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Notification.countDocuments(query);
        const pagingData = getPagingData(notifications, total, page, limit);

        res.status(200).json({
            success: true,
            data: pagingData,
        });
    } catch (error) {
        logger.error(`Get notifications error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Không thể lấy danh sách thông báo.",
        });
    }
};

exports.markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const notification = await Notification.findById(id);
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Thông báo không tồn tại.",
            });
        }

        if (notification.userId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Bạn không có quyền cập nhật thông báo này.",
            });
        }

        notification.isRead = true;
        await notification.save();

        logger.info(`Notification ${id} marked as read by user ${userId}`);
        res.status(200).json({
            success: true,
            message: "Đánh dấu thông báo đã đọc.",
            data: notification,
        });
    } catch (error) {
        logger.error(`Mark notification read error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Không thể đánh dấu thông báo đã đọc.",
        });
    }
};

exports.markAsUnread = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const notification = await Notification.findOneAndUpdate(
            { _id: id, userId },
            { isRead: false, updatedAt: new Date() },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Thông báo không tồn tại hoặc bạn không có quyền.",
            });
        }

        logger.info(`Notification ${id} marked as unread by user ${userId}`);
        return res.status(200).json({
            success: true,
            message: "Đánh dấu thông báo chưa đọc.",
            data: notification,
        });
    } catch (error) {
        logger.error("Error marking notification as unread:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi đánh dấu thông báo chưa đọc.",
        });
    }
};

exports.markAllNotificationsAsRead = async (req, res) => {
    try {
        const userId = req.user._id;

        await Notification.updateMany({ userId, isRead: false }, { $set: { isRead: true } });

        logger.info(`All notifications marked as read for user ${userId}`);
        res.status(200).json({
            success: true,
            message: "Đánh dấu tất cả thông báo đã đọc.",
        });
    } catch (error) {
        logger.error(`Mark all notifications read error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Không thể đánh dấu tất cả thông báo đã đọc.",
        });
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const notification = await Notification.findById(id);
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Thông báo không tồn tại.",
            });
        }

        if (notification.userId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Bạn không có quyền xóa thông báo này.",
            });
        }

        await notification.deleteOne();
        logger.info(`Notification ${id} deleted by user ${userId}`);
        res.status(200).json({
            success: true,
            message: "Xóa thông báo thành công.",
        });
    } catch (error) {
        logger.error(`Delete notification error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Không thể xóa thông báo.",
        });
    }
};

exports.deleteAllNotifications = async (req, res) => {
    try {
        const userId = req.user._id;

        await Notification.deleteMany({ userId });
        logger.info(`All notifications deleted for user ${userId}`);
        res.status(200).json({
            success: true,
            message: "Xóa tất cả thông báo thành công.",
        });
    } catch (error) {
        logger.error(`Delete all notifications error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Không thể xóa tất cả thông báo.",
        });
    }
};
