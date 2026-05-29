const { GoogleGenerativeAI } = require("@google/generative-ai");
const logger = require("../config/logger");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const DEFAULT_CATEGORIES = [
  "Food & Dining", "Transportation", "Shopping", "Entertainment",
  "Healthcare", "Utilities", "Housing", "Education", "Travel",
  "Personal Care", "Salary", "Freelance", "Investment", "Other",
];

const safeGenerate = async (prompt) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
  const result = await model.generateContent(prompt);
  return result.response.text();
};

const categorizeTransaction = async (title, amount, type) => {
  const fallback = type === "income" ? "Salary" : "Other";
  try {
    const prompt = `You are a financial categorizer. Given this transaction title: "${title}" (${type}, amount: ${amount}), respond ONLY with one of these categories: ${DEFAULT_CATEGORIES.join(", ")}. No explanation, just the category name.`;
    const text = await safeGenerate(prompt);
    const cleaned = text.trim();
    return DEFAULT_CATEGORIES.includes(cleaned) ? cleaned : fallback;
  } catch (err) {
    logger.error("AI categorize failed:", err.message);
    return fallback;
  }
};

const generateInsights = async (transactions, budgets, user) => {
  const fallback = [
    { title: "Track your spending", description: "Keep logging transactions to get personalized insights.", icon: "💡" },
    { title: "Set a budget", description: "Create budgets to stay on top of your finances.", icon: "📊" },
    { title: "Save consistently", description: "Even small savings compound into big results.", icon: "🎯" },
  ];

  try {
    const summary = buildFinancialSummary(transactions, budgets);
    const prompt = `You are a personal finance advisor. Based on this financial data:
${JSON.stringify(summary, null, 2)}

Generate exactly 3 actionable, specific financial insights for this user. Respond with ONLY a JSON array in this exact format:
[{"title": "short title", "description": "1-2 sentence actionable advice with specific numbers", "icon": "emoji"}]
No markdown, no explanation, only valid JSON.`;

    const text = await safeGenerate(prompt);
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return fallback;
    const insights = JSON.parse(jsonMatch[0]);
    return Array.isArray(insights) && insights.length ? insights.slice(0, 3) : fallback;
  } catch (err) {
    logger.error(`AI insights failed: ${err?.message || err}`);
    return fallback;
  }
};

const suggestBudget = async (monthlyIncome, existingCategories = []) => {
  try {
    const prompt = `You are a budgeting expert. Monthly income: ₹${monthlyIncome}.
Existing budget categories: ${existingCategories.join(", ") || "none"}.
Use the 50/30/20 rule and Indian spending patterns.
Respond with ONLY a JSON array in this exact format:
[{"category": "category name", "amount": number, "icon": "emoji", "color": "#hexcolor", "reasoning": "one sentence"}]
Include 6-8 categories. No markdown, only valid JSON.`;

    const text = await safeGenerate(prompt);
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("No JSON in response");
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    logger.error("AI budget suggestion failed:", err.message);
    return getDefaultBudgetPlan(monthlyIncome);
  }
};

const chat = async (message, context) => {
  try {
    const { transactions = [], budgets = [], goals = [] } = context;
    const summary = buildFinancialSummary(transactions, budgets);
    const goalsText = goals.map((g) => `${g.title}: ₹${g.savedAmount}/₹${g.targetAmount}`).join(", ");

    const prompt = `You are FlowFin AI, a helpful personal finance assistant.
Financial context: ${JSON.stringify(summary)}
Savings goals: ${goalsText || "none"}
User question: "${message}"

Respond conversationally in 2-3 sentences with specific numbers from their data. Be helpful and actionable.`;

    const text = await safeGenerate(prompt);
    return text.trim();
  } catch (err) {
    logger.error(`AI chat failed: ${err?.message || err}`);
    return "I'm having trouble connecting right now. Please check your transaction history directly for insights.";
  }
};

const scanReceipt = async (imageBase64, mimeType = "image/jpeg") => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const prompt = `Extract transaction details from this receipt image. Respond ONLY with JSON:
{"title": "merchant/item name", "amount": number, "category": "category", "date": "YYYY-MM-DD", "paymentMethod": "cash|card|upi|other", "description": "brief description"}
If you cannot read any field, use null for that field.`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: imageBase64, mimeType } },
    ]);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in receipt response");
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    logger.error("AI receipt scan failed:", err.message);
    return { title: null, amount: null, category: "Other", date: null, paymentMethod: "other", description: null };
  }
};

const detectAnomalies = async (transactions) => {
  try {
    const recent = transactions.slice(0, 50);
    const prompt = `Analyze these transactions for spending anomalies or unusual patterns:
${JSON.stringify(recent.map((t) => ({ title: t.title, amount: t.amount, category: t.category, date: t.date })))}

Respond with ONLY a JSON array of anomalies (max 3):
[{"title": "anomaly title", "description": "specific description with amounts", "severity": "low|medium|high", "category": "affected category"}]
If no anomalies, return []. Only valid JSON.`;

    const text = await safeGenerate(prompt);
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    return JSON.parse(jsonMatch[0]).slice(0, 3);
  } catch (err) {
    logger.error("AI anomaly detection failed:", err.message);
    return [];
  }
};

const buildFinancialSummary = (transactions, budgets) => {
  const now = new Date();
  const thisMonth = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const totalIncome = thisMonth.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = thisMonth.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const categoryBreakdown = thisMonth.reduce((acc, t) => {
    if (t.type === "expense") acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});

  const budgetStatus = budgets.map((b) => ({
    category: b.category,
    limit: b.limit,
    spent: categoryBreakdown[b.category] || 0,
    percent: Math.round(((categoryBreakdown[b.category] || 0) / b.limit) * 100),
  }));

  return {
    thisMonthIncome: totalIncome,
    thisMonthExpense: totalExpense,
    savingsRate: totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0,
    topSpendingCategories: Object.entries(categoryBreakdown)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat, amt]) => ({ category: cat, amount: amt })),
    budgetStatus: budgetStatus.filter((b) => b.percent > 70),
  };
};

const getDefaultBudgetPlan = (income) => [
  { category: "Housing", amount: Math.round(income * 0.3), icon: "🏠", color: "#7C3AED", reasoning: "30% for housing costs" },
  { category: "Food & Dining", amount: Math.round(income * 0.15), icon: "🍽️", color: "#06D6A0", reasoning: "15% for food" },
  { category: "Transportation", amount: Math.round(income * 0.1), icon: "🚗", color: "#F59E0B", reasoning: "10% for transport" },
  { category: "Utilities", amount: Math.round(income * 0.08), icon: "⚡", color: "#EF4444", reasoning: "8% for utilities" },
  { category: "Shopping", amount: Math.round(income * 0.1), icon: "🛍️", color: "#3B82F6", reasoning: "10% for shopping" },
  { category: "Entertainment", amount: Math.round(income * 0.07), icon: "🎬", color: "#EC4899", reasoning: "7% for entertainment" },
  { category: "Healthcare", amount: Math.round(income * 0.05), icon: "🏥", color: "#10B981", reasoning: "5% for health" },
  { category: "Savings", amount: Math.round(income * 0.15), icon: "💰", color: "#06D6A0", reasoning: "15% savings target" },
];

module.exports = {
  categorizeTransaction,
  generateInsights,
  suggestBudget,
  chat,
  scanReceipt,
  detectAnomalies,
};
