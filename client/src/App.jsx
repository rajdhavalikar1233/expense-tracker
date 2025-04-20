import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./index.css";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [menuExpanded, setMenuExpanded] = useState(false); // Track menu state

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data));
  }, []);

  const fetchExpenses = async () => {
    try {
      const data = await fetch("/api/expenses").then((r) => r.json());

      const transformedData = data.map((expense) => {
        const date = new Date(expense.date);

        if (isNaN(date.getTime())) {
          console.error(`Invalid date format for expense ID ${expense.id}:`, expense.date);
          return { ...expense, day: "" };
        }

        return {
          id: expense.id,
          day: date.getUTCDate(),
          title: expense.title,
          amount: expense.amount,
          categoryId: expense.categoryId,
          year: date.getUTCFullYear(),
          month: date.getUTCMonth() + 1,
        };
      });

      setExpenses(transformedData);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      alert("Failed to fetch expenses. Please try again.");
    }
  };

  const handleAddRow = () => {
    const newRow = {
      id: Date.now(), // Temporary ID for new rows
      day: "",
      title: "",
      amount: "",
      categoryId: "",
      year: selectedYear,
      month: selectedMonth,
    };
    setExpenses((prev) => [...prev, newRow]);
  };

  const handleDeleteRow = (id) => {
    setExpenses((prev) => prev.filter((expense) => expense.id !== id));
  };

  const handleEditCell = (id, field, value) => {
    setExpenses((prev) =>
      prev.map((expense) =>
        expense.id === id ? { ...expense, [field]: value } : expense
      )
    );
  };

  const handleSave = async () => {
    try {
      const expensesWithFullDate = expenses.map((expense) => {
        const day = expense.day || "01"; // Default to the 1st day if day is missing
        const fullDate = `${expense.year || selectedYear}-${String(expense.month || selectedMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        const categoryId = parseInt(expense.categoryId, 10);
        if (isNaN(categoryId)) {
          throw new Error(`Invalid categoryId for expense: ${expense.title || "Untitled"}`);
        }

        return { ...expense, date: fullDate, categoryId };
      });

      const res = await fetch("/api/expenses/bulk-save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expenses: expensesWithFullDate }),
      });

      if (!res.ok) {
        throw new Error("Failed to save expenses");
      }

      await fetchExpenses();
      alert("Expenses saved successfully!");
    } catch (error) {
      console.error("Error saving expenses:", error);
      alert(error.message || "Failed to save expenses. Please try again.");
    }
  };

  return (
    <Router>
      {/* Navigation Bar */}
      <nav className="bg-black text-white p-4 fixed top-0 left-0 w-full z-50">
        <div className="flex items-center justify-between">
          {/* Hamburger Menu Icon */}
          <button
            className="flex flex-col gap-1"
            onClick={() => setMenuExpanded((prev) => !prev)}
          >
            <span className="block w-6 h-0.5 bg-white"></span>
            <span className="block w-6 h-0.5 bg-white"></span>
            <span className="block w-6 h-0.5 bg-white"></span>
          </button>

          {/* Expanded Menu */}
          {menuExpanded && (
            <div className="absolute top-12 left-0 bg-black text-white w-full p-4 shadow-md">
              <Link to="/" className="block py-2 hover:underline">
                Tracker
              </Link>
              <Link to="/dashboard" className="block py-2 hover:underline">
                Dashboard
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Routes */}
      <div className="pt-16"> {/* Add padding to avoid overlap with the fixed nav */}
        <Routes>
          <Route
            path="/"
            element={
              <main className="flex flex-col items-center bg-gray-100 min-h-screen p-4">
                {/* Black Box with Dropdowns */}
                <div className="bg-black text-white p-4 w-full max-w-4xl rounded-md sticky top-0 z-10">
                  <div className="flex gap-4 w-full">
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="border px-2 py-1 bg-white text-black w-full"
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
                      className="border px-2 py-1 bg-white text-black w-full"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                        <option key={month} value={month}>
                          {new Date(0, month - 1).toLocaleString("default", { month: "long" })}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Scrollable Table */}
                <div className="overflow-auto w-full max-w-4xl mt-4 bg-white rounded-md shadow-md">
                  <table className="table-auto w-full text-sm">
                    <thead className="bg-gray-200 sticky top-0">
                      <tr>
                        <th className="border px-4 py-2">Day</th>
                        <th className="border px-4 py-2">Title</th>
                        <th className="border px-4 py-2">Amount</th>
                        <th className="border px-4 py-2">Category</th>
                        <th className="border px-4 py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses
                        .filter((expense) => expense.year === selectedYear && expense.month === selectedMonth)
                        .map((expense) => (
                          <tr key={expense.id}>
                            <td className="border px-4 py-2">
                              <input
                                type="number"
                                min="1"
                                max="31"
                                value={expense.day || ""}
                                onChange={(e) => handleEditCell(expense.id, "day", e.target.value)}
                                className="w-full border px-2 py-1"
                              />
                            </td>
                            <td className="border px-4 py-2">
                              <input
                                type="text"
                                value={expense.title || ""}
                                onChange={(e) => handleEditCell(expense.id, "title", e.target.value)}
                                className="w-full border px-2 py-1"
                              />
                            </td>
                            <td className="border px-4 py-2">
                              <input
                                type="number"
                                step="0.01"
                                value={expense.amount || ""}
                                onChange={(e) => handleEditCell(expense.id, "amount", e.target.value)}
                                className="w-full border px-2 py-1"
                              />
                            </td>
                            <td className="border px-4 py-2">
                              <select
                                value={expense.categoryId || ""}
                                onChange={(e) => handleEditCell(expense.id, "categoryId", e.target.value)}
                                className="w-full border px-2 py-1"
                              >
                                <option value="">Select Category</option>
                                {categories.map((category) => (
                                  <option key={category.id} value={category.id}>
                                    {category.name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="border px-4 py-2 text-center">
                              <button
                                onClick={() => handleDeleteRow(expense.id)}
                                className="minus-button"
                              >
                                -
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex gap-4">
                  <button onClick={handleAddRow} className="plus-button">
                    +
                  </button>
                  <button onClick={handleSave} className="save-button">
                    Save
                  </button>
                </div>
              </main>
            }
          />
          <Route
            path="/dashboard"
            element={<Dashboard expenses={expenses} categories={categories} />}
          />
        </Routes>
      </div>
    </Router>
  );
}