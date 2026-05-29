const Transaction = require("../models/Transaction");
const ApiError = require("../utils/ApiError");
const { cacheDel } = require("../config/redis");

const buildFilter = (userId, query) => {
  const filter = { userId };
  const { type, category, startDate, endDate, minAmount, maxAmount, tags, paymentMethod, search } = query;

  if (type && ["income", "expense"].includes(type)) filter.type = type;
  if (category) filter.category = { $in: Array.isArray(category) ? category : [category] };
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }
  if (minAmount || maxAmount) {
    filter.amount = {};
    if (minAmount) filter.amount.$gte = Number(minAmount);
    if (maxAmount) filter.amount.$lte = Number(maxAmount);
  }
  if (tags) filter.tags = { $in: Array.isArray(tags) ? tags : [tags] };
  if (paymentMethod) filter.paymentMethod = paymentMethod;
  if (search) filter.title = { $regex: search, $options: "i" };

  return filter;
};

const getTransactions = async (userId, query) => {
  const { page = 1, limit = 20, sortBy = "date", sortOrder = "desc" } = query;
  const filter = buildFilter(userId, query);
  const skip = (Number(page) - 1) * Number(limit);
  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const [transactions, total] = await Promise.all([
    Transaction.find(filter).sort(sort).skip(skip).limit(Number(limit)).lean(),
    Transaction.countDocuments(filter),
  ]);

  return {
    transactions,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

const getTransactionById = async (id, userId) => {
  const transaction = await Transaction.findOne({ _id: id, userId }).lean();
  if (!transaction) throw new ApiError(404, "Transaction not found");
  return transaction;
};

const createTransaction = async (userId, data) => {
  const transaction = await Transaction.create({ ...data, userId });
  await cacheDel(`analytics:${userId}:*`);
  return transaction;
};

const updateTransaction = async (id, userId, data) => {
  const transaction = await Transaction.findOneAndUpdate(
    { _id: id, userId },
    { $set: data },
    { new: true, runValidators: true }
  ).lean();
  if (!transaction) throw new ApiError(404, "Transaction not found");
  await cacheDel(`analytics:${userId}:*`);
  return transaction;
};

const deleteTransaction = async (id, userId) => {
  const transaction = await Transaction.findOneAndDelete({ _id: id, userId });
  if (!transaction) throw new ApiError(404, "Transaction not found");
  await cacheDel(`analytics:${userId}:*`);
  return transaction;
};

const bulkDelete = async (ids, userId) => {
  const result = await Transaction.deleteMany({ _id: { $in: ids }, userId });
  await cacheDel(`analytics:${userId}:*`);
  return { deleted: result.deletedCount };
};

const getRecentTransactions = async (userId, limit = 8) => {
  return Transaction.find({ userId }).sort({ date: -1 }).limit(limit).lean();
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  bulkDelete,
  getRecentTransactions,
};
