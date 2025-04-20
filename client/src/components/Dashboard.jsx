import React from "react";
import "./Dashboard.css";

const Dashboard = ({ expenses, categories }) => {
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
    <div className="dashboard">
      <div className="widget total-expense">
        <h2>Total Expense</h2>
        <p>${totalExpense.toFixed(2)}</p>
      </div>
      <div className="category-widgets">
        {categoryTotals.map(({ category, total }) => (
          <div key={category} className="widget category">
            <h3>{category}</h3>
            <p>${total.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;