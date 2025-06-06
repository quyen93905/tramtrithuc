const express = require("express");
const router = express.Router();
const {
    getCategories,
    getCategoryBySlug,
    createCategory,
    updateCategory,
    deleteCategory,
} = require("../controller/category.controller");
const validate = require("../middlewares/validate");
const isAdmin = require("../middlewares/isAdmin");
const authMiddleware = require("../middlewares/authMiddleware");
const { body, param, query } = require("express-validator");
const { categoryListLimiter } = require("../middlewares/rateLimit");

// Lấy danh sách tất cả danh mục
router.get(
    "/",
    [
        query("page").optional().isInt({ min: 1 }).toInt().withMessage("Invalid page number"),
        query("limit").optional().isInt({ min: 1, max: 100 }).toInt().withMessage("Invalid limit"),
        validate,
    ],
    categoryListLimiter,
    getCategories
);

// Lấy thông tin chi tiết của danh mục theo slug
router.get(
    "/:slug",
    [param("slug").notEmpty().trim().withMessage("Slug is required"), validate],
    getCategoryBySlug
);

// Tạo mới một danh mục (chỉ dành cho admin)
router.post(
    "/",
    authMiddleware,
    isAdmin,
    [
        body("name")
            .notEmpty()
            .trim()
            .isLength({ max: 100 })
            .withMessage("Name is required and must not exceed 100 characters"),
        body("slug")
            .notEmpty()
            .trim()
            .matches(/^[a-z0-9-]+$/)
            .withMessage("Slug must contain only lowercase letters, numbers, and hyphens"),
        body("description")
            .optional()
            .isLength({ max: 500 })
            .withMessage("Description must not exceed 500 characters"),
        body("slug").custom(async (value) => {
            const existingCategory = await require("../models/category.model").findOne({
                slug: value,
            });
            if (existingCategory) throw new Error("Slug already exists");
            return true;
        }),
        validate,
    ],
    createCategory
);

// Cập nhật thông tin danh mục theo ID (chỉ dành cho admin)
router.patch(
    "/:id",
    authMiddleware,
    isAdmin,
    [
        param("id").isMongoId().withMessage("Invalid category ID"),
        body("name")
            .optional()
            .trim()
            .isLength({ max: 100 })
            .withMessage("Name must not exceed 100 characters"),
        body("slug")
            .optional()
            .trim()
            .matches(/^[a-z0-9-]+$/)
            .withMessage("Slug must contain only lowercase letters, numbers, and hyphens"),
        body("description")
            .optional()
            .isLength({ max: 500 })
            .withMessage("Description must not exceed 500 characters"),
        body("slug")
            .optional()
            .custom(async (value, { req }) => {
                const existingCategory = await require("../models/category.model").findOne({
                    slug: value,
                    _id: { $ne: req.params.id },
                });
                if (existingCategory) throw new Error("Slug already exists");
                return true;
            }),
        validate,
    ],
    updateCategory
);

// Xóa danh mục theo ID (chỉ dành cho admin)
router.delete(
    "/:id",
    authMiddleware,
    isAdmin,
    [param("id").isMongoId().withMessage("Invalid category ID"), validate],
    deleteCategory
);

module.exports = router;
