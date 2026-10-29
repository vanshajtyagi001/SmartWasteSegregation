/**
 * History.jsx
 * -----------
 * Displays a table of all previous scans: image, category, confidence, date.
 * Includes a "Clear History" button that deletes all records and their
 * associated image files after user confirmation.
 */

import React, { useEffect, useState } from "react";
import { fetchHistory, clearHistory } from "../api/api.js";
import "../styles/History.css";

function History() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [clearing, setClearing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const loadHistory = async () => {
    try {
      const data = await fetchHistory();
      setScans(data);
    } catch (err) {
      setError("Could not load history. Please make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleClearHistory = async () => {
    setClearing(true);
    try {
      await clearHistory();
      setScans([]);
      setConfirmOpen(false);
    } catch (err) {
      setError("Could not clear history. Please try again.");
    } finally {
      setClearing(false);
    }
  };

  if (loading) return <p className="history-message">Loading history...</p>;

  return (
    <div className="history-container">
      <div className="history-header">
        <h2>Scan History</h2>
        {scans.length > 0 && (
          <button
            className="clear-history-button"
            onClick={() => setConfirmOpen(true)}
            disabled={clearing}
          >
            Clear History
          </button>
        )}
      </div>

      {error && <p className="error-text">{error}</p>}

      {confirmOpen && (
        <div className="confirm-overlay">
          <div className="confirm-dialog">
            <h3>Clear all scan history?</h3>
            <p>
              This will permanently delete all {scans.length} scan record
              {scans.length !== 1 ? "s" : ""} and their images. This cannot
              be undone.
            </p>
            <div className="confirm-actions">
              <button
                className="confirm-cancel"
                onClick={() => setConfirmOpen(false)}
                disabled={clearing}
              >
                Cancel
              </button>
              <button
                className="confirm-delete"
                onClick={handleClearHistory}
                disabled={clearing}
              >
                {clearing ? "Clearing..." : "Yes, Clear It"}
              </button>
            </div>
          </div>
        </div>
      )}

      {scans.length === 0 ? (
        <div className="history-empty">
          <p className="history-message">No scans yet. Go scan something!</p>
        </div>
      ) : (
        <div className="history-table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Category</th>
                <th>Confidence</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {scans.map((scan) => (
                <tr key={scan._id}>
                  <td>
                    <img
                      src={`http://localhost:5000/uploads/${scan.imageFilename}`}
                      alt={scan.category}
                      className="history-thumbnail"
                    />
                  </td>
                  <td>
                    <span className={`category-chip chip-${scan.category}`}>
                      {scan.category}
                    </span>
                  </td>
                  <td>{scan.confidence}%</td>
                  <td>{new Date(scan.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default History;
