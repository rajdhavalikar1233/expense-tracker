import "dotenv/config";
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

// ───── CRUD routes ─────
app.get("/api/expenses", async (_req, res) => {
  const data = await prisma.expense.findMany({ orderBy: { date: "desc" } });
  res.json(data);
});

app.get("/api/expenses", async (req, res) => {
  const { category, sortBy, order } = req.query;

  try {
    const expenses = await prisma.expense.findMany({
      where: category ? { category: { name: category } } : undefined,
      orderBy: sortBy ? { [sortBy]: order || "asc" } : { date: "desc" },
      include: { category: true }, // Include category details
    });

    res.json(expenses); // Ensure each expense has an `id` field
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

app.post("/api/expenses/bulk-save", async (req, res) => {
  const { expenses, deletedRows } = req.body;

  try {
    // Delete rows from the database
    if (deletedRows && deletedRows.length > 0) {
      await prisma.expense.deleteMany({
        where: {
          id: { in: deletedRows },
        },
      });
    }

    // Save or update expenses
    const savedExpenses = await Promise.all(
      expenses.map(async (expense) => {
        const dateObj = new Date(expense.date);
        if (isNaN(dateObj.getTime())) {
          throw new Error(`Invalid date: ${expense.date}`);
        }

        const categoryId = parseInt(expense.categoryId, 10);
        if (isNaN(categoryId)) {
          throw new Error(`Invalid categoryId for expense: ${expense.title || "Untitled"}`);
        }

        if (!expense.id || expense.id.toString().length > 10) {
          // New expense
          return prisma.expense.create({
            data: {
              date: dateObj,
              title: expense.title,
              amount: parseFloat(expense.amount),
              categoryId,
            },
          });
        } else {
          // Existing expense
          return prisma.expense.update({
            where: { id: parseInt(expense.id, 10) },
            data: {
              date: dateObj,
              title: expense.title,
              amount: parseFloat(expense.amount),
              categoryId,
            },
          });
        }
      })
    );

    res.json(savedExpenses);
  } catch (error) {
    console.error("Error saving expenses:", error.message);
    res.status(400).json({ error: error.message });
  }
});

app.put("/api/expenses/:id", async (req, res) => {
  const { id } = req.params;
  const { date, title, amount, categoryId } = req.body;

  try {
    const updatedExpense = await prisma.expense.update({
      where: { id: parseInt(id, 10) },
      data: {
        date: new Date(date),
        title,
        amount: parseFloat(amount),
        categoryId: parseInt(categoryId, 10),
      },
    });
    res.json(updatedExpense);
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({ error: "Failed to update expense" });
  }
});

// Delete an expense
app.delete("/api/expenses/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.expense.delete({
      where: { id: parseInt(id, 10) },
    });
    res.status(204).send(); // No content
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ error: "Failed to delete expense" });
  }
});

app.get("/api/reports/monthly", async (_req, res) => {
  const data = await prisma.$queryRaw`
    SELECT DATE_TRUNC('month', date) AS month, SUM(amount) AS total
    FROM "Expense"
    GROUP BY month
    ORDER BY month DESC
  `;
  res.json(data);
});

// global error handler (only if you need custom output)
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

app.get("/api/categories", async (_req, res) => {
  try {
    const categories = await prisma.category.findMany(); // Fetch all categories from the database
    console.log("Fetching categories...");
    res.json(categories); // Send the categories as JSON
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// Add a new category
app.post("/api/categories", async (req, res) => {
  const { name } = req.body;
  const category = await prisma.category.create({ data: { name } });
  res.status(201).json(category);
});

app.listen(process.env.PORT, () =>
  console.log(`API listening on :${process.env.PORT}`)
);