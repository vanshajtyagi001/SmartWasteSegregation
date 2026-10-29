/**
 * Dashboard.jsx
 * -------------
 * Simple dashboard showing:
 * - Total scans
 * - Count per category
 * - Recent predictions
 */

import React, { useEffect, useState } from "react";
import { fetchDashboardStats } from "../api/api.js";
import "../styles/Dashboard.css";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchDashboardStats();
        setStats(data);
      } catch (err) {
        setError("Could not load dashboard. Please make sure the backend is running.");
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) return <p className="dashboard-message">Loading dashboard...</p>;
  if (error) return <p className="dashboard-message error-text">{error}</p>;

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>

      <div className="dashboard-summary">
        <div className="summary-card">
          <p className="summary-number">{stats.totalScans}</p>
          <p className="summary-label">Total Scans</p>
        </div>

        {Object.entries(stats.categoryCounts).map(([category, count]) => (
          <div className="summary-card" key={category}>
            <p className="summary-number">{count}</p>
            <p className="summary-label">{category}</p>
          </div>
        ))}
      </div>

      <h3>Recent Predictions</h3>
      <ul className="recent-list">
        {stats.recentScans.map((scan) => (
          <li key={scan._id}>
            {scan.category} — {scan.confidence}% — {new Date(scan.timestamp).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
