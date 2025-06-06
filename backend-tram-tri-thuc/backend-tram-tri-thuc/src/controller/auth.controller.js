const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");
const crypto = require("crypto");
const { sendResetPasswordEmail } = require("../utils/email");

// Helper tạo token
const createAccessToken = (user) =>
    jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_ACCESS_EXPIRES || "1h",
    });

const createRefreshToken = (user) =>
    jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d",
    });

// ====================== [POST] /register ======================
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email đã được đăng ký.",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });

        await newUser.save();
        logger.info(`User registered: ${email}`);

        res.status(201).json({
            success: true,
            message: "Đăng ký thành công!",
            data: { userId: newUser._id, email: newUser.email },
        });
    } catch (error) {
        logger.error("Register error:", error);
        res.status(500).json({ success: false, message: "Đăng ký thất bại." });
    }
};

// ====================== [POST] /login ======================
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !user.password) {
            return res.status(401).json({
                success: false,
                message: "Email không tồn tại hoặc tài khoản không hợp lệ.",
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Tài khoản của bạn đã bị vô hiệu hóa.",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Sai mật khẩu.",
            });
        }

        const accessToken = createAccessToken(user);
        const refreshToken = createRefreshToken(user);

        user.token = refreshToken;
        await user.save();

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
            sameSite: "strict",
        });

        logger.info(`User login: ${user.email} | role: ${user.role}`);
        res.status(200).json({
            success: true,
            message: "Đăng nhập thành công!",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar,
                },
                accessToken,
            },
        });
    } catch (error) {
        logger.error("Login error:", { error: error.message });
        res.status(500).json({ success: false, message: "Đăng nhập thất bại." });
    }
};

// ====================== [POST] /forgot-password ======================
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy tài khoản với email này.",
            });
        }

        const token = crypto.randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 1000 * 60 * 10); // 10 phút

        // Gửi email reset password

        user.resetToken = token;
        user.resetTokenExpires = expires;
        await user.save();

        // Tạo link reset password
        const resetLink = `${process.env.CLIENT_URL}/auth/reset-password?token=${token}`;
        await sendResetPasswordEmail(email, resetLink);

        // TODO: Gửi email ở đây (chưa tích hợp)
        logger.info(`Password reset token created and email sent to: ${email}`);
        res.status(200).json({
            success: true,
            message: "Link đặt lại mật khẩu đã được gửi tới email của bạn.",
        });
    } catch (error) {
        logger.error("Forgot password error:", error);
        res.status(500).json({ success: false, message: "Không thể gửi yêu cầu." });
    }
};

// ====================== [POST] /reset-password ======================
exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Token không hợp lệ hoặc đã hết hạn.",
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetToken = null;
        user.resetTokenExpires = null;

        await user.save();
        logger.info(`Password reset successful for: ${user.email}`);
        res.status(200).json({
            success: true,
            message: "Mật khẩu đã được đặt lại thành công.",
        });
    } catch (error) {
        logger.error("Reset password error:", error);
        res.status(500).json({ success: false, message: "Không thể đặt lại mật khẩu." });
    }
};

// ====================== [POST] /refresh-token ======================
exports.refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: "Thiếu refreshToken.",
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({
                    success: false,
                    message: "RefreshToken đã hết hạn.",
                });
            }
            return res.status(401).json({
                success: false,
                message: "RefreshToken không hợp lệ.",
            });
        }

        const user = await User.findById(decoded.id);
        if (!user || user.token !== refreshToken) {
            logger.warn(`Refresh token không hợp lệ cho userId: ${decoded.id}`);
            return res.status(403).json({
                success: false,
                message: "RefreshToken không hợp lệ hoặc đã bị thu hồi.",
            });
        }

        const accessToken = createAccessToken(user);
        logger.info(`Access token refreshed for userId: ${user._id}`);
        res.status(200).json({
            success: true,
            message: "Làm mới token thành công.",
            data: { accessToken },
        });
    } catch (error) {
        logger.error("Refresh token error:", { error: error.message });
        res.status(500).json({
            success: false,
            message: "Không thể làm mới token.",
        });
    }
};

// ====================== [POST] /logout ======================
exports.logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: "Thiếu refreshToken để đăng xuất.",
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "RefreshToken không hợp lệ.",
            });
        }

        const user = await User.findById(decoded.id);
        if (!user || user.token !== refreshToken) {
            return res.status(403).json({
                success: false,
                message: "RefreshToken không hợp lệ.",
            });
        }

        user.token = null;
        await user.save();

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        logger.info(`User logged out: ${user.email}`);
        res.status(200).json({
            success: true,
            message: "Đăng xuất thành công.",
        });
    } catch (error) {
        logger.error("Logout error:", { error: error.message });
        res.status(500).json({
            success: false,
            message: "Đăng xuất thất bại.",
        });
    }
};
