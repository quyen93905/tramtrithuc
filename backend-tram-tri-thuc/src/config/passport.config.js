const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user.model");
const logger = require("../utils/logger");

// Kiểm tra biến môi trường
if (!process.env.GOOGLE_OAUTH_CLIENT_ID || !process.env.GOOGLE_OAUTH_CLIENT_SECRET) {
    throw new Error(
        "Missing GOOGLE_OAUTH_CLIENT_ID or GOOGLE_OAUTH_CLIENT_SECRET in environment variables"
    );
}

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_OAUTH_CLIENT_ID,
            clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_OAUTH_REDIRECT_URI,
            scope: ["profile", "email"],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Kiểm tra nếu không có email từ Google
                if (!profile.emails || !profile.emails[0]?.value) {
                    logger.error("Google OAuth: No email provided by Google");
                    return done(new Error("No email provided by Google"), null);
                }

                const email = profile.emails[0].value;
                const avatar =
                    profile.photos && profile.photos[0]?.value ? profile.photos[0].value : null;
                let user = await User.findOne({ email });

                if (user) {
                    // Cập nhật googleId, avatar, và token nếu cần
                    if (!user.googleId) {
                        user.googleId = profile.id;
                    }
                    user.avatar = avatar || user.avatar;
                    await user.save();
                } else {
                    // Tạo user mới
                    user = new User({
                        name: profile.displayName || "Unknown",
                        email,
                        googleId: profile.id,
                        avatar,
                        isEmailVerified: true,
                    });
                    await user.save();
                }
                logger.info("Google OAuth: User authenticated", { email: user.email });
                done(null, user);
            } catch (error) {
                logger.error("Google OAuth error", { error: error.message });
                done(error, null);
            }
        }
    )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;
