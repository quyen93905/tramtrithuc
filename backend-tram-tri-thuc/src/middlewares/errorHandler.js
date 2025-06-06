/**
 * Middleware bắt lỗi toàn cục và trả về JSON chuẩn hóa.
 * Dùng ở cuối middleware chain.
 */
function errorHandler(err, req, res, next) {
    console.error(err);
    res.status(err.status || 500).json({
        message: err.message || "Internal Server Error",
    });
}

module.exports = errorHandler;
