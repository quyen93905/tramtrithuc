const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validate");
const isAdmin = require("../middlewares/isAdmin");
const {
    createNotification,
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    deleteAllNotifications,
    broadcastNotification,
    markAsUnread,
} = require("../controller/notification.controller");
const { body, param, query } = require("express-validator");

// Tạo thông báo
router.post(
    "/notifications",
    authMiddleware,
    isAdmin,
    // notificationLimiter,
    [
        body("userId").isMongoId().withMessage("ID người dùng không hợp lệ"),
        body("type")
            .isIn([
                "new_comment",
                "document_approved",
                "new_rating",
                "system",
            ])
            .withMessage("Loại thông báo không hợp lệ"),
        body("message").notEmpty().trim().withMessage("Nội dung không được rỗng"),
        body("link").notEmpty().trim().withMessage("Link không được rỗng"),
        validate,
    ],
    createNotification
);

// Lấy danh sách thông báo của người dùng
router.get(
    "/notifications",
    authMiddleware,
    [
        query("unreadOnly").optional().isBoolean().withMessage("unreadOnly phải là boolean"),
        query("page").optional().isInt({ min: 1 }).withMessage("Trang phải là số nguyên dương"),
        query("limit").optional().isInt({ min: 1 }).withMessage("Giới hạn phải là số nguyên dương"),
        query("sort")
            .optional()
            .isIn(["createdAt", "-createdAt"])
            .withMessage("Sort phải là createdAt hoặc -createdAt"),
        validate,
    ],
    getNotifications
);

// Đánh dấu thông báo là đã đọc
router.patch(
    "/notifications/:id/read",
    authMiddleware,
    [param("id").isMongoId().withMessage("ID thông báo không hợp lệ"), validate],
    markNotificationAsRead
);

router.patch("/notifications/:id/unread", authMiddleware, markAsUnread);


// Đánh dấu tất cả thông báo là đã đọc
router.patch("/notifications/read-all", authMiddleware, markAllNotificationsAsRead);

// Xoá thông báo
router.delete(
    "/notifications/:id",
    authMiddleware,
    [param("id").isMongoId().withMessage("ID thông báo không hợp lệ"), validate],
    deleteNotification
);

// Xoá tất cả thông báo của người dùng
router.delete("/notifications", authMiddleware, deleteAllNotifications);


module.exports = router;
