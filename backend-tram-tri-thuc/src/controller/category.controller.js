const mongoose = require("mongoose");
const Category = require("../models/category.model");
const Document = require("../models/document.model");
const logger = require("../utils/logger");
const slugify = require("slugify");
const { getPagination, getPagingData } = require("../utils/paginate");

// GET /api/categories
exports.getCategories = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req.query);
        const categories = await Category.find()
            .select("name slug description createdAt")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const total = await Category.countDocuments();
        const pagingData = getPagingData(categories, total, page, limit);

        res.status(200).json({ success: true, data: pagingData });
    } catch (error) {
        logger.error("Get categories error:", error);
        res.status(500).json({ success: false, message: "Không thể lấy danh sách danh mục." });
    }
};

exports.getCategoryBySlug = async (req, res) => {
    try {
        // Lấy query params và xử lý phân trang
        const { page, limit, skip } = getPagination(req.query);
        const { search, startDate, endDate, dateField, sort } = req.query;

        if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
            return res.status(400).json({
                success: false,
                message: "Tham số page hoặc limit không hợp lệ.",
            });
        }

        const category = await Category.findOne({ slug: req.params.slug })
            .select("name slug description createdAt")
            .lean();

        if (!category) {
            return res.status(404).json({ success: false, message: "Danh mục không tồn tại." });
        }

        // Xây dựng query cho tài liệu
        const query = { categoryId: category._id, status: "approved", isPublic: true };

        // Tìm kiếm theo title, description, tags
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { tags: { $regex: search, $options: "i" } },
            ];
        }

        // Lọc theo khoảng ngày
        if (startDate && endDate) {
            const validDateFields = ["createdAt", "updatedAt"];
            const selectedDateField = validDateFields.includes(dateField) ? dateField : "createdAt";

            const start = new Date(startDate);
            const end = new Date(endDate);
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return res
                    .status(400)
                    .json({ success: false, message: "Định dạng ngày không hợp lệ" });
            }
            if (start > end) {
                return res.status(400).json({
                    success: false,
                    message: "startDate phải trước endDate",
                });
            }

            query[selectedDateField] = {
                $gte: start,
                $lte: end,
            };
        }

        // Sắp xếp
        const validSortFields = ["viewCount", "downloadCount", "favoriteCount", "createdAt"];
        const sortOptions = {};
        if (sort) {
            const [field, order] = sort.split(":");
            if (!validSortFields.includes(field)) {
                return res
                    .status(400)
                    .json({ success: false, message: "Trường sắp xếp không hợp lệ" });
            }
            sortOptions[field] = order === "desc" ? -1 : 1;
        } else {
            sortOptions.createdAt = -1; // Mặc định sắp xếp mới nhất
        }

        // Query tài liệu với aggregate
        const documents = await Document.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: "ratings",
                    localField: "_id",
                    foreignField: "documentId",
                    as: "ratings",
                },
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "categoryId",
                    foreignField: "_id",
                    as: "category",
                },
            },
            { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "users",
                    localField: "uploaderId",
                    foreignField: "_id",
                    as: "uploader",
                },
            },
            { $unwind: { path: "$uploader", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    slug: 1,
                    description: 1,
                    thumbnailUrl: 1,
                    format: 1,
                    viewCount: 1,
                    downloadCount: 1,
                    favoriteCount: 1,
                    tags: 1,
                    createdAt: 1,
                    category: {
                        _id: "$category._id",
                        name: "$category.name",
                        slug: "$category.slug",
                    },
                    uploader: { _id: "$uploader._id", name: "$uploader.name" },
                    averageRating: { $avg: "$ratings.score" },
                    totalRatings: { $size: "$ratings" },
                },
            },
            { $sort: sortOptions },
            { $skip: skip },
            { $limit: limit },
        ]);

        // Đếm tổng số tài liệu
        const total = await Document.countDocuments(query);
        const pagingData = getPagingData(documents, total, page, limit);

        // Kết hợp response
        const responseData = {
            ...category,
            documents: pagingData.items,
            pagination: {
                totalItems: pagingData.totalItems,
                totalPages: pagingData.totalPages,
                currentPage: pagingData.currentPage,
                limit: pagingData.limit,
            },
        };

        res.status(200).json({ success: true, data: responseData });
    } catch (error) {
        logger.error("Get category by slug error:", {
            error: error.message,
            stack: error.stack,
            slug: req.params.slug,
            query: req.query,
        });
        res.status(500).json({ success: false, message: "Không thể lấy thông tin danh mục." });
    }
};

// POST /api/categories
exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        let { slug } = req.body;
        slug = slugify(slug || name, { lower: true, strict: true });

        const category = new Category({ name, slug, description });
        await category.save();

        logger.info(`Category created by ${req.user.email}: ${name}`);
        res.status(201).json({
            success: true,
            message: "Tạo danh mục thành công.",
            data: category,
        });
    } catch (error) {
        logger.error("Create category error:", error);
        res.status(500).json({ success: false, message: "Không thể tạo danh mục." });
    }
};

// PATCH /api/categories/:id
exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Danh mục không tồn tại." });
        }

        const updates = req.body;
        if (updates.name) {
            updates.slug = slugify(updates.slug || updates.name, { lower: true, strict: true });
        }

        Object.assign(category, updates);
        await category.save();

        logger.info(`Category updated by ${req.user.email}: ${category.name}`);
        res.status(200).json({
            success: true,
            message: "Cập nhật danh mục thành công.",
            data: category,
        });
    } catch (error) {
        logger.error("Update category error:", error);
        res.status(500).json({ success: false, message: "Không thể cập nhật danh mục." });
    }
};

// DELETE /api/categories/:id
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Danh mục không tồn tại." });
        }

        const documentCount = await Document.countDocuments({ categoryId: req.params.id });
        if (documentCount > 0) {
            return res.status(400).json({
                success: false,
                message: "Không thể xóa danh mục vì có tài liệu liên quan.",
            });
        }

        await Category.deleteOne({ _id: req.params.id });

        logger.info(`Category deleted by ${req.user.email}: ${category.name}`);
        res.status(200).json({ success: true, message: "Xóa danh mục thành công." });
    } catch (error) {
        await session.abortTransaction();
        logger.error("Delete category error:", error);
        res.status(500).json({ success: false, message: "Không thể xóa danh mục." });
    }
};
