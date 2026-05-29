const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");
const ApiError = require("../utils/ApiError");

const getCurrentMonthStatus = async (userId) => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const [budgets, transactions] = await Promise.all([
    Budget.find({ userId, month, year }).lean(),
    Transaction.find({
      userId,
      type: "expense",
      date: {
        $gte: new Date(year, month - 1, 1),
        $lt: new Date(year, month, 1),
      },
    }).lean(),
  ]);

  const spentByCategory = transactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});

  return budgets.map((b) => {
    const spent = spentByCategory[b.category] || 0;
    const percent = Math.round((spent / b.limit) * 100);
    const daysInMonth = new Date(year, month, 0).getDate();
    const today = now.getDate();
    return {
      ...b,
      spent,
      remaining: Math.max(b.limit - spent, 0),
      percent,
      isOverBudget: spent > b.limit,
      daysRemaining: daysInMonth - today,
    };
  });
};

const getBudgets = async (userId, month, year) => {
  const now = new Date();
  const m = month || now.getMonth() + 1;
  const y = year || now.getFullYear();
  return Budget.find({ userId, month: m, year: y }).lean();
};

const createBudget = async (userId, data) => {
  const existing = await Budget.findOne({
    userId,
    category: data.category,
    month: data.month,
    year: data.year,
  });
  if (existing) throw new ApiError(409, "Budget for this category already exists this month");
  return Budget.create({ ...data, userId });
};

const updateBudget = async (id, userId, data) => {
  const budget = await Budget.findOneAndUpdate(
    { _id: id, userId },
    { $set: data },
    { new: true, runValidators: true }
  ).lean();
  if (!budget) throw new ApiError(404, "Budget not found");
  return budget;
};

const deleteBudget = async (id, userId) => {
  const budget = await Budget.findOneAndDelete({ _id: id, userId });
  if (!budget) throw new ApiError(404, "Budget not found");
  return budget;
};

const bulkCreateBudgets = async (userId, budgets, month, year) => {
  const ops = budgets.map((b) => ({
    updateOne: {
      filter: { userId, category: b.category, month, year },
      update: { $set: { ...b, userId, month, year } },
      upsert: true,
    },
  }));
  return Budget.bulkWrite(ops);
};

module.exports = { getCurrentMonthStatus, getBudgets, createBudget, updateBudget, deleteBudget, bulkCreateBudgets };
