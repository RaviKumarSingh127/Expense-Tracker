const Transaction = require("../models/Transaction");
const { cacheGet, cacheSet } = require("../config/redis");

const getOverview = async (userId) => {
  const cacheKey = `analytics:${userId}:overview`;
  const cached = await cacheGet(cacheKey);
  if (cached) return cached;

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [thisMonth, lastMonth, allTime] = await Promise.all([
    Transaction.aggregate([
      { $match: { userId, date: { $gte: thisMonthStart } } },
      { $group: { _id: "$type", total: { $sum: "$amount" } } },
    ]),
    Transaction.aggregate([
      { $match: { userId, date: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
      { $group: { _id: "$type", total: { $sum: "$amount" } } },
    ]),
    Transaction.aggregate([
      { $match: { userId } },
      { $group: { _id: "$type", total: { $sum: "$amount" } } },
    ]),
  ]);

  const extract = (arr, type) => arr.find((x) => x._id === type)?.total || 0;

  const thisIncome = extract(thisMonth, "income");
  const thisExpense = extract(thisMonth, "expense");
  const lastIncome = extract(lastMonth, "income");
  const lastExpense = extract(lastMonth, "expense");
  const totalIncome = extract(allTime, "income");
  const totalExpense = extract(allTime, "expense");

  const result = {
    balance: totalIncome - totalExpense,
    thisMonth: { income: thisIncome, expense: thisExpense, savings: thisIncome - thisExpense },
    lastMonth: { income: lastIncome, expense: lastExpense },
    savingsRate: thisIncome > 0 ? Math.round(((thisIncome - thisExpense) / thisIncome) * 100) : 0,
    changeVsLastMonth: {
      income: lastIncome > 0 ? Math.round(((thisIncome - lastIncome) / lastIncome) * 100) : 0,
      expense: lastExpense > 0 ? Math.round(((thisExpense - lastExpense) / lastExpense) * 100) : 0,
    },
  };

  await cacheSet(cacheKey, result, 300);
  return result;
};

const getCategoryBreakdown = async (userId, month, year) => {
  const cacheKey = `analytics:${userId}:categories:${month}:${year}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return cached;

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const result = await Transaction.aggregate([
    { $match: { userId, type: "expense", date: { $gte: start, $lte: end } } },
    { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
    { $sort: { total: -1 } },
  ]);

  await cacheSet(cacheKey, result, 300);
  return result;
};

const getMonthlyTrend = async (userId, months = 6) => {
  const cacheKey = `analytics:${userId}:trend:${months}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return cached;

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months + 1);
  startDate.setDate(1);

  const result = await Transaction.aggregate([
    { $match: { userId, date: { $gte: startDate } } },
    {
      $group: {
        _id: { year: { $year: "$date" }, month: { $month: "$date" }, type: "$type" },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const monthMap = {};
  result.forEach(({ _id, total }) => {
    const key = `${_id.year}-${String(_id.month).padStart(2, "0")}`;
    if (!monthMap[key]) monthMap[key] = { month: key, income: 0, expense: 0 };
    monthMap[key][_id.type] = total;
  });

  const trend = Object.values(monthMap);
  await cacheSet(cacheKey, trend, 300);
  return trend;
};

const getDayOfWeekHeatmap = async (userId) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const result = await Transaction.aggregate([
    { $match: { userId, type: "expense", date: { $gte: sixMonthsAgo } } },
    { $group: { _id: { $dayOfWeek: "$date" }, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days.map((day, i) => {
    const found = result.find((r) => r._id === i + 1);
    return { day, total: found?.total || 0, count: found?.count || 0 };
  });
};

const getMonthlySummary = async (userId, month, year) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const result = await Transaction.aggregate([
    { $match: { userId, date: { $gte: start, $lte: end } } },
    { $group: { _id: "$type", total: { $sum: "$amount" }, count: { $sum: 1 } } },
  ]);

  const income = result.find((r) => r._id === "income");
  const expense = result.find((r) => r._id === "expense");

  return {
    income: income?.total || 0,
    expense: expense?.total || 0,
    transactions: (income?.count || 0) + (expense?.count || 0),
    savings: (income?.total || 0) - (expense?.total || 0),
  };
};

module.exports = { getOverview, getCategoryBreakdown, getMonthlyTrend, getDayOfWeekHeatmap, getMonthlySummary };
