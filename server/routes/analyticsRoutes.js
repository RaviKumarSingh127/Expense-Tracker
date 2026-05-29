const router = require("express").Router();
const {
  getOverview, getCategoryBreakdown, getMonthlyTrend, getMonthlySummary, getDayHeatmap,
} = require("../controllers/analyticsController");
const { protect } = require("../middleware/auth");
const cacheMiddleware = require("../middleware/cache");

router.use(protect);

router.get("/overview", cacheMiddleware((req) => `analytics:${req.user._id}:overview`, 300), getOverview);
router.get("/categories", getCategoryBreakdown);
router.get("/trends", getMonthlyTrend);
router.get("/monthly-summary", getMonthlySummary);
router.get("/heatmap", getDayHeatmap);

module.exports = router;
