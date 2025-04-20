import React, { useState, useEffect } from "react";
import "./index.css";

function ExpenseForm({ onAdd, onUpdate, categories, form, setForm, selectedYear, selectedMonth }) {
  const handle = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function submit(e) {
    e.preventDefault();

    // Construct the full date using the selected year, month, and day
    const fullDate = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(
      form.day
    ).padStart(2, "0")}`;

    if (form.id) {
      // Update existing expense
      const res = await fetch(`/api/expenses/${form.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, date: fullDate }),
      });
      const updatedExpense = await res.json();
      onUpdate(updatedExpense);
    } else {
      // Add new expense
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, date: fullDate }),
      });
      onAdd(await res.json());
    }

    setForm({ date: "", title: "", amount: "", categoryId: "", day: "" });
  }

  // Generate the days for the selected month and year
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <form onSubmit={submit} className="flex gap-2 flex-wrap">
      <select
        name="day"
        value={form.day || ""}
        onChange={handle}
        required
        className="border px-2 py-1"
      >
        <option value="">Select Day</option>
        {days.map((day) => (
          <option key={day} value={day}>
            {day}
          </option>
        ))}
      </select>

      <input name="title" placeholder="Title" value={form.title} onChange={handle} required />
      <input name="amount" type="number" step="0.01" value={form.amount} onChange={handle} required />

      <select
        name="categoryId"
        value={form.categoryId}
        onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
        required
        className="border px-2 py-1"
      >
        <option value="">Select Category</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      <button className="bg-blue-600 text-white px-3">
        {form.id ? "Update" : "Add"}
      </button>
    </form>
  );
}

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ date: "", title: "", amount: "", categoryId: "", day: "" });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    fetch("/api/expenses")
      .then((r) => r.json())
      .then((data) => setExpenses(data));
  }, []);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data));
  }, []);

  const handleAdd = (newExpense) => {
    setExpenses((exps) => [...exps, newExpense]);
  };

  const handleUpdate = (updatedExpense) => {
    setExpenses((exps) =>
      exps.map((e) => (e.id === updatedExpense.id ? updatedExpense : e))
    );
  };

  const handleEdit = (expense) => {
    const expenseDate = new Date(expense.date);
    setForm({
      id: expense.id,
      day: expenseDate.getDate(),
      title: expense.title,
      amount: expense.amount,
      categoryId: expense.categoryId,
    });
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      setExpenses((exps) => exps.filter((e) => e.id !== id));
    }
  };

  const filteredExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    return (
      expenseDate.getFullYear() === selectedYear &&
      expenseDate.getMonth() + 1 === selectedMonth
    );
  });

  return (
    <main className="p-4 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Expense Tracker</h1>

      <section className="flex gap-4 mb-4">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="border px-2 py-1"
        >
          {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="border px-2 py-1"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
            <option key={month} value={month}>
              {new Date(0, month - 1).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>
      </section>

      <section>
        <h2 className="text-xl mb-2">My Expenses</h2>
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th>Date</th>
              <th>Title</th>
              <th className="text-right">Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.map((e) => (
              <tr key={e.id} className="border-b">
                <td>{e.date ? e.date.slice(0, 10) : "No Date"}</td>
                <td>{e.title || "No Title"}</td>
                <td className="text-right">${e.amount ? Number(e.amount).toFixed(2) : "0.00"}</td>
                <td>
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => handleEdit(e)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600 hover:underline ml-2"
                    onClick={() => handleDelete(e.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="text-xl mb-2">{form.id ? "Edit Expense" : "Add Expense"}</h2>
        <ExpenseForm
          onAdd={handleAdd}
          onUpdate={handleUpdate}
          categories={categories}
          form={form}
          setForm={setForm}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
        />
      </section>
    </main>
  );
}