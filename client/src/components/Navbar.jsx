import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css"; // Optional: you can skip this if styling inline

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      background: "#1f2937",
      color: "white",
      padding: "0.75rem 1rem",
      display: "flex",
      alignItems: "center",
      zIndex: 1000
    }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "none",
          border: "none",
          color: "white",
          fontSize: "1.5rem",
          cursor: "pointer",
        }}
      >
        ⋯
      </button>

      {isOpen && (
        <div style={{ marginLeft: "1rem", display: "flex", gap: "1rem" }}>
          <Link to="/dashboard" style={{ color: "white", textDecoration: "none" }}>Dashboard</Link>
          <Link to="/" style={{ color: "white", textDecoration: "none" }}>Home</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
