const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { generateTokens, setRefreshTokenCookie } = require("../middleware/auth");

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) throw new ApiError(409, "Email already registered");

  const user = await User.create({ name, email, password });
  const { accessToken, refreshToken } = generateTokens(user._id);

  await User.findByIdAndUpdate(user._id, { refreshToken });
  setRefreshTokenCookie(res, refreshToken);

  return res.status(201).json(
    new ApiResponse(201, { user, accessToken }, "Account created successfully")
  );
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.isActive) throw new ApiError(403, "Account deactivated");

  const { accessToken, refreshToken } = generateTokens(user._id);
  await User.findByIdAndUpdate(user._id, { refreshToken });
  setRefreshTokenCookie(res, refreshToken);

  const userObj = user.toJSON();
  return res.json(new ApiResponse(200, { user: userObj, accessToken }, "Login successful"));
});

const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { refreshToken: "" });
  res.clearCookie("refreshToken");
  return res.json(new ApiResponse(200, {}, "Logged out successfully"));
});

const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) throw new ApiError(401, "No refresh token");

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id).select("+refreshToken");
  if (!user || user.refreshToken !== token) throw new ApiError(401, "Invalid refresh token");

  const { accessToken, refreshToken: newRefresh } = generateTokens(user._id);
  await User.findByIdAndUpdate(user._id, { refreshToken: newRefresh });
  setRefreshTokenCookie(res, newRefresh);

  return res.json(new ApiResponse(200, { accessToken }, "Token refreshed"));
});

const getMe = asyncHandler(async (req, res) => {
  return res.json(new ApiResponse(200, { user: req.user }, "User fetched"));
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.comparePassword(currentPassword))) {
    throw new ApiError(400, "Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  return res.json(new ApiResponse(200, {}, "Password changed successfully"));
});

const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ["name", "currency", "dateFormat", "weekStart", "theme", "budgetAlertThreshold", "aiEnabled", "emailNotifications"];
  const updates = {};
  allowed.forEach((field) => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });

  const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true });
  return res.json(new ApiResponse(200, { user }, "Profile updated"));
});

module.exports = { register, login, logout, refreshToken, getMe, changePassword, updateProfile };
