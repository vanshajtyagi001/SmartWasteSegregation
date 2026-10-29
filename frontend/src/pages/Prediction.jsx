/**
 * Prediction.jsx
 * --------------
 * Displays the result received from the backend:
 * detected category, confidence %, and recommended dustbin (with color icon).
 * Also gives a "Scan Again" button to go back to the camera page.
 */

import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BinIcon from "../components/BinIcon.jsx";
import "../styles/Prediction.css";

function Prediction() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;

  if (!result) {
    // If user navigates here directly without a result, redirect them back
    return (
      <div className="prediction-container">
        <p>No prediction data found. Please scan an item first.</p>
        <button onClick={() => navigate("/camera")}>Go to Camera</button>
      </div>
    );
  }

  return (
    <div className="prediction-container">
      <h2>Prediction Result</h2>

      <div className="prediction-card">
        <span className={`category-chip chip-${result.category} prediction-chip`}>
          {result.category}
        </span>
        <p className="prediction-confidence">{result.confidence}% confidence</p>
        <BinIcon color={result.dustbinColor} />
      </div>

      <button className="scan-again-button" onClick={() => navigate("/camera")}>
        Scan Again
      </button>
    </div>
  );
}

export default Prediction;
