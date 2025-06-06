const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, "../../Uploads");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        // PDF
        "application/pdf",
        // Images
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        // Office Documents
        "application/msword", // .doc
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
        "application/vnd.ms-excel", // .xls
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
        "application/vnd.ms-powerpoint", // .ppt
        "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
        // Media
        "video/mp4",
        "video/webm",
        "audio/mpeg", // .mp3
        "audio/wav",
        // Text
        "text/plain",
        // Archives
        "application/zip",
        "application/x-rar-compressed",
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Chỉ hỗ trợ file PDF, JPEG, PNG, DOCX, PPTX, ZIP."), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 25 * 1024 * 1024 }, // Giới hạn 25MB
}).fields([
    { name: "file", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
]);

module.exports = upload;
