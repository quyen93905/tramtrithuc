const mongoose = require("mongoose");
const User = mongoose.model("User");
const Category = require("../models/category.model");
const Document = require("../models/document.model");
const slugify = require("slugify");
// thống kê lượt xem
exports.getViewStatsByMonth = async (req, res) => {
    try {
        const viewStats = await Document.aggregate([
            {
                // Group by year and month
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                    },
                    totalViews: { $sum: "$viewCount" },
                    documentCount: { $sum: 1 },
                },
            },
            {
                // Sort by year and month in descending order
                $sort: {
                    "_id.year": -1,
                    "_id.month": -1,
                },
            },
            {
                // Project to format the output
                $project: {
                    year: "$_id.year",
                    month: "$_id.month",
                    totalViews: 1,
                    documentCount: 1,
                    _id: 0,
                },
            },
        ]);

        // Format month names for better readability
        const formattedStats = viewStats.map((stat) => ({
            period: `${new Date(stat.year, stat.month - 1).toLocaleString("default", { month: "long" })} ${stat.year}`,
            year: stat.year,
            month: stat.month,
            totalViews: stat.totalViews,
            documentCount: stat.documentCount,
        }));

        res.status(200).json({
            success: true,
            data: formattedStats,
        });
    } catch (error) {
        console.error("Error in getViewStatsByMonth:", error);
        res.status(500).json({
            success: false,
            message: "Error retrieving view statistics",
            error: error.message,
        });
    }
};

exports.getSystemStats = async (req, res) => {
    try {
        // Perform all counts concurrently
        const [totalDocuments, totalUsers, approvedDocuments, pendingDocuments] = await Promise.all(
            [
                Document.countDocuments({}),
                User.countDocuments({}),
                Document.countDocuments({ status: "approved" }),
                Document.countDocuments({ status: "pending" }),
            ]
        );

        // Prepare statistics object
        const stats = {
            totalDocuments,
            totalUsers,
            approvedDocuments,
            pendingDocuments,
        };

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Lấy thống kê hệ thống thành công",
            data: stats,
        });
    } catch (error) {
        console.error("Lỗi getSystemStats:", error);
        return res.status(400).json({
            success: false,
            status: 400,
            message: error.message || "Lỗi khi lấy thống kê hệ thống",
        });
    }
};

// User
exports.getUsersWithPagination = async (req, res) => {
    try {
        // Extract pagination parameters from query
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get users with pagination and total count
        const [users, totalUsers] = await Promise.all([
            User.find({}).skip(skip).limit(limit).lean(),
            User.countDocuments({}),
        ]);

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalUsers / limit);
        const pagination = {
            currentPage: page,
            pageSize: limit,
            totalItems: totalUsers,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        };

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Lấy danh sách người dùng thành công",
            data: {
                users,
                pagination,
            },
        });
    } catch (error) {
        console.error("Lỗi getUsersWithPagination:", error);
        return res.status(400).json({
            success: false,
            status: 400,
            message: error.message || "Lỗi khi lấy danh sách người dùng",
        });
    }
};

// Document
exports.getDocumentsWithPagination = async (req, res) => {
    try {
        // Extract pagination parameters from query
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get documents with pagination and total count
        const [documents, totalDocuments] = await Promise.all([
            Document.find({}).skip(skip).limit(limit).lean(),
            Document.countDocuments({}),
        ]);

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalDocuments / limit);
        const pagination = {
            currentPage: page,
            pageSize: limit,
            totalItems: totalDocuments,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        };

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Lấy danh sách tài liệu thành công",
            data: {
                documents,
                pagination,
            },
        });
    } catch (error) {
        console.error("Lỗi getDocumentsWithPagination:", error);
        return res.status(400).json({
            success: false,
            status: 400,
            message: error.message || "Lỗi khi lấy danh sách tài liệu",
        });
    }
};

exports.approveDocument = async (req, res) => {
    try {
        const { documentId } = req.body;

        // Validate documentId
        if (!mongoose.Types.ObjectId.isValid(documentId)) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: "ID tài liệu không hợp lệ",
            });
        }

        // Find and update document status to approved
        const document = await Document.findByIdAndUpdate(
            documentId,
            { status: "approved" },
            { new: true, runValidators: true }
        ).lean();

        // Check if document exists
        if (!document) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: "Không tìm thấy tài liệu",
            });
        }

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Duyệt tài liệu thành công",
            data: document,
        });
    } catch (error) {
        console.error("Lỗi approveDocument:", error);
        return res.status(400).json({
            success: false,
            status: 400,
            message: error.message || "Lỗi khi duyệt tài liệu",
        });
    }
};

exports.rejectDocument = async (req, res) => {
    try {
        const { documentId } = req.body;

        // Validate documentId
        if (!mongoose.Types.ObjectId.isValid(documentId)) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: "ID tài liệu không hợp lệ",
            });
        }

        // Find and update document status to rejected
        const document = await Document.findByIdAndUpdate(
            documentId,
            { status: "rejected" },
            { new: true, runValidators: true }
        ).lean();

        // Check if document exists
        if (!document) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: "Không tìm thấy tài liệu",
            });
        }

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Hủy tài liệu thành công",
            data: document,
        });
    } catch (error) {
        console.error("Lỗi rejectDocument:", error);
        return res.status(400).json({
            success: false,
            status: 400,
            message: error.message || "Lỗi khi hủy tài liệu",
        });
    }
};

exports.updateDocumentFeatured = async (req, res) => {
    try {
        const { documentId, isFeatured } = req.body;

        // Validate documentId
        if (!mongoose.Types.ObjectId.isValid(documentId)) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: "ID tài liệu không hợp lệ",
            });
        }

        // Validate isFeatured
        if (typeof isFeatured !== "boolean") {
            return res.status(400).json({
                success: false,
                status: 400,
                message: "isFeatured phải là giá trị boolean",
            });
        }

        // Find and update document's isFeatured field
        const document = await Document.findByIdAndUpdate(
            documentId,
            { isFeatured },
            { new: true, runValidators: true }
        ).lean();

        // Check if document exists
        if (!document) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: "Không tìm thấy tài liệu",
            });
        }

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Cập nhật trạng thái nổi bật thành công",
            data: document,
        });
    } catch (error) {
        console.error("Lỗi updateDocumentFeatured:", error);
        return res.status(400).json({
            success: false,
            status: 400,
            message: error.message || "Lỗi khi cập nhật trạng thái nổi bật",
        });
    }
};

// Category
exports.createCategory = async (req, res) => {
    try {
        const { name, slug, description } = req.body;

        // Validate required fields
        if (!name || !slug) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: "Tên và slug là bắt buộc",
            });
        }

        // Create and save new category
        const category = new Category({ name, slug, description });
        await category.save();

        return res.status(201).json({
            success: true,
            status: 201,
            message: "Tạo danh mục thành công",
            data: category,
        });
    } catch (error) {
        console.error("Lỗi createCategory:", error);
        return res.status(400).json({
            success: false,
            status: 400,
            message: error.message || "Lỗi khi tạo danh mục",
        });
    }
};

exports.getCategories = async (req, res) => {
    try {
        // Extract pagination parameters from query
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get categories with pagination and total count
        const [categories, totalCategories] = await Promise.all([
            Category.find({}).skip(skip).limit(limit).lean(),
            Category.countDocuments({}),
        ]);

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCategories / limit);
        const pagination = {
            currentPage: page,
            pageSize: limit,
            totalItems: totalCategories,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        };

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Lấy danh sách danh mục thành công",
            data: {
                categories,
                pagination,
            },
        });
    } catch (error) {
        console.error("Lỗi getCategories:", error);
        return res.status(400).json({
            success: false,
            status: 400,
            message: error.message || "Lỗi khi lấy danh sách danh mục",
        });
    }
};

exports.getCategoryById = async (req, res) => {
    try {
        const { categoryId } = req.params;

        // Validate categoryId
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: "ID danh mục không hợp lệ",
            });
        }

        // Find category by ID
        const category = await Category.findById(categoryId).lean();

        // Check if category exists
        if (!category) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: "Không tìm thấy danh mục",
            });
        }

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Lấy thông tin danh mục thành công",
            data: category,
        });
    } catch (error) {
        console.error("Lỗi getCategoryById:", error);
        return res.status(400).json({
            success: false,
            status: 400,
            message: error.message || "Lỗi khi lấy thông tin danh mục",
        });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { name, description } = req.body;

        // Tạo slug từ name nếu không có slug truyền vào
        const slug = slugify(req.body.slug || name, { lower: true, strict: true });

        // Cập nhật danh mục
        const category = await Category.findByIdAndUpdate(
            categoryId,
            { name, slug, description },
            { new: true, runValidators: true }
        ).lean();

        if (!category) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: "Không tìm thấy danh mục",
            });
        }

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Cập nhật danh mục thành công",
            data: category,
        });
    } catch (error) {
        console.error("Lỗi updateCategory:", error);
        return res.status(400).json({
            success: false,
            status: 400,
            message: error.message || "Lỗi khi cập nhật danh mục",
        });
    }
};
exports.deleteCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        // Find and delete category
        const category = await Category.findByIdAndDelete(categoryId).lean();

        // Check if category exists
        if (!category) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: "Không tìm thấy danh mục",
            });
        }

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Xóa danh mục thành công",
            data: null,
        });
    } catch (error) {
        console.error("Lỗi deleteCategory:", error);
        return res.status(400).json({
            success: false,
            status: 400,
            message: error.message || "Lỗi khi xóa danh mục",
        });
    }
};
