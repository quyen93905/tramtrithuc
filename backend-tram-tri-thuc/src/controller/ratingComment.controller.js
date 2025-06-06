const Rating = require("../models/rating.model");
const Comment = require("../models/comment.model");
const Document = require("../models/document.model");
const User = require("../models/user.model");
const logger = require("../utils/logger");
const { getPagination, getPagingData } = require("../utils/paginate");
const { notifyDocumentOwner } = require("../utils/notification");
const { Types } = require("mongoose");

// Lấy danh sách đánh giá của tài liệu
exports.getRatingsByDocument = async (req, res) => {
    try {
        const { documentId } = req.params;
        const { page, limit, skip } = getPagination(req.query);
        const {
            minScore,
            maxScore,
            dateFrom,
            dateTo,
            sortBy = "createdAt",
            sortOrder = "desc",
        } = req.query;

        // Kiểm tra tài liệu tồn tại và đã duyệt
        const document = await Document.findById(documentId);
        if (!document || document.status !== "approved") {
            return res.status(404).json({
                success: false,
                message: "Tài liệu không tồn tại hoặc chưa được duyệt.",
            });
        }

        // Xây dựng điều kiện lọc
        const matchConditions = { documentId: new Types.ObjectId(documentId) };
        if (minScore)
            matchConditions.score = { ...matchConditions.score, $gte: parseInt(minScore) };
        if (maxScore)
            matchConditions.score = { ...matchConditions.score, $lte: parseInt(maxScore) };
        if (dateFrom)
            matchConditions.createdAt = { ...matchConditions.createdAt, $gte: new Date(dateFrom) };
        if (dateTo)
            matchConditions.createdAt = { ...matchConditions.createdAt, $lte: new Date(dateTo) };

        // Lấy danh sách đánh giá
        const ratings = await Rating.aggregate([
            { $match: matchConditions },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user",
                },
            },
            { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    score: 1,
                    review: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    userId: 1,
                    user: {
                        _id: "$user._id",
                        name: "$user.name",
                        avatar: {
                            $ifNull: [
                                "$user.avatar",
                                { $toUpper: { $substrCP: ["$user.name", 0, 1] } },
                            ],
                        },
                    },
                },
            },
            { $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 } },
            { $skip: skip },
            { $limit: limit },
        ]);

        const total = await Rating.countDocuments(matchConditions);
        const pagingData = getPagingData(ratings, total, page, limit);

        res.status(200).json({ success: true, data: pagingData });
    } catch (error) {
        logger.error(`Get ratings error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Không thể lấy danh sách đánh giá.",
        });
    }
};

// Lấy điểm trung bình đánh giá của tài liệu
exports.getAverageRating = async (req, res) => {
    try {
        const { documentId } = req.params;

        const document = await Document.findById(documentId);
        if (!document || document.status !== "approved") {
            return res.status(404).json({
                success: false,
                message: "Tài liệu không tồn tại hoặc chưa được duyệt.",
            });
        }

        const avgRating = await Rating.aggregate([
            { $match: { documentId: new Types.ObjectId(documentId) } },
            { $group: { _id: null, avgScore: { $avg: "$score" }, totalRatings: { $sum: 1 } } },
        ]);

        const avgScore = avgRating.length > 0 ? parseFloat(avgRating[0].avgScore.toFixed(1)) : 0;
        const totalRatings = avgRating.length > 0 ? avgRating[0].totalRatings : 0;

        res.status(200).json({
            success: true,
            data: { avgScore, totalRatings },
        });
    } catch (error) {
        logger.error(`Get average rating error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Không thể lấy điểm trung bình đánh giá.",
        });
    }
};

// Lấy phân phối đánh giá của tài liệu
exports.getRatingDistribution = async (req, res) => {
    try {
        const { documentId } = req.params;

        const document = await Document.findById(documentId);
        if (!document || document.status !== "approved") {
            return res.status(404).json({
                success: false,
                message: "Tài liệu không tồn tại hoặc chưa được duyệt.",
            });
        }

        const distribution = await Rating.aggregate([
            { $match: { documentId: new Types.ObjectId(documentId) } },
            { $group: { _id: "$score", count: { $sum: 1 } } },
            { $sort: { _id: -1 } }, // Sắp xếp từ 5 sao xuống 1 sao
        ]);

        const totalRatings = distribution.reduce((sum, item) => sum + item.count, 0);
        const distributionData = [5, 4, 3, 2, 1].map((star) => {
            const item = distribution.find((d) => d._id === star) || { count: 0 };
            return {
                star,
                count: item.count,
                percentage: totalRatings > 0 ? ((item.count / totalRatings) * 100).toFixed(1) : 0,
            };
        });

        res.status(200).json({
            success: true,
            data: distributionData,
        });
    } catch (error) {
        logger.error(`Get rating distribution error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Không thể lấy phân phối đánh giá.",
        });
    }
};

// Tạo mới đánh giá
exports.createOrUpdateRating = async (req, res) => {
    try {
        const { documentId } = req.params;
        const { score, review } = req.body;

        const document = await Document.findById(documentId);
        if (!document || document.status !== "approved") {
            return res.status(404).json({
                success: false,
                message: "Tài liệu không tồn tại hoặc chưa được duyệt.",
            });
        }

        const rating = await Rating.findOneAndUpdate(
            { userId: req.user._id, documentId },
            { score, review, updatedAt: new Date() },
            { new: true, upsert: true }
        );

        // Cập nhật averageRating và totalRatings trong Document
        const avgRating = await Rating.aggregate([
            { $match: { documentId: new Types.ObjectId(documentId) } },
            { $group: { _id: null, avgScore: { $avg: "$score" }, totalRatings: { $sum: 1 } } },
        ]);

        const avgScore = avgRating.length > 0 ? parseFloat(avgRating[0].avgScore.toFixed(1)) : 0;
        const totalRatings = avgRating.length > 0 ? avgRating[0].totalRatings : 0;

        await Document.findByIdAndUpdate(documentId, {
            averageRating: avgScore,
            totalRatings,
        });

        const user = await User.findById(req.user._id).select("name");
        await notifyDocumentOwner({
            documentId,
            actionUserId: req.user._id,
            type: "new_rating",
            actionUserName: user.name || req.user.email,
        });

        logger.info(
            `Rating ${rating._id} upserted by ${req.user.email} for document ${documentId}`
        );
        res.status(201).json({
            success: true,
            message: "Đánh giá thành công.",
            data: rating,
        });
    } catch (error) {
        logger.error(`Create rating error: ${error.message}`);
        res.status(500).json({ success: false, message: "Không thể gửi đánh giá." });
    }
};

// Xóa đánh giá
exports.deleteRating = async (req, res) => {
    try {
        const { documentId } = req.params;

        const rating = await Rating.findOneAndDelete({ documentId, userId: req.user._id });
        if (!rating) {
            return res.status(404).json({
                success: false,
                message: "Đánh giá không tồn tại.",
            });
        }

        // Cập nhật averageRating và totalRatings trong Document
        const avgRating = await Rating.aggregate([
            { $match: { documentId: new Types.ObjectId(documentId) } },
            { $group: { _id: null, avgScore: { $avg: "$score" }, totalRatings: { $sum: 1 } } },
        ]);

        const avgScore = avgRating.length > 0 ? parseFloat(avgRating[0].avgScore.toFixed(1)) : 0;
        const totalRatings = avgRating.length > 0 ? avgRating[0].totalRatings : 0;

        await Document.findByIdAndUpdate(documentId, {
            averageRating: avgScore,
            totalRatings,
        });

        logger.info(`Rating deleted by ${req.user.email} for document ${documentId}`);
        res.status(200).json({
            success: true,
            message: "Xóa đánh giá thành công.",
        });
    } catch (error) {
        logger.error(`Delete rating error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Không thể xóa đánh giá.",
        });
    }
};

// Tạo mới bình luận
exports.createComment = async (req, res) => {
    try {
        const { documentId } = req.params;
        const { content, parentCommentId } = req.body;

        const document = await Document.findById(documentId);
        if (!document || document.status !== "approved") {
            return res.status(404).json({
                success: false,
                message: "Tài liệu không tồn tại hoặc chưa được duyệt.",
            });
        }

        if (parentCommentId) {
            const parentComment = await Comment.findById(parentCommentId);
            if (!parentComment || parentComment.isDeleted) {
                return res.status(404).json({
                    success: false,
                    message: "Bình luận cha không tồn tại, đã bị xóa hoặc chưa được duyệt.",
                });
            }
            if (parentComment.documentId.toString() !== documentId) {
                return res.status(400).json({
                    success: false,
                    message: "Bình luận cha không thuộc tài liệu này.",
                });
            }
        }

        const comment = new Comment({
            userId: req.user._id,
            documentId,
            content,
            parentCommentId: parentCommentId || null,
        });
        await comment.save();

        const user = await User.findById(req.user._id).select("name");
        await notifyDocumentOwner({
            documentId,
            actionUserId: req.user._id,
            type: "new_comment",
            actionUserName: user.name || req.user.email,
        });

        logger.info(`Comment created by ${req.user.email} for document ${documentId}`);
        res.status(201).json({
            success: true,
            message: "Bình luận thành công.",
            data: comment,
        });
    } catch (error) {
        logger.error(`Create comment error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Không thể gửi bình luận.",
        });
    }
};

// Lấy danh sách bình luận của tài liệu
exports.getCommentsByDocument = async (req, res) => {
    try {
        const { documentId } = req.params;
        const { page, limit, skip } = getPagination(req.query);
        const { sortBy = "createdAt", sortOrder = "desc" } = req.query;

        const document = await Document.findById(documentId);
        if (!document || document.status !== "approved") {
            return res.status(404).json({
                success: false,
                message: "Tài liệu không tồn tại hoặc chưa được duyệt.",
            });
        }

        // Aggregation để lấy bình luận và replies
        const comments = await Comment.aggregate([
            {
                $match: {
                    documentId: new Types.ObjectId(documentId),
                    isDeleted: false,
                    parentCommentId: null,
                },
            },
            { $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: "comments",
                    localField: "_id",
                    foreignField: "parentCommentId",
                    as: "replies",
                    pipeline: [
                        { $match: { isDeleted: false } },
                        {
                            $lookup: {
                                from: "users",
                                localField: "userId",
                                foreignField: "_id",
                                as: "user",
                            },
                        },
                        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
                        {
                            $project: {
                                _id: 1,
                                content: 1,
                                createdAt: 1,
                                updatedAt: 1,
                                userId: 1,
                                isEdited: 1,
                                isReported: 1,
                                user: { _id: "$user._id", name: "$user.name" },
                            },
                        },
                        { $sort: { createdAt: 1 } },
                    ],
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user",
                },
            },
            { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    content: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    userId: 1,
                    isEdited: 1,
                    isReported: 1,
                    user: { _id: "$user._id", name: "$user.name" },
                    replies: 1,
                },
            },
        ]);

        const total = await Comment.countDocuments({
            documentId,
            isDeleted: false,
            parentCommentId: null,
        });
        const pagingData = getPagingData(comments, total, page, limit);

        res.status(200).json({ success: true, data: pagingData });
    } catch (error) {
        logger.error(`Get comments error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Không thể lấy danh sách bình luận.",
        });
    }
};

// Cập nhật bình luận
exports.updateComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        const isAdmin = req.user.role === "admin";

        const comment = await Comment.findById(commentId);
        if (!comment || comment.isDeleted) {
            return res.status(404).json({
                success: false,
                message: "Bình luận không tồn tại.",
            });
        }

        if (!isAdmin && comment.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Bạn không có quyền cập nhật bình luận này.",
            });
        }

        comment.content = content;
        comment.isEdited = true;
        comment.updatedAt = new Date();
        await comment.save();

        logger.info(`Comment updated by ${req.user.email} for comment ${commentId}`);
        res.status(200).json({
            success: true,
            message: "Cập nhật bình luận thành công.",
            data: comment,
        });
    } catch (error) {
        logger.error(`Update comment error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Không thể cập nhật bình luận.",
        });
    }
};

// Xóa bình luận(chủ comment)
exports.deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        // const userId = req.user._id;
        const isAdmin = req.user.role === "admin";

        const comment = await Comment.findById(commentId);
        if (!comment || comment.isDeleted) {
            return res.status(404).json({
                success: false,
                message: "Bình luận không tồn tại.",
            });
        }

        if (!isAdmin && comment.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Bạn không có quyền xóa bình luận này.",
            });
        }

        comment.isDeleted = true;
        await comment.save();
        logger.info(`Comment deleted by ${req.user.email} for comment ${commentId}`);
        res.status(200).json({
            success: true,
            message: "Xóa bình luận thành công.",
        });
    } catch (error) {
        logger.error(`Delete comment error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Không thể xóa bình luận.",
        });
    }
};

// Báo cáo bình luận vi phạm
exports.reportComment = async (req, res) => {
    try {
        const { commentId } = req.params;

        const comment = await Comment.findById(commentId);
        if (!comment || comment.isDeleted) {
            return res.status(404).json({
                success: false,
                message: "Bình luận không tồn tại hoặc đã bị xóa.",
            });
        }

        if (comment.isReported) {
            return res.status(400).json({
                success: false,
                message: "Bình luận này đã được báo cáo.",
            });
        }

        comment.isReported = true;
        await comment.save();

        logger.info(`Comment ${commentId} reported by user ${req.user.email}`);
        res.status(200).json({
            success: true,
            message: "Báo cáo bình luận thành công.",
        });
    } catch (error) {
        logger.error(`Report comment error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Không thể báo cáo bình luận.",
        });
    }
};
