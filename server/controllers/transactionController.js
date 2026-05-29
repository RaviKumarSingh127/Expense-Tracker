const transactionService = require("../services/transactionService");
const exportService = require("../services/exportService");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const getTransactions = asyncHandler(async (req, res) => {
  const result = await transactionService.getTransactions(req.user._id, req.query);
  return res.json({
    success: true,
    message: "Transactions fetched",
    data: result.transactions,
    pagination: result.pagination,
  });
});

const getTransaction = asyncHandler(async (req, res) => {
  const transaction = await transactionService.getTransactionById(req.params.id, req.user._id);
  return res.json(new ApiResponse(200, { transaction }, "Transaction fetched"));
});

const createTransaction = asyncHandler(async (req, res) => {
  const transaction = await transactionService.createTransaction(req.user._id, req.body);
  return res.status(201).json(new ApiResponse(201, { transaction }, "Transaction created"));
});

const updateTransaction = asyncHandler(async (req, res) => {
  const transaction = await transactionService.updateTransaction(req.params.id, req.user._id, req.body);
  return res.json(new ApiResponse(200, { transaction }, "Transaction updated"));
});

const deleteTransaction = asyncHandler(async (req, res) => {
  await transactionService.deleteTransaction(req.params.id, req.user._id);
  return res.json(new ApiResponse(200, {}, "Transaction deleted"));
});

const bulkDelete = asyncHandler(async (req, res) => {
  const { ids } = req.body;
  const result = await transactionService.bulkDelete(ids, req.user._id);
  return res.json(new ApiResponse(200, result, `${result.deleted} transactions deleted`));
});

const exportTransactions = asyncHandler(async (req, res) => {
  const { format = "csv" } = req.query;
  const { transactions } = await transactionService.getTransactions(req.user._id, {
    ...req.query,
    limit: 10000,
    page: 1,
  });

  if (format === "pdf") {
    const pdf = await exportService.exportPDF(transactions, req.user);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="flowfin-transactions.pdf"');
    return res.send(pdf);
  }

  const csv = exportService.exportCSV(transactions);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="flowfin-transactions.csv"');
  return res.send(csv);
});

module.exports = { getTransactions, getTransaction, createTransaction, updateTransaction, deleteTransaction, bulkDelete, exportTransactions };
