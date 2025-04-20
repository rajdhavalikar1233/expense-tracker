import React from "react";

export default function Dashboard({ expenses, categories }) {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const currentMonthExpenses = expenses.filter(
    (expense) => expense.year === currentYear && expense.month === currentMonth
  );

  const totalExpense = currentMonthExpenses.reduce(
    (sum, expense) => sum + parseFloat(expense.amount),
    0
  );

  const categoryTotals = categories.map((category) => {
    const total = currentMonthExpenses
      .filter((expense) => expense.categoryId === category.id)
      .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

    return { category: category.name, total };
  });

  return (
    <div className="p-6 mt-16">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard</h1>

      {/* Total Expense Widget */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white p-8 rounded-2xl shadow-2xl transform transition hover:scale-[1.01]">
          <h2 className="text-4xl font-bold mb-2">Total Expense</h2>
          <p className="text-3xl">${totalExpense.toFixed(2)}</p>
        </div>
      </div>

      {/* Per-Category Expense Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {categoryTotals.map(({ category, total }) => (
          <div
            key={category}
            className="bg-white rounded-xl p-6 shadow-md border hover:shadow-lg transition"
          >
            <h3 className="text-lg font-semibold text-gray-700">{category}</h3>
            <p className="text-xl font-medium text-gray-900 mt-2">
              ${total.toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
