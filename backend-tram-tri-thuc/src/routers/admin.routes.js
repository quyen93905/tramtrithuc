const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validate");
const { param, body, query } = require("express-validator");
const isAdmin = require("../middlewares/isAdmin");
const {
    getViewStatsByMonth,
    getUsersWithPagination,
    getDocumentsWithPagination,
    approveDocument,
    rejectDocument,
    getCategories,
    createCategory,
    getCategoryById,
    updateCategory,
    deleteCategory,
    updateDocumentFeatured,
    getSystemStats,
} = require("../controller/admin.controller");

//  thống kê lượt xem hằng tháng
router.get("/viewstatistics", authMiddleware, isAdmin, getViewStatsByMonth);
router.get("/totalinfo", authMiddleware, isAdmin, getSystemStats);
// lấy danh sách người dùng
router.get("/users", authMiddleware, isAdmin, getUsersWithPagination);

// lấy tất cả các tài liệu
router.get("/document", authMiddleware, isAdmin, getDocumentsWithPagination);
router.put("/approveDocument", authMiddleware, isAdmin, approveDocument);
router.put("/rejectDocument", authMiddleware, isAdmin, rejectDocument);
router.put("/featuredDocument", authMiddleware, isAdmin, updateDocumentFeatured);

// Category
router.post("/categories", authMiddleware, isAdmin, createCategory);
router.get("/categories", authMiddleware, isAdmin, getCategories);
router.get("/categories/:categoryId", authMiddleware, isAdmin, getCategoryById);
router.put("/categories/:categoryId", authMiddleware, isAdmin, updateCategory);
router.delete("/categories/:categoryId", authMiddleware, isAdmin, deleteCategory);

module.exports = router;
