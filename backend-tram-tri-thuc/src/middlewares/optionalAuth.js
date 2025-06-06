const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const optionalAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded._id).select("-password");
        } catch (err) {
            console.warn("Token invalid, skipping user attach");
        }
    }

    next(); // Luôn cho qua dù có token hay không
};

module.exports = optionalAuth;
