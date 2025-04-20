// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react'; // or use "⋯" if you don't want to install an icon lib
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="nav-left">
        <button onClick={() => setIsOpen(!isOpen)} className="menu-button">
          <Menu size={24} />
        </button>
        <div className={`nav-links ${isOpen ? 'open' : ''}`}>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/expenses">Expenses</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
