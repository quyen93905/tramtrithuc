// config/jwt.config.js
module.exports = {
    ACCESS_TOKEN_EXPIRES: process.env.JWT_ACCESS_EXPIRES || "1h",
    REFRESH_TOKEN_EXPIRES: process.env.JWT_REFRESH_EXPIRES || "7d",
    RESET_TOKEN_EXPIRES: process.env.JWT_RESET_EXPIRES || "10m",
};
