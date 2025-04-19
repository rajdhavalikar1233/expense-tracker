import { useState, useEffect } from "react";
import "./index.css";                 // Tailwind or your own styles

function ExpenseForm({ onAdd }) {
  const [form, setForm] = useState({ date: "", title: "", amount: "" });

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
    setForm({ date: "", title: "", amount: "" });
  }

  return (
    <form onSubmit={submit} className="flex gap-2 flex-wrap">
      <input name="date" type="date" value={form.date} onChange={handle} required />
      <input name="title" placeholder="Title" value={form.title} onChange={handle} required />
      <input name="amount" type="number" step="0.01" value={form.amount} onChange={handle} required />
      <button className="bg-blue-600 text-white px-3">Add</button>
    </form>
  );
}

export default function App() {
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    fetch("/api/expenses")
      .then((r) => r.json())
      .then(setExpenses);
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
            {expenses.map((e) => (
              <tr key={e.id} className="border-b">
                <td>{e.date.slice(0, 10)}</td>
                <td>{e.title}</td>
                <td className="text-right">${Number(e.amount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="text-xl mb-2">Add Expense</h2>
        <ExpenseForm onAdd={(exp) => setExpenses((exps) => [...exps, exp])} />
      </section>
    </main>
  );
}
