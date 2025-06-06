const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { commentLimiter } = require("../middlewares/rateLimit");
const validate = require("../middlewares/validate");
const { param, body, query } = require("express-validator");
const {
    getRatingsByDocument,
    createOrUpdateRating,
    getAverageRating,
    deleteRating,
    getCommentsByDocument,
    createComment,
    updateComment,
    deleteComment,
    reportComment,
    getRatingDistribution,
} = require("../controller/ratingComment.controller");

// Ratings: Lấy danh sách đánh giá của tài liệu
router.get(
    "/ratings/:documentId",
    [
        param("documentId").isMongoId().withMessage("ID tài liệu không hợp lệ"),
        query("minScore")
            .optional()
            .isInt({ min: 1, max: 5 })
            .withMessage("Số sao tối thiểu phải từ 1 đến 5"),
        query("maxScore")
            .optional()
            .isInt({ min: 1, max: 5 })
            .withMessage("Số sao tối đa phải từ 1 đến 5"),
        query("dateFrom").optional().isISO8601().toDate().withMessage("Ngày bắt đầu không hợp lệ"),
        query("dateTo").optional().isISO8601().toDate().withMessage("Ngày kết thúc không hợp lệ"),
        query("sortBy")
            .optional()
            .isIn(["createdAt", "score"])
            .withMessage("Sắp xếp chỉ hỗ trợ createdAt hoặc score"),
        query("sortOrder")
            .optional()
            .isIn(["asc", "desc"])
            .withMessage("Thứ tự sắp xếp chỉ hỗ trợ asc hoặc desc"),
        validate,
    ],
    getRatingsByDocument
);

// Ratings: Lấy điểm trung bình đánh giá
router.get(
    "/ratings/:documentId/average",
    [param("documentId").isMongoId().withMessage("ID tài liệu không hợp lệ"), validate],
    getAverageRating
);

// Ratings: Lấy phân phối đánh giá
router.get(
    "/ratings/:documentId/distribution",
    [param("documentId").isMongoId().withMessage("ID tài liệu không hợp lệ"), validate],
    getRatingDistribution
);

// Ratings: Tạo hoặc cập nhật đánh giá
router.post(
    "/ratings/:documentId",
    authMiddleware,
    commentLimiter,
    [
        param("documentId").isMongoId().withMessage("ID tài liệu không hợp lệ"),
        body("score").isInt({ min: 1, max: 5 }).withMessage("Số sao phải từ 1 đến 5"),
        body("review")
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage("Nhận xét tối đa 500 ký tự"),
        validate,
    ],
    createOrUpdateRating
);

// Ratings: Xóa đánh giá
router.delete(
    "/ratings/:documentId",
    authMiddleware,
    [param("documentId").isMongoId().withMessage("ID tài liệu không hợp lệ"), validate],
    deleteRating
);

// Comments: Lấy danh sách bình luận của tài liệu
router.get(
    "/comments/:documentId",
    [param("documentId").isMongoId().withMessage("ID tài liệu không hợp lệ"), validate],
    getCommentsByDocument
);

// Comments: Tạo bình luận
router.post(
    "/comments/:documentId",
    authMiddleware,
    commentLimiter,
    [
        param("documentId").isMongoId().withMessage("ID tài liệu không hợp lệ"),
        body("content")
            .notEmpty()
            .trim()
            .isLength({ max: 500 })
            .withMessage("Bình luận không được rỗng và tối đa 500 ký tự"),
        body("parentCommentId").optional().isMongoId().withMessage("ID bình luận cha không hợp lệ"),
        validate,
    ],
    createComment
);

// Comments: Cập nhật bình luận
router.put(
    "/comments/:commentId",
    authMiddleware,
    commentLimiter,
    [
        param("commentId").isMongoId().withMessage("ID bình luận không hợp lệ"),
        body("content")
            .notEmpty()
            .trim()
            .isLength({ max: 500 })
            .withMessage("Bình luận không được rỗng và tối đa 500 ký tự"),
        validate,
    ],
    updateComment
);

// Comments: Xóa bình luận
router.delete(
    "/comments/:commentId",
    authMiddleware,
    [param("commentId").isMongoId().withMessage("ID bình luận không hợp lệ"), validate],
    deleteComment
);

// Comments: Báo cáo bình luận vi phạm
router.post(
    "/comments/:commentId/report",
    authMiddleware,
    commentLimiter,
    [param("commentId").isMongoId().withMessage("ID bình luận không hợp lệ"), validate],
    reportComment
);

module.exports = router;
