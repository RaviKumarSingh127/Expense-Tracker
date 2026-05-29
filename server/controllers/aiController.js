const aiService = require("../services/aiService");
const transactionService = require("../services/transactionService");
const budgetService = require("../services/budgetService");
const SavingsGoal = require("../models/SavingsGoal");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const cloudinary = require("cloudinary").v2;

const categorize = asyncHandler(async (req, res) => {
  const { title, amount, type } = req.body;
  const category = await aiService.categorizeTransaction(title, amount || 0, type || "expense");
  return res.json(new ApiResponse(200, { category }, "Category suggested"));
});

const getInsights = asyncHandler(async (req, res) => {
  const [{ transactions }, budgets] = await Promise.all([
    transactionService.getTransactions(req.user._id, { limit: 100, page: 1 }),
    budgetService.getCurrentMonthStatus(req.user._id),
  ]);
  const insights = await aiService.generateInsights(transactions, budgets, req.user);
  return res.json(new ApiResponse(200, { insights }, "Insights generated"));
});

const suggestBudget = asyncHandler(async (req, res) => {
  const { monthlyIncome } = req.body;
  if (!monthlyIncome || monthlyIncome <= 0) throw new ApiError(400, "Invalid monthly income");

  const budgets = await budgetService.getBudgets(req.user._id);
  const categories = budgets.map((b) => b.category);
  const suggestions = await aiService.suggestBudget(monthlyIncome, categories);
  return res.json(new ApiResponse(200, { suggestions }, "Budget suggestions generated"));
});

const chat = asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message?.trim()) throw new ApiError(400, "Message required");

  const [{ transactions }, budgets, goals] = await Promise.all([
    transactionService.getTransactions(req.user._id, { limit: 100, page: 1 }),
    budgetService.getCurrentMonthStatus(req.user._id),
    SavingsGoal.find({ userId: req.user._id }).lean(),
  ]);

  const reply = await aiService.chat(message, { transactions, budgets, goals });
  return res.json(new ApiResponse(200, { reply }, "AI response"));
});

const scanReceipt = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "Receipt image required");

  let imageBase64 = req.file.buffer.toString("base64");
  let mimeType = req.file.mimetype;

  // Upload to Cloudinary if configured
  if (process.env.CLOUDINARY_URL) {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "flowfin/receipts", resource_type: "image" },
        (err, res) => (err ? reject(err) : resolve(res))
      );
      stream.end(req.file.buffer);
    });
    imageBase64 = result.secure_url;
  }

  const extracted = await aiService.scanReceipt(imageBase64, mimeType);
  return res.json(new ApiResponse(200, { extracted }, "Receipt scanned"));
});

const getAnomalies = asyncHandler(async (req, res) => {
  const { transactions } = await transactionService.getTransactions(req.user._id, { limit: 50, page: 1 });
  const anomalies = await aiService.detectAnomalies(transactions);
  return res.json(new ApiResponse(200, { anomalies }, "Anomalies detected"));
});

module.exports = { categorize, getInsights, suggestBudget, chat, scanReceipt, getAnomalies };
