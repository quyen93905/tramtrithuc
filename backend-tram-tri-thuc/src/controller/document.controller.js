const Document = require("../models/document.model");
const Category = require("../models/category.model");
const Download = require("../models/downloadHistory.model");
const ViewHistory = require("../models/viewHistory.model");
const Favorite = require("../models/favorite.model");
const User = require("../models/user.model");
const { Types } = require("mongoose");
const logger = require("../utils/logger");
const slugify = require("slugify");
const fs = require("fs");
const path = require("path");
const { getPagination, getPagingData } = require("../utils/paginate");
const { notifyDocumentOwner } = require("../utils/notification");

// GET /api/documents
exports.getDocuments = async (req, res) => {
    try {
        const { search, category, uploader, sort, format, startDate, endDate, dateField } =
            req.query;
        const { page, limit, skip } = getPagination(req.query);

        const query = { status: "approved", isPublic: true };

        // Lọc theo danh mục
        if (category) {
            const categoryDoc = await Category.findOne({ slug: category }).lean();
            if (!categoryDoc) {
                return res.status(200).json({
                    success: true,
                    data: { totalItems: 0, totalPages: 0, currentPage: page, items: [] },
                });
            }
            query.categoryId = categoryDoc._id;
        }

        // Lọc theo uploader
        if (uploader) {
            if (!Types.ObjectId.isValid(uploader)) {
                return res.status(400).json({ success: false, message: "Invalid uploader ID" });
            }
            query.uploaderId = new Types.ObjectId(uploader);
        }

        // Lọc theo format
        if (format) {
            const validFormats = ["pdf", "docx", "pptx", "zip"];
            if (!validFormats.includes(format.toLowerCase())) {
                return res.status(400).json({ success: false, message: "Invalid format" });
            }
            query.format = format.toLowerCase();
        }

        // Lọc theo khoảng ngày
        if (startDate && endDate) {
            const validDateFields = ["createdAt", "updatedAt"];
            const selectedDateField = validDateFields.includes(dateField) ? dateField : "createdAt";

            // Kiểm tra định dạng ngày
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return res.status(400).json({ success: false, message: "Invalid date format" });
            }
            if (start > end) {
                return res
                    .status(400)
                    .json({ success: false, message: "startDate must be before endDate" });
            }

            query[selectedDateField] = {
                $gte: start,
                $lte: end,
            };
        }

        // Sắp xếp
        const validSortFields = ["viewCount", "downloadCount", "averageRating", "createdAt"];
        const sortOptions = {};
        if (sort) {
            const [field, order] = sort.split(":");
            if (!validSortFields.includes(field)) {
                return res.status(400).json({ success: false, message: "Invalid sort field" });
            }
            sortOptions[field] = order === "desc" ? -1 : 1;
        } else {
            sortOptions.createdAt = -1; // Mặc định sắp xếp mới nhất
        }

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
            {
                $match: search
                    ? {
                          $or: [
                              { title: { $regex: search, $options: "i" } },
                              { description: { $regex: search, $options: "i" } },
                              { tags: { $regex: search, $options: "i" } },
                              { "uploader.name": { $regex: search, $options: "i" } },
                          ],
                      }
                    : {},
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

        const totalDocs = await Document.countDocuments(query);
        const pagingData = getPagingData(documents, totalDocs, page, limit);

        res.status(200).json({ success: true, data: pagingData });
    } catch (error) {
        logger.error("Get documents error:", error);
        res.status(500).json({ success: false, message: "Không thể lấy danh sách tài liệu." });
    }
};

// GET /api/documents/:id
exports.getDocumentById = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id)
            .populate("categoryId", "name slug")
            .populate("uploaderId", "name email")
            .lean();

        if (!document) {
            return res.status(404).json({ success: false, message: "Tài liệu không tồn tại." });
        }

        // Tăng viewCount
        await Document.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });

        // Ghi hoặc cập nhật lịch sử xem nếu user đã đăng nhập
        if (req.user && req.user._id) {
            try {
                const existingView = await ViewHistory.findOne({
                    userId: req.user._id,
                    documentId: document._id,
                });

                if (existingView) {
                    existingView.viewedAt = new Date();
                    await existingView.save();
                    logger.info(
                        `View history updated for user ${req.user.email}, document ${document._id}`
                    );
                } else {
                    await ViewHistory.create({
                        userId: req.user._id,
                        documentId: document._id,
                        viewedAt: new Date(),
                    });
                    logger.info(
                        `View history created for user ${req.user.email}, document ${document._id}`
                    );
                }
            } catch (viewError) {
                logger.error(`Error recording ViewHistory: ${viewError.message}`);
            }
        } else {
            logger.warn(`No req.user found, skipping ViewHistory for document ${req.params.id}`);
        }

        res.status(200).json({ success: true, data: document });
    } catch (error) {
        logger.error("Get document by ID error:", error);
        res.status(500).json({ success: false, message: "Không thể lấy chi tiết tài liệu." });
    }
};

// GET /api/documents/slug/:slug
exports.getDocumentBySlug = async (req, res) => {
    try {
        const document = await Document.findOne({ slug: req.params.slug })
            .populate("categoryId", "name slug")
            .populate("uploaderId", "name email")
            .lean();

        if (!document) {
            return res.status(404).json({ success: false, message: "Tài liệu không tồn tại." });
        }

        // Tăng viewCount
        await Document.findOneAndUpdate({ slug: req.params.slug }, { $inc: { viewCount: 1 } });

        // Ghi hoặc cập nhật lịch sử xem nếu user đã đăng nhập
        if (req.user?._id) {
            if (!Types.ObjectId.isValid(req.user._id)) {
                logger.error(`Invalid user ID: ${req.user._id}`);
                return res
                    .status(400)
                    .json({ success: false, message: "ID người dùng không hợp lệ." });
            }
            try {
                console.log(
                    `Attempting to record ViewHistory for user ${req.user._id}, document ${document._id}`
                ); // Debug log
                const updateResult = await ViewHistory.updateOne(
                    {
                        userId: new Types.ObjectId(req.user._id),
                        documentId: document._id,
                    },
                    {
                        $set: { viewedAt: new Date() },
                        $setOnInsert: {
                            userId: new Types.ObjectId(req.user._id),
                            documentId: document._id,
                        },
                    },
                    { upsert: true }
                );

                if (updateResult.matchedCount > 0) {
                    logger.info(
                        `View history updated for user ${req.user.email}, document ${document._id}`
                    );
                } else {
                    logger.info(
                        `View history created for user ${req.user.email}, document ${document._id}`
                    );
                }
            } catch (viewError) {
                logger.error(`Error recording ViewHistory: ${viewError.message}`, {
                    stack: viewError.stack,
                });
            }
        } else {
            logger.warn(
                `No authenticated user, skipping ViewHistory for document ${req.params.slug}`
            );
        }

        res.status(200).json({ success: true, data: document });
    } catch (error) {
        logger.error("Get document by slug error:", error);
        res.status(500).json({ success: false, message: "Không thể lấy chi tiết tài liệu." });
    }
};

// GET /api/documents/download/:id
exports.downloadDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        if (!document) {
            logger.warn(`Document not found: ${req.params.id}`);
            return res.status(404).json({ success: false, message: "Tài liệu không tồn tại." });
        }
        logger.info(`Document found: ${req.params.id}`);

        // Construct file path more safely
        const filePath = path.resolve(__dirname, "../../uploads", document.fileName);

        // Check if file exists before proceeding
        if (!fs.existsSync(filePath)) {
            logger.warn(`File not found: ${filePath}`);
            return res.status(404).json({ success: false, message: "File không tồn tại." });
        }

        // Kiểm tra và cập nhật hoặc tạo mới bản ghi tải xuống
        const existingDownload = await Download.findOne({
            userId: req.user._id,
            documentId: document._id,
        });

        if (existingDownload) {
            existingDownload.downloadedAt = new Date();
            existingDownload.ipAddress = req.ip;
            existingDownload.deviceInfo = req.headers["user-agent"];
            await existingDownload.save();
            logger.info(
                `Download history updated for user ${req.user._id}, document ${document._id}`
            );
        } else {
            await Download.create({
                userId: req.user._id,
                documentId: document._id,
                downloadedAt: new Date(),
                ipAddress: req.ip,
                deviceInfo: req.headers["user-agent"],
            });
            logger.info(
                `Download history created for user ${req.user._id}, document ${document._id}`
            );
        }

        // Tăng downloadCount
        await Document.findByIdAndUpdate(document._id, { $inc: { downloadCount: 1 } });

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${encodeURIComponent(document.fileName)}"`
        );
        res.setHeader("Content-Type", "application/octet-stream");

        res.download(filePath, document.fileName, (err) => {
            if (err) {
                logger.error(`Download error: ${err.message}`);
                if (!res.headersSent) {
                    res.status(500).json({ success: false, message: "Không thể tải tài liệu." });
                }
            }
        });
    } catch (error) {
        logger.error(`Download document error: ${error.message}`, { stack: error.stack });
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: "Không thể tải tài liệu." });
        }
    }
};

// POST /api/documents
exports.uploadDocument = async (req, res) => {
    try {
        const { title, description, categoryId, tag } = req.body;
        const file = req.files?.file?.[0];
        const thumbnail = req.files?.thumbnail?.[0];

        if (!file) {
            return res.status(400).json({ success: false, message: "File tài liệu là bắt buộc." });
        }

        const filePath = path.join(__dirname, "../../uploads", file.filename);
        if (!fs.existsSync(filePath)) {
            return res
                .status(400)
                .json({ success: false, message: "File tài liệu không tồn tại." });
        }

        if (!(await Category.findById(categoryId))) {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            if (
                thumbnail &&
                fs.existsSync(path.join(__dirname, "../../uploads", thumbnail.filename))
            ) {
                fs.unlinkSync(path.join(__dirname, "../../uploads", thumbnail.filename));
            }
            return res.status(400).json({ success: false, message: "Danh mục không tồn tại." });
        }

        let slug = slugify(title, { lower: true, strict: true, locale: "vi" });
        let suffix = Date.now();
        let finalSlug = `${slug}-${suffix}`;
        while (await Document.findOne({ slug: finalSlug })) {
            suffix += 1;
            finalSlug = `${slug}-${suffix}`;
        }

        const document = new Document({
            title,
            description,
            fileUrl: `/uploads/${file.filename}`,
            fileName: file.filename,
            mimeType: file.mimetype,
            format: file.mimetype.split("/")[1],
            size: file.size,
            slug: finalSlug,
            thumbnailUrl: thumbnail ? `/uploads/${thumbnail.filename}` : null,
            tag: tag ? tag.split(",").map((t) => t.trim()) : [],
            uploaderId: req.user._id,
            categoryId,
            isPublic: false,
            status: "pending", // Thay isApproved
        });

        await document.save();
        logger.info(`Document uploaded by ${req.user.email}: ${title}`);
        res.status(201).json({
            success: true,
            message: "Tài liệu đã được upload, chờ duyệt.",
            data: document,
        });
    } catch (error) {
        if (req.files?.file?.[0]) {
            const filePath = path.join(__dirname, "../../uploads", req.files.file[0].filename);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        if (req.files?.thumbnail?.[0]) {
            const thumbnailPath = path.join(
                __dirname,
                "../../uploads",
                req.files.thumbnail[0].filename
            );
            if (fs.existsSync(thumbnailPath)) fs.unlinkSync(thumbnailPath);
        }
        logger.error(`Upload document error: ${error.message}`, { stack: error.stack });
        res.status(500).json({ success: false, message: "Không thể upload tài liệu." });
    }
};

// GET /api/documents/me
exports.getMyDocuments = async (req, res) => {
    try {
        const { search, category, status, sort, startDate, endDate, dateField } = req.query;
        const { page, limit, skip } = getPagination(req.query);

        // Validate userId
        const userId = req.user?._id;
        if (!userId) {
            logger.error("Không tìm thấy ID người dùng trong req.user", { user: req.user });
            return res
                .status(400)
                .json({ success: false, message: "Không tìm thấy ID người dùng." });
        }
        if (!Types.ObjectId.isValid(userId)) {
            logger.error("Định dạng ID người dùng không hợp lệ", { userId });
            return res
                .status(400)
                .json({ success: false, message: "Định dạng ID người dùng không hợp lệ." });
        }

        // Build initial query
        const query = { uploaderId: new Types.ObjectId(userId) };

        // Filter by category
        if (category) {
            const categoryDoc = await Category.findOne({ slug: category }).lean();
            if (!categoryDoc) {
                return res.status(200).json({
                    success: true,
                    data: { totalItems: 0, totalPages: 0, currentPage: page, items: [] },
                });
            }
            query.categoryId = categoryDoc._id;
        }

        // Filter by status
        if (status) {
            const validStatuses = ["approved", "pending", "rejected"];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ success: false, message: "Invalid status." });
            }
            query.status = status;
        }

        // Filter by date range
        if (startDate && endDate) {
            const validDateFields = ["createdAt", "updatedAt"];
            const field = validDateFields.includes(dateField) ? dateField : "createdAt";
            const start = new Date(startDate);
            const end = new Date(endDate);

            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return res.status(400).json({ success: false, message: "Invalid date format." });
            }
            if (start > end) {
                return res
                    .status(400)
                    .json({ success: false, message: "startDate must be before endDate." });
            }

            query[field] = { $gte: start, $lte: end };
        }

        // Build sort
        const sortOptions = (() => {
            const validSortFields = ["viewCount", "downloadCount", "favoriteCount", "createdAt"];
            if (sort) {
                const [field, order] = sort.split(":");
                if (!validSortFields.includes(field)) {
                    return null;
                }
                return { [field]: order === "desc" ? -1 : 1 };
            }
            return { createdAt: -1 };
        })();

        if (!sortOptions) {
            return res.status(400).json({ success: false, message: "Invalid sort field." });
        }

        // Aggregation pipeline
        const pipeline = [
            { $match: query },
            ...(search
                ? [
                      {
                          $match: {
                              $or: [
                                  { title: { $regex: search, $options: "i" } },
                                  { description: { $regex: search, $options: "i" } },
                                  { tags: { $regex: search, $options: "i" } },
                              ],
                          },
                      },
                  ]
                : []),
            // Lookup category
            {
                $lookup: {
                    from: "categories",
                    localField: "categoryId",
                    foreignField: "_id",
                    as: "category",
                },
            },
            { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
            // Lookup uploader
            {
                $lookup: {
                    from: "users",
                    localField: "uploaderId",
                    foreignField: "_id",
                    as: "uploader",
                },
            },
            { $unwind: { path: "$uploader", preserveNullAndEmptyArrays: true } },
            // Project fields
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
                    status: 1,
                    createdAt: 1,
                    category: {
                        _id: "$category._id",
                        name: "$category.name",
                        slug: "$category.slug",
                    },
                    uploader: {
                        _id: "$uploader._id",
                        name: "$uploader.name",
                    },
                },
            },
            { $sort: sortOptions },
            {
                $facet: {
                    items: [{ $skip: skip }, { $limit: limit }],
                    totalCount: [{ $count: "count" }],
                },
            },
        ];

        const result = await Document.aggregate(pipeline);

        const items = result[0]?.items || [];
        const totalItems = result[0]?.totalCount[0]?.count || 0;
        const pagingData = getPagingData(items, totalItems, page, limit);

        return res.status(200).json({ success: true, data: pagingData });
    } catch (error) {
        logger.error(`Get my documents error: ${error.message}`, { stack: error.stack });
        res.status(500).json({ success: false, message: "Không thể lấy danh sách tài liệu." });
    }
};

// PATCH /api/documents/:id
exports.updateDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        if (!document || document.uploaderId.toString() !== req.user._id.toString()) {
            return res
                .status(403)
                .json({ success: false, message: "Không có quyền sửa tài liệu này." });
        }

        const updates = req.body;
        if (updates.title) {
            let slug = slugify(updates.title, { lower: true, strict: true, locale: "vi" });
            let suffix = Date.now();
            let finalSlug = `${slug}-${suffix}`;
            while (await Document.findOne({ slug: finalSlug, _id: { $ne: document._id } })) {
                suffix += 1;
                finalSlug = `${slug}-${suffix}`;
            }
            updates.slug = finalSlug;
        }

        Object.assign(document, updates);
        await document.save();

        res.status(200).json({
            success: true,
            message: "Cập nhật tài liệu thành công.",
            data: document,
        });
    } catch (error) {
        logger.error(`Update document error: ${error.message}`, { stack: error.stack });
        res.status(500).json({ success: false, message: "Không thể cập nhật tài liệu." });
    }
};

// DELETE /api/documents/:id
exports.deleteDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        if (
            !document ||
            (document.uploaderId.toString() !== req.user._id.toString() &&
                req.user.role !== "admin")
        ) {
            return res
                .status(403)
                .json({ success: false, message: "Không có quyền xóa tài liệu này." });
        }

        // Xử lý fileName từ fileUrl nếu thiếu
        let fileName = document.fileName;
        if (!fileName && document.fileUrl) {
            fileName = document.fileUrl.split("/uploads/")[1];
            logger.warn(`fileName missing, derived from fileUrl: ${fileName}`);
        }
        if (!fileName) {
            logger.error(`No fileName or fileUrl for document: ${req.params.id}`);
            return res.status(400).json({ success: false, message: "Thiếu thông tin file." });
        }

        // Xóa file
        const filePath = path.join(__dirname, "../../uploads", document.fileName);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            logger.info(`Deleted file: ${filePath}`);
        } else {
            logger.warn(`File not found: ${filePath}`);
        }

        // Xóa thumbnail
        if (document.thumbnailUrl) {
            const thumbnailFile = document.thumbnailUrl.split("/uploads/")[1];
            if (thumbnailFile) {
                const thumbnailPath = path.join(__dirname, "../../Uploads", thumbnailFile);
                if (fs.existsSync(thumbnailPath)) {
                    fs.unlinkSync(thumbnailPath);
                    logger.info(`Deleted thumbnail: ${thumbnailPath}`);
                } else {
                    logger.warn(`Thumbnail not found: ${thumbnailPath}`);
                }
            }
        }

        await document.deleteOne();
        logger.info(`Document deleted by ${req.user.email}: ${document.title}`);
        res.status(200).json({ success: true, message: "Xóa tài liệu thành công." });
    } catch (error) {
        logger.error(`Delete document error: ${error.message}`, { stack: error.stack });
        res.status(500).json({ success: false, message: "Không thể xóa tài liệu." });
    }
};

// PATCH /api/documents/approve/:id
exports.approveDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        if (!document) {
            return res.status(404).json({ success: false, message: "Tài liệu không tồn tại." });
        }

        document.status = "approved";
        document.isPublic = true;
        await document.save();

        // Gửi thông báo đến chủ sở hữu
        await notifyDocumentOwner({
            documentId: document._id,
            actionUserId: req.user._id, // Admin thực hiện duyệt
            type: "document_approved",
            actionUserName: req.user.email, // Có thể thay bằng name nếu cần
        });

        logger.info(`Document approved by ${req.user.email}: ${document.title}`);
        res.status(200).json({
            success: true,
            message: "Duyệt tài liệu thành công.",
            data: document,
        });
    } catch (error) {
        logger.error("Approve document error:", error);
        res.status(500).json({ success: false, message: "Không thể duyệt tài liệu." });
    }
};

// PATCH /api/documents/feature/:id
exports.featureDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        if (!document) {
            return res.status(404).json({ success: false, message: "Tài liệu không tồn tại." });
        }

        if (document.isFeatured && document.status !== "approved") {
            return res
                .status(400)
                .json({ success: false, message: "Tài liệu phải được duyệt để gắn nổi bật." });
        }

        document.isFeatured = !document.isFeatured;
        await document.save();

        logger.info(
            `Document ${document.isFeatured ? "featured" : "unfeatured"} by ${req.user.email}: ${document.title}`
        );
        res.status(200).json({
            success: true,
            message: `Tài liệu đã được ${document.isFeatured ? "gắn" : "bỏ"} nổi bật.`,
            data: document,
        });
    } catch (error) {
        logger.error(`Feature document error:: ${error.message}`, { stack: error.stack });
        res.status(500).json({ success: false, message: "Không thể cập nhật trạng thái nổi bật." });
    }
};

//lấy tài liệu nổi bật
exports.getFeaturedDocuments = async (req, res) => {
    try {
        const { search, category, sort, startDate, endDate, dateField } = req.query;
        const { page, limit, skip } = getPagination(req.query);

        const query = { isFeatured: true, status: "approved", isPublic: true };

        // Lọc theo danh mục
        if (category) {
            const categoryDoc = await Category.findOne({ slug: category }).lean();
            if (!categoryDoc) {
                return res.status(200).json({
                    success: true,
                    data: { totalItems: 0, totalPages: 0, currentPage: page, items: [] },
                });
            }
            query.categoryId = categoryDoc._id;
        }

        // Lọc theo khoảng ngày
        if (startDate && endDate) {
            const validDateFields = ["createdAt", "updatedAt"];
            const selectedDateField = validDateFields.includes(dateField) ? dateField : "createdAt";

            const start = new Date(startDate);
            const end = new Date(endDate);
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return res.status(400).json({ success: false, message: "Invalid date format" });
            }
            if (start > end) {
                return res
                    .status(400)
                    .json({ success: false, message: "startDate must be before endDate" });
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
                return res.status(400).json({ success: false, message: "Invalid sort field" });
            }
            sortOptions[field] = order === "desc" ? -1 : 1;
        } else {
            sortOptions.createdAt = -1; // Mặc định sắp xếp mới nhất
        }

        const documents = await Document.aggregate([
            { $match: query },
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
                $match: search
                    ? {
                          $or: [
                              { title: { $regex: search, $options: "i" } },
                              { description: { $regex: search, $options: "i" } },
                              { tags: { $regex: search, $options: "i" } },
                          ],
                      }
                    : {},
            },
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
                    createdAt: 1,
                    category: {
                        _id: "$category._id",
                        name: "$category.name",
                        slug: "$category.slug",
                    },
                    uploader: { _id: "$uploader._id", name: "$uploader.name" },
                },
            },
            { $sort: sortOptions },
            { $skip: skip },
            { $limit: limit },
        ]);

        const totalDocs = await Document.countDocuments(query);
        const pagingData = getPagingData(documents, totalDocs, page, limit);

        res.status(200).json({ success: true, data: pagingData });
    } catch (error) {
        logger.error("Get featured documents error:", error);
        res.status(500).json({
            success: false,
            message: "Không thể lấy danh sách tài liệu nổi bật.",
        });
    }
};

// PATCH /api/documents/:id/favorite
exports.toggleFavorite = async (req, res) => {
    try {
        const { id: docId } = req.params;
        const userId = req.user._id;

        if (!Types.ObjectId.isValid(docId) || !Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "ID không hợp lệ" });
        }

        const document = await Document.findById(docId);
        if (!document || document.status !== "approved") {
            return res.status(404).json({
                success: false,
                message: "Tài liệu không tồn tại hoặc chưa được duyệt",
            });
        }

        const existingFavorite = await Favorite.findOne({ userId, documentId: docId });

        let isFavorite;
        if (existingFavorite) {
            // Xóa khỏi yêu thích
            await Favorite.deleteOne({ userId, documentId: docId });
            await Document.updateOne({ _id: docId }, { $inc: { favoriteCount: -1 } });
            isFavorite = false;
        } else {
            // Thêm vào yêu thích
            const favoriteCount = await Favorite.countDocuments({ userId });
            if (favoriteCount >= 100) {
                return res.status(400).json({
                    success: false,
                    message: "Danh sách yêu thích đã đạt giới hạn",
                });
            }
            await Favorite.create({ userId, documentId: docId, favoritedAt: new Date() });
            await Document.updateOne({ _id: docId }, { $inc: { favoriteCount: 1 } });
            isFavorite = true;
        }

        const updatedDocument = await Document.findById(docId)
            .select(
                "title description slug categoryId uploaderId viewCount downloadCount favoriteCount createdAt"
            )
            .populate("categoryId", "name slug")
            .populate("uploaderId", "name email")
            .lean();

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
            .then((favorites) => favorites.map((fav) => fav.documentId));

        res.status(200).json({
            success: true,
            data: {
                document: updatedDocument,
                favoriteDocuments: favoriteDocuments || [],
                isFavorite,
                message: isFavorite ? "Đã thêm vào yêu thích" : "Đã xóa khỏi yêu thích",
            },
        });
    } catch (error) {
        logger.error("Toggle favorite error:", error);
        res.status(500).json({ success: false, message: "Lỗi khi cập nhật yêu thích" });
    }
};
