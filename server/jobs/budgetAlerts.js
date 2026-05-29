const cron = require("node-cron");
const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const { sendBudgetAlert } = require("../services/notificationService");
const logger = require("../config/logger");

const checkBudgetAlerts = async () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const monthStart = new Date(year, month - 1, 1);

  try {
    const budgets = await Budget.find({ month, year }).lean();

    const userIds = [...new Set(budgets.map((b) => b.userId.toString()))];

    for (const userId of userIds) {
      const [user, expenses] = await Promise.all([
        User.findById(userId).lean(),
        Transaction.find({ userId, type: "expense", date: { $gte: monthStart } }).lean(),
      ]);

      if (!user?.emailNotifications) continue;

      const threshold = user.budgetAlertThreshold || 80;
      const spentByCategory = expenses.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});

      const userBudgets = budgets.filter((b) => b.userId.toString() === userId);

      for (const budget of userBudgets) {
        const spent = spentByCategory[budget.category] || 0;
        const percent = Math.round((spent / budget.limit) * 100);

        if (percent >= threshold && !budget.alertSentAt) {
          await sendBudgetAlert(user, budget, percent);
          await Budget.findByIdAndUpdate(budget._id, { alertSentAt: now });
          logger.info({ event: "budget_alert_sent", userId, category: budget.category, percent });
        }
      }
    }
  } catch (err) {
    logger.error("Budget alert job failed:", err.message);
  }
};

const start = () => {
  // Run every 6 hours
  cron.schedule("0 */6 * * *", checkBudgetAlerts, { timezone: "Asia/Kolkata" });
  logger.info("Budget alerts job scheduled");
};

module.exports = { start, checkBudgetAlerts };
