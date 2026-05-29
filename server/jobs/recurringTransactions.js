const cron = require("node-cron");
const Transaction = require("../models/Transaction");
const logger = require("../config/logger");

const processRecurringTransactions = async () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  try {
    const due = await Transaction.find({
      isRecurring: true,
      nextRecurringDate: { $lte: now },
    }).lean();

    logger.info(`Processing ${due.length} recurring transactions`);

    for (const t of due) {
      const { _id, createdAt, updatedAt, nextRecurringDate, ...data } = t;

      const nextDate = new Date(nextRecurringDate || now);
      switch (t.recurringInterval) {
        case "daily":   nextDate.setDate(nextDate.getDate() + 1); break;
        case "weekly":  nextDate.setDate(nextDate.getDate() + 7); break;
        case "monthly": nextDate.setMonth(nextDate.getMonth() + 1); break;
        case "yearly":  nextDate.setFullYear(nextDate.getFullYear() + 1); break;
        default: continue;
      }

      await Promise.all([
        Transaction.create({ ...data, date: now, isRecurring: false, nextRecurringDate: null }),
        Transaction.findByIdAndUpdate(_id, { nextRecurringDate: nextDate }),
      ]);

      logger.info({ event: "recurring_created", title: t.title, userId: t.userId });
    }
  } catch (err) {
    logger.error("Recurring transaction job failed:", err.message);
  }
};

const start = () => {
  // Run every day at midnight
  cron.schedule("0 0 * * *", processRecurringTransactions, { timezone: "Asia/Kolkata" });
  logger.info("Recurring transactions job scheduled");
};

module.exports = { start, processRecurringTransactions };
