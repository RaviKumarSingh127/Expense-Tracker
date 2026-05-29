const analyticsService = require("../services/analyticsService");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const getOverview = asyncHandler(async (req, res) => {
  const data = await analyticsService.getOverview(req.user._id);
  return res.json(new ApiResponse(200, data, "Overview fetched"));
});

const getCategoryBreakdown = asyncHandler(async (req, res) => {
  const now = new Date();
  const month = Number(req.query.month) || now.getMonth() + 1;
  const year = Number(req.query.year) || now.getFullYear();
  const data = await analyticsService.getCategoryBreakdown(req.user._id, month, year);
  return res.json(new ApiResponse(200, { categories: data }, "Categories fetched"));
});

const getMonthlyTrend = asyncHandler(async (req, res) => {
  const months = Number(req.query.months) || 6;
  const data = await analyticsService.getMonthlyTrend(req.user._id, months);
  return res.json(new ApiResponse(200, { trend: data }, "Trend fetched"));
});

const getMonthlySummary = asyncHandler(async (req, res) => {
  const now = new Date();
  const month = Number(req.query.month) || now.getMonth() + 1;
  const year = Number(req.query.year) || now.getFullYear();
  const data = await analyticsService.getMonthlySummary(req.user._id, month, year);
  return res.json(new ApiResponse(200, data, "Monthly summary fetched"));
});

const getDayHeatmap = asyncHandler(async (req, res) => {
  const data = await analyticsService.getDayOfWeekHeatmap(req.user._id);
  return res.json(new ApiResponse(200, { heatmap: data }, "Heatmap fetched"));
});

module.exports = { getOverview, getCategoryBreakdown, getMonthlyTrend, getMonthlySummary, getDayHeatmap };
