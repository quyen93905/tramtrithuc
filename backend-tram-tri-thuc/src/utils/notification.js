// utils/notification.js
const Notification = require("../models/notification.model");
const Document = require("../models/document.model");
const User = require("../models/user.model");
const logger = require("./logger");

/**
 * Gửi thông báo đến người dùng
 * @param {Object} params
 * @param {String} params.userId - ID người nhận thông báo
 * @param {String} params.type - Loại thông báo (new_comment, document_approved, new_rating, system)
 * @param {String} params.message - Nội dung thông báo
 * @param {String} params.link - Link liên kết
 */
const sendNotification = async ({ userId, type, message, link }) => {
    try {
        const notification = new Notification({
            userId,
            type,
            message,
            link,
            isRead: false,
        });
        await notification.save();
        logger.info(`Notification sent to user ${userId}: ${message}`);
    } catch (error) {
        logger.error(`Send notification error: ${error.message}`);
        throw error; // Ném lỗi để controller xử lý
    }
};

/**
 * Gửi thông báo cho chủ sở hữu tài liệu
 * @param {Object} params
 * @param {String} params.documentId - ID tài liệu
 * @param {String} params.actionUserId - ID người thực hiện hành động (để tránh gửi thông báo cho chính họ)
 * @param {String} params.type - Loại thông báo
 * @param {String} params.actionUserName - Tên người thực hiện hành động
 */
const notifyDocumentOwner = async ({ documentId, actionUserId, type, actionUserName }) => {
    try {
        // Lấy thông tin tài liệu và chủ sở hữu
        const document = await Document.findById(documentId).select("uploaderId title slug");
        if (!document) {
            throw new Error("Tài liệu không tồn tại");
        }

        // Kiểm tra nếu actionUserId là chính uploader thì không gửi thông báo
        if (document.uploaderId.toString() === actionUserId.toString()) {
            return;
        }

        // Tạo link dựa trên loại thông báo
        let link;
        switch (type) {
            case "document_approved":
                link = `${process.env.CLIENT_URL}/documents/${document.slug}`;
                break;
            case "new_rating":
                link = `${process.env.CLIENT_URL}/documents/${document.slug}#ratings`;
                break;
            case "new_comment":
                link = `${process.env.CLIENT_URL}/documents/${document.slug}#comments`;
                break;
            default:
                throw new Error("Loại thông báo không hợp lệ");
        }

        // Tạo nội dung thông báo
        let message;
        switch (type) {
            case "document_approved":
                message = `Tài liệu "${document.title}" của bạn đã được duyệt thành công.`;
                break;
            case "new_rating":
                message = `Người dùng ${actionUserName} vừa đánh giá tài liệu "${document.title}" của bạn.`;
                break;
            case "new_comment":
                message = `Người dùng ${actionUserName} vừa bình luận vào tài liệu "${document.title}" của bạn.`;
                break;
        }

        // Gửi thông báo
        await sendNotification({
            userId: document.uploaderId,
            type,
            message,
            link,
        });
    } catch (error) {
        logger.error(`Notify document owner error: ${error.message}`);
        throw error;
    }
};

module.exports = { sendNotification, notifyDocumentOwner };
