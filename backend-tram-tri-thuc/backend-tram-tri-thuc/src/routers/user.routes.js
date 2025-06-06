const express = require("express");
const router = express.Router();
const isAdmin = require("../middlewares/isAdmin");
const authMiddleware = require("../middlewares/authMiddleware");
const {
    getUserInfo,
    updateUserInfo,
    getUserHistory,
    getUserFavorites,
    getUsers,
    getUserDownloads,
    deleteMyAccount,
} = require("../controller/user.controller");
const validate = require("../middlewares/validate");
const { query } = require("express-validator");

// Lấy danh sách người dùng(admin)
router.get("/", authMiddleware, isAdmin, getUsers);

// Lấy thông tin cá nhân
router.get("/me", authMiddleware, getUserInfo);

// Cập nhật thông tin cá nhân
router.put("/me", authMiddleware, updateUserInfo);

// Xoá tài khoản
router.delete("/me", authMiddleware, deleteMyAccount);

// Lịch sử xem tài liệu
router.get("/me/history", authMiddleware, getUserHistory);

// Lịch sử tải tài liệu
router.get("/me/downloads", authMiddleware, getUserDownloads);

// Danh sách tài liệu yêu thích
router.get("/me/favorites", authMiddleware, getUserFavorites);

module.exports = router;
