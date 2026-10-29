/**
 * Navbar.jsx
 * ----------
 * Simple navigation bar shown on every page, with links to all sections.
 */

import React from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-title">
        <svg
          className="leaf-icon"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 13C4 7.477 8.477 3 14 3H20V9C20 14.523 15.523 19 10 19H4V13Z"
            fill="#4ade80"
          />
          <path
            d="M4 20C4 20 6 14 12 11C15 9.5 18 9 20 9"
            stroke="#1b4332"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
        Smart Waste Segregation
      </div>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/camera">Scan</Link>
        <Link to="/history">History</Link>
        <Link to="/dashboard">Dashboard</Link>
      </div>
    </nav>
  );
}

export default Navbar;
