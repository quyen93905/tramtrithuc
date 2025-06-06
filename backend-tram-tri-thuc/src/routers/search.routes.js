const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { searchDocuments, filterDocuments } = require("../controller/search.controller");
const router = express.Router();

// Tìm kiếm theo từ khóa
router.get("/", authMiddleware, searchDocuments);

// Lọc nâng cao
router.get("/filter",authMiddleware, filterDocuments);

module.exports = router;
