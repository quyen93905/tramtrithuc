const express = require("express");
const router = express.Router();
const {
    register,
    forgotPassword,
    resetPassword,
    login,
    refreshToken,
    logout,
} = require("../controller/auth.controller");
const authMiddleware = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validate");
const { body } = require("express-validator");
const { forgotPasswordLimiter, loginLimiter } = require("../middlewares/rateLimit");

// API Đăng ký
router.post(
    "/register",
    [
        body("name").notEmpty().trim().withMessage("Tên không được để trống"),
        body("email").isEmail().withMessage("Email không hợp lệ"),
        body("password").isLength({ min: 6 }).withMessage("Mật khẩu phải có ít nhất 6 ký tự"),
        validate,
    ],
    register
);

// API Đăng nhập
router.post(
    "/login",
    [
        body("email").isEmail().withMessage("Email không hợp lệ"),
        body("password").notEmpty().withMessage("Mật khẩu không được để trống"),
        validate,
    ],
    // loginLimiter,
    login
);

// API Quên mật khẩu
router.post(
    "/forgot-password",
    [body("email").isEmail().withMessage("Email không hợp lệ"), validate],
    // forgotPasswordLimiter,
    forgotPassword
);

// API Reset Password
router.post(
    "/reset-password",
    [
        body("token").notEmpty().withMessage("Token không được để trống"),
        body("newPassword")
            .isLength({ min: 6 })
            .withMessage("Mật khẩu mới phải có ít nhất 6 ký tự"),
        validate,
    ],
    resetPassword
);

// API Refresh Token
router.post("/refresh-token", refreshToken);

// API Logout
router.post("/logout", authMiddleware, logout);

module.exports = router;
