const mongoose = require("mongoose");

const contributionSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 0 },
    note: { type: String, default: "" },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

const savingsGoalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    emoji: { type: String, default: "🎯" },
    targetAmount: { type: Number, required: true, min: 1 },
    savedAmount: { type: Number, default: 0, min: 0 },
    targetDate: { type: Date, required: true },
    contributions: [contributionSchema],
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    linkedBudgetCategory: { type: String, default: null },
    monthlyTarget: { type: Number, default: 0 },
  },
  { timestamps: true }
);

savingsGoalSchema.virtual("progressPercent").get(function () {
  return Math.min(Math.round((this.savedAmount / this.targetAmount) * 100), 100);
});

savingsGoalSchema.virtual("remaining").get(function () {
  return Math.max(this.targetAmount - this.savedAmount, 0);
});

savingsGoalSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("SavingsGoal", savingsGoalSchema);
