const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, minlength: 8, select: false },
    avatar: { type: String, default: "" },
    googleId: { type: String, select: false },
    refreshToken: { type: String, select: false },
    currency: { type: String, default: "INR" },
    dateFormat: { type: String, default: "DD/MM/YYYY" },
    weekStart: { type: String, enum: ["monday", "sunday"], default: "monday" },
    theme: { type: String, enum: ["dark", "light"], default: "dark" },
    budgetAlertThreshold: { type: Number, default: 80, min: 1, max: 100 },
    aiEnabled: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.googleId;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
