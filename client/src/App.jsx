import React, { useState, useEffect } from "react";
import "./index.css";

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [deletedRows, setDeletedRows] = useState([]); // Track deleted rows

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

      // Transform the API response to match the frontend's expected structure
      const transformedData = data.map((expense) => {
        const date = new Date(expense.date);
        return {
          id: expense.id,
          day: date.getDate(), // Extract the day from the date
          title: expense.title,
          amount: expense.amount,
          categoryId: expense.categoryId,
          year: date.getFullYear(), // Extract the year
          month: date.getMonth() + 1, // Extract the month (0-based index, so add 1)
        };
      });

      setExpenses(transformedData); // Update the state with the transformed data
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
    if (id.toString().length <= 10) {
      // Only add IDs that exist in the database
      setDeletedRows((prev) => [...prev, id]);
    }
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
        body: JSON.stringify({ expenses: expensesWithFullDate, deletedRows }),
      });

      if (!res.ok) {
        throw new Error("Failed to save expenses");
      }

      // Fetch the updated data from the database
      await fetchExpenses();
      setDeletedRows([]); // Clear the deleted rows after successful save
      alert("Expenses saved successfully!");
    } catch (error) {
      console.error("Error saving expenses:", error);
      alert(error.message || "Failed to save expenses. Please try again.");
    }
  };

  const filteredExpenses = expenses.filter(
    (expense) => expense.year === selectedYear && expense.month === selectedMonth
  );

  return (
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
            {filteredExpenses.length > 0 ? (
              filteredExpenses.map((expense) => (
                <tr key={expense.id}>
                  {/* Editable Day */}
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

                  {/* Editable Title */}
                  <td className="border px-4 py-2">
                    <input
                      type="text"
                      value={expense.title || ""}
                      onChange={(e) => handleEditCell(expense.id, "title", e.target.value)}
                      className="w-full border px-2 py-1"
                    />
                  </td>

                  {/* Editable Amount */}
                  <td className="border px-4 py-2">
                    <input
                      type="number"
                      step="0.01"
                      value={expense.amount || ""}
                      onChange={(e) => handleEditCell(expense.id, "amount", e.target.value)}
                      className="w-full border px-2 py-1"
                    />
                  </td>

                  {/* Editable Category */}
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

                  {/* Delete Button */}
                  <td className="border px-4 py-2 text-center">
                    <button
                      onClick={() => handleDeleteRow(expense.id)}
                      className="minus-button"
                    >
                      -
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                {/* Default Empty Row */}
                <td className="border px-4 py-2">
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value=""
                    onChange={(e) => handleAddRow()}
                    className="w-full border px-2 py-1"
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="text"
                    value=""
                    onChange={(e) => handleAddRow()}
                    className="w-full border px-2 py-1"
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="number"
                    step="0.01"
                    value=""
                    onChange={(e) => handleAddRow()}
                    className="w-full border px-2 py-1"
                  />
                </td>
                <td className="border px-4 py-2">
                  <select
                    value=""
                    onChange={(e) => handleAddRow()}
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
                    onClick={() => handleAddRow()}
                    className="minus-button"
                  >
                    -
                  </button>
                </td>
              </tr>
            )}

            {/* Add Row and Save Buttons */}
            <tr>
              <td colSpan="5" className="border px-4 py-2 text-center flex gap-4 justify-center">
                <button
                  onClick={handleAddRow}
                  className="plus-button"
                >
                  +
                </button>
                <button
                  onClick={handleSave}
                  className="save-button"
                >
                  Save
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}