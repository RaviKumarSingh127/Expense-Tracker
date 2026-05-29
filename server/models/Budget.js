const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    category: { type: String, required: true },
    limit: { type: Number, required: true, min: 0 },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    alertSentAt: { type: Date, default: null },
    color: { type: String, default: "#7C3AED" },
    icon: { type: String, default: "💰" },
  },
  { timestamps: true }
);

budgetSchema.index({ userId: 1, month: 1, year: 1 });
budgetSchema.index({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("Budget", budgetSchema);
