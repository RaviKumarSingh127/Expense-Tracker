const PDFDocument = require("pdfkit");
const Papa = require("papaparse");
const { format } = require("date-fns");

const exportCSV = (transactions) => {
  const data = transactions.map((t) => ({
    Date: format(new Date(t.date), "dd/MM/yyyy"),
    Title: t.title,
    Type: t.type,
    Category: t.category,
    Amount: t.amount,
    "Payment Method": t.paymentMethod,
    Tags: t.tags?.join(", ") || "",
    Description: t.description || "",
  }));
  return Papa.unparse(data);
};

const exportPDF = (transactions, user) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Header
    doc.fontSize(20).text("FlowFin — Transaction Report", { align: "center" });
    doc.fontSize(12).text(`Generated for: ${user.name}`, { align: "center" });
    doc.text(`Date: ${format(new Date(), "dd MMMM yyyy")}`, { align: "center" });
    doc.moveDown();

    // Summary
    const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    doc.fontSize(14).text("Summary", { underline: true });
    doc.fontSize(11)
      .text(`Total Income: ₹${income.toLocaleString("en-IN")}`)
      .text(`Total Expense: ₹${expense.toLocaleString("en-IN")}`)
      .text(`Net Savings: ₹${(income - expense).toLocaleString("en-IN")}`);
    doc.moveDown();

    // Table header
    doc.fontSize(14).text("Transactions", { underline: true });
    doc.moveDown(0.5);

    const cols = { date: 50, title: 150, type: 270, category: 350, amount: 470 };
    doc.fontSize(10).font("Helvetica-Bold");
    Object.entries(cols).forEach(([k, x]) => {
      doc.text(k.charAt(0).toUpperCase() + k.slice(1), x, doc.y, { continued: k !== "amount" });
    });
    doc.font("Helvetica").moveDown(0.5);

    transactions.slice(0, 100).forEach((t) => {
      const y = doc.y;
      doc.text(format(new Date(t.date), "dd/MM/yy"), cols.date, y)
        .text(t.title.slice(0, 18), cols.title, y)
        .text(t.type, cols.type, y)
        .text(t.category.slice(0, 14), cols.category, y)
        .text(`₹${t.amount.toLocaleString("en-IN")}`, cols.amount, y);
      doc.moveDown(0.3);
    });

    doc.end();
  });

module.exports = { exportCSV, exportPDF };
