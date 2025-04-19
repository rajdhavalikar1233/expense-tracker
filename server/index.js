import express from "express";
import cors from "cors";

const app = express();
app.use(cors());                // dev‑time CORS only
app.use(express.json());        // built‑in body‑parser

// fake in‑memory DB
let expenses = [
  { id: 1, date: "2025‑04‑18", title: "Coffee", amount: 4.5 },
  { id: 2, date: "2025‑04‑17", title: "Groceries", amount: 32.1 },
];

// GET /api/expenses
app.get("/api/expenses", (req, res) => res.json(expenses));

// POST /api/expenses
app.post("/api/expenses", (req, res) => {
  const { date, title, amount } = req.body;
  const newItem = { id: Date.now(), date, title, amount: +amount };
  expenses.push(newItem);
  res.status(201).json(newItem);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API listening on ${PORT}`));
