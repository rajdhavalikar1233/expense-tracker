import React from "react";

export default function Dashboard({ expenses, categories }) {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const currentMonthExpenses = expenses.filter(
    (expense) => expense.year === currentYear && expense.month === currentMonth
  );

  const totalExpense = currentMonthExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

  const categoryTotals = categories.map((category) => {
    const total = currentMonthExpenses
      .filter((expense) => expense.categoryId === category.id)
      .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

    return { category: category.name, total };
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="mb-4">
        <div className="p-6 bg-blue-500 text-white rounded-lg shadow-lg text-center">
          <h2 className="text-3xl font-bold">Total Expense</h2>
          <p className="text-2xl">${totalExpense.toFixed(2)}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoryTotals.map(({ category, total }) => (
          <div key={category} className="p-4 bg-gray-100 rounded-md shadow-md">
            <h3 className="text-lg font-semibold">{category}</h3>
            <p className="text-md">${total.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}