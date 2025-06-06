const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            validate: {
                validator: function (v) {
                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
                },
                message: (props) => `${props.value} is not a valid email!`,
            },
        },
        password: {
            type: String,
            required: function () {
                return !this.googleId; // Chỉ bắt buộc nếu không dùng Google OAuth
            },
        },

        avatar: { type: String, default: null },
        token: { type: String, default: null }, // Token để xác minh email, refresh token hoặc logout
        resetToken: { type: String, default: null }, // Reset mật khẩu
        resetTokenExpires: { type: Date, default: null },
        role: { type: String, enum: ["admin", "uploader", "member"], default: "member" },
        isActive: { type: Boolean, default: true }, // Trạng thái hoạt động
    },
    { timestamps: true }
);

userSchema.index({ resetTokenExpires: 1 }, { expireAfterSeconds: 0 });

const User = mongoose.models.User || mongoose.model("User", userSchema);
module.exports = User;
