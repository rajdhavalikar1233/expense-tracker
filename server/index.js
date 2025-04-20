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

app.post("/api/expenses", async (req, res) => {
  console.log("Request body:", req.body); // Log the incoming request body
  try {
    const { date, title, amount, categoryId } = req.body;

    // Convert categoryId to an integer
    const categoryIdInt = parseInt(categoryId, 10);

    // Check if the category exists
    const category = await prisma.category.findUnique({ where: { id: categoryIdInt } });
    if (!category) {
      console.error("Invalid categoryId:", categoryIdInt); // Log invalid categoryId
      return res.status(400).json({ error: "Invalid categoryId" });
    }

    // Convert date to a valid JavaScript Date object
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      console.error("Invalid date:", date); // Log invalid date
      return res.status(400).json({ error: "Invalid date format. Expected YYYY-MM-DD." });
    }

    const expense = await prisma.expense.create({
      data: { date: dateObj, title, amount: parseFloat(amount), categoryId: categoryIdInt },
    });
    console.log("Created expense:", expense); // Log the created expense
    res.status(201).json(expense);
  } catch (error) {
    console.error("Error creating expense:", error.stack); // Log the full error stack trace
    res.status(500).json({ error: "Failed to create expense" });
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