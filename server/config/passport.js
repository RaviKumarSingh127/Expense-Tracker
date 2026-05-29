const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
const logger = require("./logger");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const avatar = profile.photos?.[0]?.value;

        // Try to find by googleId first, then by email
        let user = await User.findOne({ googleId: profile.id }).select("+googleId");

        if (!user && email) {
          user = await User.findOne({ email }).select("+googleId");
        }

        if (user) {
          // Update googleId and avatar if missing
          if (!user.googleId || !user.avatar) {
            user.googleId = profile.id;
            if (!user.avatar && avatar) user.avatar = avatar;
            await user.save();
          }
          return done(null, user);
        }

        // Create new user
        user = await User.create({
          name: profile.displayName,
          email,
          googleId: profile.id,
          avatar: avatar || "",
        });

        logger.info({ event: "google_oauth_register", userId: user._id, email });
        return done(null, user);
      } catch (err) {
        logger.error("Google OAuth error:", err.message);
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
