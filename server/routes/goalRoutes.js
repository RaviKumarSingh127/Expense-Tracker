const router = require("express").Router();
const SavingsGoal = require("../models/SavingsGoal");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { protect } = require("../middleware/auth");
const { sendGoalAchievedAlert } = require("../services/notificationService");

router.use(protect);

router.get("/", asyncHandler(async (req, res) => {
  const goals = await SavingsGoal.find({ userId: req.user._id }).sort({ createdAt: -1 });
  return res.json(new ApiResponse(200, { goals }, "Goals fetched"));
}));

router.post("/", asyncHandler(async (req, res) => {
  const { title, emoji, targetAmount, targetDate } = req.body;
  if (!title || !targetAmount || !targetDate) throw new ApiError(400, "title, targetAmount, targetDate required");

  const months = Math.max(
    Math.round((new Date(targetDate) - new Date()) / (1000 * 60 * 60 * 24 * 30)),
    1
  );

  const goal = await SavingsGoal.create({
    userId: req.user._id,
    title, emoji, targetAmount,
    targetDate: new Date(targetDate),
    monthlyTarget: Math.round(targetAmount / months),
  });

  return res.status(201).json(new ApiResponse(201, { goal }, "Goal created"));
}));

router.put("/:id", asyncHandler(async (req, res) => {
  const goal = await SavingsGoal.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { $set: req.body },
    { new: true }
  );
  if (!goal) throw new ApiError(404, "Goal not found");
  return res.json(new ApiResponse(200, { goal }, "Goal updated"));
}));

router.delete("/:id", asyncHandler(async (req, res) => {
  const goal = await SavingsGoal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!goal) throw new ApiError(404, "Goal not found");
  return res.json(new ApiResponse(200, {}, "Goal deleted"));
}));

router.post("/:id/contribute", asyncHandler(async (req, res) => {
  const { amount, note } = req.body;
  if (!amount || amount <= 0) throw new ApiError(400, "Valid amount required");

  const goal = await SavingsGoal.findOne({ _id: req.params.id, userId: req.user._id });
  if (!goal) throw new ApiError(404, "Goal not found");

  goal.savedAmount += Number(amount);
  goal.contributions.push({ amount: Number(amount), note: note || "" });

  if (goal.savedAmount >= goal.targetAmount && !goal.isCompleted) {
    goal.isCompleted = true;
    goal.completedAt = new Date();
    await sendGoalAchievedAlert(req.user, goal);
  }

  await goal.save();
  return res.json(new ApiResponse(200, { goal }, "Contribution added"));
}));

module.exports = router;
