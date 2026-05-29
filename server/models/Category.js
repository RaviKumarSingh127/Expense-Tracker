const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    icon: { type: String, required: true },
    color: { type: String, required: true },
    type: { type: String, enum: ["income", "expense", "both"], default: "expense" },
    isDefault: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

categorySchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model("Category", categorySchema);
