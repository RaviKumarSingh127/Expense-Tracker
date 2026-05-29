const logger = require("../config/logger");

// Placeholder for email notification — integrate with SendGrid/Resend in production
const sendBudgetAlert = async (user, budget, percentUsed) => {
  try {
    logger.info({
      event: "budget_alert",
      userId: user._id,
      email: user.email,
      category: budget.category,
      percentUsed,
      message: `Budget alert: ${budget.category} is at ${percentUsed}% of limit`,
    });
    // TODO: integrate email provider (SendGrid, Resend, Nodemailer)
    return true;
  } catch (err) {
    logger.error("Notification failed:", err.message);
    return false;
  }
};

const sendGoalAchievedAlert = async (user, goal) => {
  try {
    logger.info({
      event: "goal_achieved",
      userId: user._id,
      goalTitle: goal.title,
    });
    return true;
  } catch (err) {
    logger.error("Goal notification failed:", err.message);
    return false;
  }
};

module.exports = { sendBudgetAlert, sendGoalAchievedAlert };
