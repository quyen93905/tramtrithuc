const winston = require("winston");

const logger = winston.createLogger({
    level: "info",// Ghi tất cả log từ info trở lên (info, warn, error)
    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),// Thêm thời gian
        winston.format.json()// Định dạng JSON cho log
    ),
    transports: [
        // Ghi lỗi vào error.log
        new winston.transports.File({ filename: "logs/error.log", level: "error" }),
        // Ghi tất cả log vào combined.log
        new winston.transports.File({ filename: "logs/combined.log" }),
        // Hiển thị log trên console
        new winston.transports.Console(),
    ],
});

// Tạo thư mục logs nếu chưa tồn tại
const fs = require("fs");
if (!fs.existsSync("logs")) {
    fs.mkdirSync("logs");
}

module.exports = logger;
