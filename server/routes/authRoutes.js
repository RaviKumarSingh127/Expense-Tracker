const router = require("express").Router();
const Joi = require("joi");
const passport = require("passport");
const { register, login, logout, refreshToken, getMe, changePassword, updateProfile } = require("../controllers/authController");
const { protect, generateTokens, setRefreshTokenCookie } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiter");
const validate = require("../middleware/validate");
const User = require("../models/User");

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
});

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/logout", protect, logout);
router.post("/refresh-token", refreshToken);
router.get("/me", protect, getMe);
router.patch("/change-password", protect, validate(changePasswordSchema), changePassword);
router.patch("/profile", protect, updateProfile);

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed` }),
  async (req, res) => {
    try {
      const { accessToken, refreshToken: newRefresh } = generateTokens(req.user._id);
      await User.findByIdAndUpdate(req.user._id, { refreshToken: newRefresh });
      setRefreshTokenCookie(res, newRefresh);
      res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/auth/callback?token=${accessToken}`);
    } catch (err) {
      res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }
  }
);

module.exports = router;
