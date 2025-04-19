import { useState, useEffect } from "react";

function ExpenseForm({ onAdd }) {
  const [form, setForm] = useState({
    date: "",
    title: "",
    amount: ""
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    onAdd(data);            // update parent list
    setForm({ date: "", title: "", amount: "" });
  }

  return (
    <form className="flex gap-2 flex-wrap" onSubmit={handleSubmit}>
      <input name="date" type="date" value={form.date} onChange={handleChange} required />
      <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
      <input name="amount" type="number" step="0.01" value={form.amount} onChange={handleChange} required />
      <button className="bg-blue-600 text-white px-3">Add</button>
    </form>
  );
}

export default function App() {
  const [expenses, setExpenses] = useState([]);

  // initial fetch
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/expenses");
      setExpenses(await res.json());
    })();
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
            {expenses.map(e => (
              <tr key={e.id} className="border-b">
                <td>{e.date}</td>
                <td>{e.title}</td>
                <td className="text-right">${e.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="text-xl mb-2">Add Expense</h2>
        <ExpenseForm onAdd={exp => setExpenses(exps => [...exps, exp])} />
      </section>
    </main>
  );
}
