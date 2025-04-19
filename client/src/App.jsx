import React, { StrictMode } from "react"; // Import StrictMode
import { createRoot } from "react-dom/client"; // Import createRoot
import { useState, useEffect } from "react";
import "./index.css"; // Tailwind or your own styles

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);

function ExpenseForm({ onAdd, categories }) {
  const [form, setForm] = useState({ date: "", title: "", amount: "", categoryId: "" });

  const handle = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    onAdd(await res.json());
    setForm({ date: "", title: "", amount: "", categoryId: "" });
  }

  return (
    <form onSubmit={submit} className="flex gap-2 flex-wrap">
      <input name="date" type="date" value={form.date} onChange={handle} required />
      <input name="title" placeholder="Title" value={form.title} onChange={handle} required />
      <input name="amount" type="number" step="0.01" value={form.amount} onChange={handle} required />

      <select
        name="categoryId"
        value={form.categoryId}
        onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
        required
      >
        <option value="">Select Category</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      <button className="bg-blue-600 text-white px-3">Add</button>
    </form>
  );
}

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  console.log("App is rendering");

  useEffect(() => {
    console.log("Fetching expenses...");
    fetch("/api/expenses")
      .then((r) => r.json())
      .then((data) => {
        console.log("Fetched expenses:", data);
        setExpenses(data);
      });
  }, []);

  useEffect(() => {
    console.log("Fetching categories...");
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        console.log("Fetched categories:", data);
        setCategories(data);
      });
  }, []);

  return (
    <main className="p-4 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Expense Tracker</h1>

      <section>
        <h2 className="text-xl mb-2">My Expenses</h2>
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr><th>Date</th><th>Title</th><th className="text-right">Amount</th></tr>
          </thead>
          <tbody>
            {expenses.map((e, index) => (
              <tr key={e.id || index} className="border-b">
                <td>{e.date ? e.date.slice(0, 10) : "No Date"}</td>
                <td>{e.title || "No Title"}</td>
                <td className="text-right">${e.amount ? Number(e.amount).toFixed(2) : "0.00"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="text-xl mb-2">Add Expense</h2>
        <ExpenseForm onAdd={(exp) => setExpenses((exps) => [...exps, exp])} categories={categories} />
      </section>
    </main>
  );
}