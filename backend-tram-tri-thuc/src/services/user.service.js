const mongoose = require("mongoose");
const User = require("../models/user.model");
const Rating = require("../models/rating.model");
const Document = require("../models/document.model");
const ViewHistory = require("../models/viewHistory.model");
const Category = require("../models/category.model");
const Favorite = require("../models/favorite.model");
const Download = require("../models/downloadHistory.model");
const logger = require("../utils/logger");
const { getPagination, getPagingData } = require("../utils/paginate");

class UserService {
    static async getUsers(queryParams = {}) {
        try {
            const { search } = queryParams;
            const filter = { role: { $ne: "admin" } };
            if (search) {
                // Sanitize search input
                const sanitizedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                filter.$or = [
                    { email: { $regex: sanitizedSearch, $options: "i" } },
                    { name: { $regex: sanitizedSearch, $options: "i" } },
                ];
            }

            const { page, limit, skip } = getPagination(queryParams);
            const total = await User.countDocuments(filter);
            const users = await User.find(filter)
                .select("-password -resetToken -token")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean();
            return getPagingData(users, total, page, limit);
        } catch (error) {
            logger.error("Lỗi getUsers:", error);
            throw new Error("Lỗi khi lấy danh sách người dùng");
        }
    }

    static async getUserInfo(userId) {
        try {
            const user = await User.findById(userId).select("-password -resetToken -token").lean();
            if (!user) {
                throw new Error("Không tìm thấy người dùng");
            }

            // Lấy danh sách tài liệu yêu thích từ Favorite model
            const favoriteDocuments = await Favorite.find({ userId })
                .populate({
                    path: "documentId",
                    select: "title description slug categoryId uploaderId viewCount downloadCount favoriteCount createdAt",
                    populate: [
                        { path: "categoryId", select: "name slug" },
                        { path: "uploaderId", select: "name email" },
                    ],
                })
                .lean()
                .then((favorites) =>
                    favorites.map((fav) => ({ ...fav.documentId, favoritedAt: fav.favoritedAt }))
                );

            return { ...user, favoriteDocuments };
        } catch (error) {
            logger.error("Lỗi getUserInfo:", error);
            throw error;
        }
    }

    static async updateUserInfo(userId, updateData) {
        try {
            // Có thể lọc các trường cho phép update ở đây nếu cần
            const allowedFields = ["name", "avatar", "email"];
            const filteredData = {};
            allowedFields.forEach((field) => {
                if (updateData[field] !== undefined) filteredData[field] = updateData[field];
            });

            if (filteredData.email) {
                const existingUser = await User.findOne({
                    email: filteredData.email,
                    _id: { $ne: userId },
                });
                if (existingUser) {
                    throw new Error("Email đã được sử dụng.");
                }
            }

            const user = await User.findByIdAndUpdate(userId, filteredData, {
                new: true,
                runValidators: true,
            }).select("-password -resetToken -token");
            if (!user) {
                throw new Error("Không tìm thấy người dùng");
            }
            return user;
        } catch (error) {
            logger.error("Lỗi updateUserInfo:", error);
            throw error;
        }
    }

    static async deleteMyAccount(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error("Không tìm thấy người dùng");
            }

            // Xóa tài liệu
            await Document.deleteMany({ uploaderId: userId });

            // Xóa bình luận
            await Comment.deleteMany({ userId });

            // Xóa đánh giá
            await Rating.deleteMany({ userId });

            // Xóa favorites
            await Favorite.deleteMany({ userId });

            // Xóa user
            await User.deleteOne({ _id: userId });

            logger.info(`Account deleted for userId: ${userId}`);
            return;
        } catch (error) {
            logger.error("Lỗi deleteMyAccount:", error);
            throw error;
        }
    }

    static async getUserHistory(userId, queryParams) {
        try {
            if (!mongoose.isValidObjectId(userId)) {
                throw new Error("ID người dùng không hợp lệ");
            }

            const { search, category, sort, startDate, endDate } = queryParams;
            const { page, limit, skip } = getPagination(queryParams);

            const user = await User.findById(userId).lean();
            if (!user) throw new Error("Không tìm thấy người dùng");

            const query = { userId: new mongoose.Types.ObjectId(userId) };

            // Lọc theo danh mục
            let categoryId = null;
            if (category) {
                const categoryDoc = await Category.findOne({ slug: category }).lean();
                if (!categoryDoc) {
                    return getPagingData([], 0, page, limit);
                }
                categoryId = categoryDoc._id;
            }

            // Lọc theo ngày xem
            if (startDate && endDate) {
                const start = new Date(startDate);
                const end = new Date(endDate);
                if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                    throw new Error("Định dạng ngày không hợp lệ");
                }
                if (start > end) {
                    throw new Error("startDate phải trước endDate");
                }
                query.viewedAt = { $gte: start, $lte: end };
            }

            // Sắp xếp
            const sortOptions = {};
            if (sort) {
                const [field, order] = sort.split(":");
                if (field !== "viewedAt") {
                    throw new Error("Trường sắp xếp không hợp lệ");
                }
                sortOptions[field] = order === "desc" ? -1 : 1;
            } else {
                sortOptions.viewedAt = -1; // Mặc định sắp xếp theo thời gian xem mới nhất
            }

            const history = await ViewHistory.aggregate([
                { $match: query },
                {
                    $lookup: {
                        from: "documents",
                        localField: "documentId",
                        foreignField: "_id",
                        as: "document",
                        pipeline: [
                            { $match: { status: "approved" } },
                            ...(categoryId
                                ? [
                                      {
                                          $match: {
                                              categoryId: new mongoose.Types.ObjectId(categoryId),
                                          },
                                      },
                                  ]
                                : []),
                            ...(search
                                ? [
                                      {
                                          $match: {
                                              $or: [
                                                  { title: { $regex: search, $options: "i" } },
                                                  {
                                                      description: {
                                                          $regex: search,
                                                          $options: "i",
                                                      },
                                                  },
                                                  { tags: { $regex: search, $options: "i" } },
                                              ],
                                          },
                                      },
                                  ]
                                : []),
                        ],
                    },
                },
                { $unwind: { path: "$document", preserveNullAndEmptyArrays: false } }, // Chỉ giữ bản ghi có document
                {
                    $lookup: {
                        from: "categories",
                        localField: "document.categoryId",
                        foreignField: "_id",
                        as: "document.category",
                    },
                },
                { $unwind: { path: "$document.category", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "users",
                        localField: "document.uploaderId",
                        foreignField: "_id",
                        as: "document.uploader",
                    },
                },
                { $unwind: { path: "$document.uploader", preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        documentId: {
                            _id: "$document._id",
                            title: "$document.title",
                            slug: "$document.slug",
                            description: "$document.description",
                            thumbnailUrl: "$document.thumbnailUrl",
                            format: "$document.format",
                            tags: "$document.tags",
                            viewCount: "$document.viewCount",
                            downloadCount: "$document.downloadCount",
                            favoriteCount: "$document.favoriteCount",
                            createdAt: "$document.createdAt",
                            category: {
                                _id: { $ifNull: ["$document.category._id", null] },
                                name: { $ifNull: ["$document.category.name", "Unknown"] },
                                slug: { $ifNull: ["$document.category.slug", null] },
                            },
                            uploader: {
                                _id: { $ifNull: ["$document.uploader._id", null] },
                                name: { $ifNull: ["$document.uploader.name", "Unknown"] },
                            },
                        },
                        viewedAt: 1,
                    },
                },
                { $sort: sortOptions },
                { $skip: skip },
                { $limit: limit },
            ]);

            const totalDocs = await ViewHistory.aggregate([
                { $match: query },
                {
                    $lookup: {
                        from: "documents",
                        localField: "documentId",
                        foreignField: "_id",
                        as: "document",
                        pipeline: [
                            { $match: { status: "approved" } },
                            ...(categoryId
                                ? [
                                      {
                                          $match: {
                                              categoryId: new mongoose.Types.ObjectId(categoryId),
                                          },
                                      },
                                  ]
                                : []),
                        ],
                    },
                },
                { $unwind: { path: "$document", preserveNullAndEmptyArrays: false } },
                { $count: "total" },
            ]).then((result) => result[0]?.total || 0);

            return getPagingData(history, totalDocs, page, limit);
        } catch (error) {
            logger.error("Lỗi getUserHistory:", error);
            throw error;
        }
    }

    static async getUserFavorites(userId, queryParams) {
        try {
            if (!mongoose.isValidObjectId(userId)) {
                throw new Error("ID người dùng không hợp lệ");
            }

            const { search, category, sort, startDate, endDate, dateField } = queryParams;
            const { page, limit, skip } = getPagination(queryParams);

            const user = await User.findById(userId).lean();
            if (!user) throw new Error("Không tìm thấy người dùng");

            const query = { userId: new mongoose.Types.ObjectId(userId) };

            // Lọc theo ngày yêu thích
            if (startDate && endDate) {
                const start = new Date(startDate);
                const end = new Date(endDate);
                if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                    throw new Error("Định dạng ngày không hợp lệ");
                }
                if (start > end) {
                    throw new Error("startDate phải trước endDate");
                }
                query.favoritedAt = { $gte: start, $lte: end };
            }

            // Lọc theo danh mục
            let categoryId = null;
            if (category) {
                const categoryDoc = await Category.findOne({ slug: category }).lean();
                if (!categoryDoc) {
                    return getPagingData([], 0, page, limit);
                }
                categoryId = categoryDoc._id;
            }

            // Sắp xếp
            const validSortFields = ["viewCount", "downloadCount", "favoriteCount", "favoritedAt"];
            const sortOptions = {};
            if (sort) {
                const [field, order] = sort.split(":");
                if (!validSortFields.includes(field)) {
                    throw new Error("Trường sắp xếp không hợp lệ");
                }
                sortOptions[field] = order === "desc" ? -1 : 1;
            } else {
                sortOptions.favoritedAt = -1; // Mặc định sắp xếp theo ngày yêu thích mới nhất
            }

            const favorites = await Favorite.aggregate([
                { $match: query },
                {
                    $lookup: {
                        from: "documents",
                        localField: "documentId",
                        foreignField: "_id",
                        as: "document",
                        pipeline: [
                            { $match: { status: "approved" } },
                            ...(categoryId
                                ? [
                                      {
                                          $match: {
                                              categoryId: new mongoose.Types.ObjectId(categoryId),
                                          },
                                      },
                                  ]
                                : []),
                            ...(search
                                ? [
                                      {
                                          $match: {
                                              $or: [
                                                  { title: { $regex: search, $options: "i" } },
                                                  {
                                                      description: {
                                                          $regex: search,
                                                          $options: "i",
                                                      },
                                                  },
                                                  { tags: { $regex: search, $options: "i" } },
                                              ],
                                          },
                                      },
                                  ]
                                : []),
                        ],
                    },
                },
                { $unwind: { path: "$document", preserveNullAndEmptyArrays: false } },
                {
                    $lookup: {
                        from: "categories",
                        localField: "document.categoryId",
                        foreignField: "_id",
                        as: "document.category",
                    },
                },
                { $unwind: { path: "$document.category", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "users",
                        localField: "document.uploaderId",
                        foreignField: "_id",
                        as: "document.uploader",
                    },
                },
                { $unwind: { path: "$document.uploader", preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        _id: "$document._id",
                        title: "$document.title",
                        slug: "$document.slug",
                        description: "$document.description",
                        thumbnailUrl: "$document.thumbnailUrl",
                        format: "$document.format",
                        viewCount: "$document.viewCount",
                        downloadCount: "$document.downloadCount",
                        favoriteCount: "$document.favoriteCount",
                        createdAt: "$document.createdAt",
                        favoritedAt: 1,
                        category: {
                            _id: "$document.category._id",
                            name: "$document.category.name",
                            slug: "$document.category.slug",
                        },
                        uploader: {
                            _id: "$document.uploader._id",
                            name: "$document.uploader.name",
                        },
                    },
                },
                { $sort: sortOptions },
                { $skip: skip },
                { $limit: limit },
            ]);

            const totalDocs = await Favorite.countDocuments({
                ...query,
                documentId: {
                    $in: (await Document.find({ status: "approved" }).select("_id")).map(
                        (doc) => doc._id
                    ),
                },
            });

            return getPagingData(favorites, totalDocs, page, limit);
        } catch (error) {
            logger.error("Lỗi getUserFavorites:", error);
            throw error;
        }
    }

    static async getUserDownloads(userId, queryParams) {
        try {
            if (!mongoose.isValidObjectId(userId)) {
                throw new Error("ID người dùng không hợp lệ");
            }

            const { search, category, sort, startDate, endDate, dateField } = queryParams;
            const { page, limit, skip } = getPagination(queryParams);

            const user = await User.findById(userId).lean();
            if (!user) throw new Error("Không tìm thấy người dùng");

            const query = { userId: new mongoose.Types.ObjectId(userId) };

            // Lọc theo danh mục
            let categoryId = null;
            if (category) {
                const categoryDoc = await Category.findOne({ slug: category }).lean();
                if (!categoryDoc) {
                    return getPagingData([], 0, page, limit);
                }
                categoryId = categoryDoc._id;
            }

            // Lọc theo ngày tải xuống
            if (startDate && endDate) {
                const start = new Date(startDate);
                const end = new Date(endDate);
                if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                    throw new Error("Định dạng ngày không hợp lệ");
                }
                if (start > end) {
                    throw new Error("startDate phải trước endDate");
                }
                query.downloadedAt = { $gte: start, $lte: end };
            }

            // Sắp xếp
            const validSortFields = ["viewCount", "downloadCount", "favoriteCount", "downloadedAt"];
            const sortOptions = {};
            if (sort) {
                const [field, order] = sort.split(":");
                if (!validSortFields.includes(field)) {
                    throw new Error("Trường sắp xếp không hợp lệ");
                }
                sortOptions[field] = order === "desc" ? -1 : 1;
            } else {
                sortOptions.downloadedAt = -1; // Mặc định sắp xếp theo thời gian tải gần nhất
            }

            // Group để lấy bản ghi tải xuống mới nhất cho mỗi tài liệu
            const downloads = await Download.aggregate([
                { $match: query },
                {
                    $sort: { downloadedAt: -1 }, // Đảm bảo bản ghi mới nhất được giữ
                },
                {
                    $group: {
                        _id: "$documentId",
                        userId: { $first: "$userId" },
                        downloadedAt: { $first: "$downloadedAt" },
                        ipAddress: { $first: "$ipAddress" },
                        deviceInfo: { $first: "$deviceInfo" },
                    },
                },
                {
                    $lookup: {
                        from: "documents",
                        localField: "_id",
                        foreignField: "_id",
                        as: "document",
                        pipeline: [
                            { $match: { status: "approved" } },
                            ...(categoryId
                                ? [
                                      {
                                          $match: {
                                              categoryId: new mongoose.Types.ObjectId(categoryId),
                                          },
                                      },
                                  ]
                                : []),
                            ...(search
                                ? [
                                      {
                                          $match: {
                                              $or: [
                                                  { title: { $regex: search, $options: "i" } },
                                                  {
                                                      description: {
                                                          $regex: search,
                                                          $options: "i",
                                                      },
                                                  },
                                                  { tags: { $regex: search, $options: "i" } },
                                              ],
                                          },
                                      },
                                  ]
                                : []),
                        ],
                    },
                },
                { $unwind: { path: "$document", preserveNullAndEmptyArrays: false } },
                {
                    $lookup: {
                        from: "categories",
                        localField: "document.categoryId",
                        foreignField: "_id",
                        as: "document.category",
                    },
                },
                { $unwind: { path: "$document.category", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "users",
                        localField: "document.uploaderId",
                        foreignField: "_id",
                        as: "document.uploader",
                    },
                },
                { $unwind: { path: "$document.uploader", preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        _id: "$document._id",
                        title: "$document.title",
                        slug: "$document.slug",
                        description: "$document.description",
                        thumbnailUrl: "$document.thumbnailUrl",
                        format: "$document.format",
                        viewCount: "$document.viewCount",
                        downloadCount: "$document.downloadCount",
                        favoriteCount: "$document.favoriteCount",
                        createdAt: "$document.createdAt",
                        downloadedAt: 1,
                        category: {
                            _id: "$document.category._id",
                            name: "$document.category.name",
                            slug: "$document.category.slug",
                        },
                        uploader: {
                            _id: "$document.uploader._id",
                            name: "$document.uploader.name",
                        },
                    },
                },
                { $sort: sortOptions },
                { $skip: skip },
                { $limit: limit },
            ]);

            // Đếm tổng số tài liệu duy nhất
            const totalDocs = await Download.aggregate([
                { $match: query },
                { $group: { _id: "$documentId" } },
                { $count: "total" },
            ]).then((result) => result[0]?.total || 0);

            return getPagingData(downloads, totalDocs, page, limit);
        } catch (error) {
            logger.error("Lỗi getUserDownloads:", error);
            throw error;
        }
    }
}

module.exports = UserService;
