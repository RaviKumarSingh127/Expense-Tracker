const router = require("express").Router();
const multer = require("multer");
const { categorize, getInsights, suggestBudget, chat, scanReceipt, getAnomalies } = require("../controllers/aiController");
const { protect } = require("../middleware/auth");
const { aiLimiter } = require("../middleware/rateLimiter");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG, WebP images allowed"), false);
    }
    cb(null, true);
  },
});

router.use(protect, aiLimiter);

router.post("/categorize", categorize);
router.get("/insights", getInsights);
router.post("/suggest-budget", suggestBudget);
router.post("/chat", chat);
router.post("/scan-receipt", upload.single("receipt"), scanReceipt);
router.get("/anomalies", getAnomalies);

module.exports = router;
