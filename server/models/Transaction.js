const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ["income", "expense"], required: true, index: true },
    category: { type: String, required: true, index: true },
    subcategory: { type: String, default: "" },
    date: { type: Date, required: true, default: Date.now, index: true },
    paymentMethod: {
      type: String,
      enum: ["upi", "cash", "card", "netbanking", "other"],
      default: "other",
    },
    tags: [{ type: String, trim: true }],
    description: { type: String, maxlength: 500, default: "" },
    receiptUrl: { type: String, default: "" },
    isRecurring: { type: Boolean, default: false },
    recurringInterval: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly", null],
      default: null,
    },
    nextRecurringDate: { type: Date, default: null },
    aiCategorized: { type: Boolean, default: false },
    merchantName: { type: String, default: "" },
    location: { type: String, default: "" },
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1, date: -1 });

module.exports = mongoose.model("Transaction", transactionSchema);
