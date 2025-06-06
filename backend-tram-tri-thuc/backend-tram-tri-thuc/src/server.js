const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db.config.js");
const http = require("http");
const socketIo = require("socket.io");

dotenv.config();

// Cấu hình CORS
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173", // Origin của frontend
  credentials: true, // Cho phép gửi cookie/credentials
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // Các method được phép
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Cache-Control",
    "Pragma",
    "Expires",
  ], // Headers được phép
};

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
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
  logger.info(
    `Request: ${req.method} ${req.originalUrl} from ${req.user?.email || "anonymous"}`
  );
  next();
});

// Vô hiệu hóa caching cho tất cả API
app.use((req, res, next) => {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  next();
});

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Xử lý preflight request
app.use(cookieParser());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Import routes
const admin = require("./routers/admin.routes.js");
const apiRoutes = require("./routers/index.js");
const logger = require("./utils/logger.js");
app.use("/api/v1", apiRoutes);
app.use("/api/v1/admin", admin);

app.get("/", (req, res) => {
  res.send("Backend API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
