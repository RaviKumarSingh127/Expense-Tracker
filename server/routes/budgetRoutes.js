const router = require("express").Router();
const {
  getBudgets, getBudgetStatus, createBudget, updateBudget, deleteBudget, bulkCreateBudgets,
} = require("../controllers/budgetController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/", getBudgets);
router.get("/status", getBudgetStatus);
router.post("/", createBudget);
router.post("/bulk", bulkCreateBudgets);
router.put("/:id", updateBudget);
router.delete("/:id", deleteBudget);

module.exports = router;
