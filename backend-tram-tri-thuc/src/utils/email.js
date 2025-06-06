const nodemailer = require("nodemailer");
const logger = require("./logger");

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_USER, // Ví dụ: your-email@gmail.com
        pass: process.env.EMAIL_PASS, // App Password từ Gmail
    },
});

exports.sendResetPasswordEmail = async (email, resetLink) => {
    try {
        await transporter.sendMail({
            from: `"Thư viện tài liệu" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Đặt lại mật khẩu",
            html: `
                <p>Xin chào,</p>
                <p>Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng nhấn vào liên kết dưới đây để tiếp tục:</p>
                <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Đặt lại mật khẩu</a>
                <p>Liên kết này sẽ hết hạn sau 10 phút.</p>
                <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
                <p>Trân trọng,<br>Đội ngũ Thư viện tài liệu</p>
            `,
        });
        logger.info(`Reset password email sent to: ${email}`);
    } catch (error) {
        logger.error(`Error sending reset password email: ${error.message}`);
        throw new Error("Không thể gửi email đặt lại mật khẩu.");
    }
};
