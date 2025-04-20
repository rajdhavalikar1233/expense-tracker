import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import "./index.css";
import Dashboard from "./components/Dashboard";
import Navbar from "./components/Navbar"; // ✅ Make sure this path matches your actual file

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [menuExpanded, setMenuExpanded] = useState(false);

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
          console.error(`Invalid date for expense ID ${expense.id}:`, expense.date);
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
      alert("Failed to fetch expenses.");
    }
  };

  return (
    <Router>
      <Navbar expanded={menuExpanded} setExpanded={setMenuExpanded} />
      <div style={{ paddingTop: "4rem" }}>
        <Routes>
          <Route
            path="/dashboard"
            element={<Dashboard expenses={expenses} categories={categories} />}
          />
          <Route
            path="/"
            element={<div style={{ padding: "1rem" }}>Welcome to the Expense Tracker</div>}
          />
        </Routes>
      </div>
    </Router>
  );
}
