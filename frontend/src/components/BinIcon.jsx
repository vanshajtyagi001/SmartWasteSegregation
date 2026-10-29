/**
 * BinIcon.jsx
 * -----------
 * Reusable component that shows a colored dustbin icon (SVG) based on
 * the predicted category's recommended bin color. Bin colors are
 * functional (Yellow/Blue/Green/Grey per project spec), not decorative,
 * so they stay fixed regardless of the app's green identity elsewhere.
 */

import React from "react";
import "../styles/BinIcon.css";

const BIN_COLOR_MAP = {
  Yellow: "#eab308",
  Blue: "#2563eb",
  Green: "#16a34a",
  Grey: "#6b7280",
};

function BinIcon({ color }) {
  const hexColor = BIN_COLOR_MAP[color] || "#999999";

  return (
    <div className="bin-icon-container">
      <svg width="64" height="72" viewBox="0 0 64 72" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="8" width="44" height="8" rx="2" fill={hexColor} opacity="0.85" />
        <rect x="24" y="2" width="16" height="6" rx="2" fill={hexColor} />
        <path d="M12 18H52L48 68C47.7 69.8 46.1 71 44.3 71H19.7C17.9 71 16.3 69.8 16 68L12 18Z" fill={hexColor} />
        <line x1="24" y1="28" x2="24" y2="60" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        <line x1="32" y1="28" x2="32" y2="60" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        <line x1="40" y1="28" x2="40" y2="60" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      </svg>
      <p className="bin-label">{color} Bin</p>
    </div>
  );
}

export default BinIcon;
