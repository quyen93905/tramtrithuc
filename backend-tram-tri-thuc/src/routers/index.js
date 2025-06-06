// routes/index.js
const express = require("express");
const router = express.Router();
const documentRoutes = require("./document.routes");
const adminRoutes = require("./admin.routes");
const authRoutes = require("./auth.routes");
const usersRoutes = require("./user.routes");
const categoryRoutes = require("./category.routes");
const ratingCommentRoutes = require("./ratingComment.routes");
const notificationRoutes = require("./notification.routes");

router.use("/admin", adminRoutes);
router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/documents", documentRoutes);
router.use("/", notificationRoutes);
router.use("/", ratingCommentRoutes);
router.use("/users", usersRoutes);



module.exports = router;
