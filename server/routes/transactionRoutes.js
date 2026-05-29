const router = require("express").Router();
const Joi = require("joi");
const {
  getTransactions, getTransaction, createTransaction, updateTransaction,
  deleteTransaction, bulkDelete, exportTransactions,
} = require("../controllers/transactionController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");

const transactionSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  amount: Joi.number().min(0).max(200000000).required(),
  type: Joi.string().valid("income", "expense").required(),
  category: Joi.string().required(),
  date: Joi.date().default(Date.now),
  paymentMethod: Joi.string().valid("upi", "cash", "card", "netbanking", "other").default("other"),
  tags: Joi.array().items(Joi.string()).default([]),
  description: Joi.string().max(500).allow("").default(""),
  isRecurring: Joi.boolean().default(false),
  recurringInterval: Joi.string().valid("daily", "weekly", "monthly", "yearly").allow(null, "").default(null),
  merchantName: Joi.string().allow("").default(""),
  location: Joi.string().allow("").default(""),
  subcategory: Joi.string().allow("").default(""),
});

router.use(protect);

router.get("/export", exportTransactions);
router.get("/", getTransactions);
router.post("/", validate(transactionSchema), createTransaction);
router.post("/bulk-delete", bulkDelete);
router.get("/:id", getTransaction);
router.put("/:id", validate(transactionSchema), updateTransaction);
router.delete("/:id", deleteTransaction);

module.exports = router;
