require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const cors = require("cors");
const connectDB = require("./config/db.config.js");
const http = require("http");
const socketIo = require("socket.io");
const apiRoutes = require("./routers/index.js");

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    // nếu có thể, thêm các domain production hoặc staging tại đây
];

// Cấu hình CORS
const corsOptions = {
    origin: function (origin, callback) {
        // Nếu không có origin (ví dụ: request từ Postman) thì cho phép
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("CORS policy: This origin is not allowed."));
        }
    },
    credentials: true, // Cho phép gửi cookie/credentials
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // Các method được phép
    allowedHeaders: ["Content-Type", "Authorization", "Cache-Control", "Pragma", "Expires"], // Headers được phép
};

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
    },
});

// Middleware để lưu socket.io instance vào req
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Kết nối WebSocket
io.on("connection", (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    // Client gửi userId để tham gia room
    socket.on("join", (userId) => {
        socket.join(userId);
        logger.info(`User ${userId} joined room`);
    });

    socket.on("disconnect", () => {
        logger.info(`Client disconnected: ${socket.id}`);
    });
});

// Log request để debug
app.use((req, res, next) => {
    logger.info(`Request: ${req.method} ${req.originalUrl} from ${req.user?.email || "anonymous"}`);
    next();
});

// Vô hiệu hóa caching cho tất cả API
app.use((req, res, next) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");
    next();
});

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Xử lý preflight request
app.use(cookieParser());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Connect to MongoDB
connectDB();

// Import routes
const logger = require("./utils/logger.js");
app.use("/api/v1", apiRoutes);

app.get("/", (req, res) => {
    res.send("Backend API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
