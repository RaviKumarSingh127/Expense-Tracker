const budgetService = require("../services/budgetService");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const getBudgets = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const budgets = await budgetService.getBudgets(req.user._id, month, year);
  return res.json(new ApiResponse(200, { budgets }, "Budgets fetched"));
});

const getBudgetStatus = asyncHandler(async (req, res) => {
  const status = await budgetService.getCurrentMonthStatus(req.user._id);
  return res.json(new ApiResponse(200, { status }, "Budget status fetched"));
});

const createBudget = asyncHandler(async (req, res) => {
  const budget = await budgetService.createBudget(req.user._id, req.body);
  return res.status(201).json(new ApiResponse(201, { budget }, "Budget created"));
});

const updateBudget = asyncHandler(async (req, res) => {
  const budget = await budgetService.updateBudget(req.params.id, req.user._id, req.body);
  return res.json(new ApiResponse(200, { budget }, "Budget updated"));
});

const deleteBudget = asyncHandler(async (req, res) => {
  await budgetService.deleteBudget(req.params.id, req.user._id);
  return res.json(new ApiResponse(200, {}, "Budget deleted"));
});

const bulkCreateBudgets = asyncHandler(async (req, res) => {
  const { budgets, month, year } = req.body;
  await budgetService.bulkCreateBudgets(req.user._id, budgets, month, year);
  return res.json(new ApiResponse(200, {}, "Budgets saved successfully"));
});

module.exports = { getBudgets, getBudgetStatus, createBudget, updateBudget, deleteBudget, bulkCreateBudgets };
