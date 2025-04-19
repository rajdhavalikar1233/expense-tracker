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

app.post("/api/expenses", async (req, res) => {
  const { date, title, amount } = req.body;
  const saved = await prisma.expense.create({
    data: { date: new Date(date), title, amount },
  });
  res.status(201).json(saved);
});

// global error handler (only if you need custom output)
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

app.listen(process.env.PORT, () =>
  console.log(`API listening on :${process.env.PORT}`)
);
