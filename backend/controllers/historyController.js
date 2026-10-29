/**
 * historyController.js
 * ---------------------
 * Handles fetching past scan results (for History page)
 * and aggregated stats (for Dashboard page).
 */

const Scan = require("../models/Scan");
const fs = require("fs");
const path = require("path");

const UPLOADS_DIR = path.join(__dirname, "..", "uploads");

// GET /api/history - returns all past scans, most recent first
const getHistory = async (req, res) => {
  try {
    const scans = await Scan.find().sort({ timestamp: -1 });
    res.status(200).json(scans);
  } catch (err) {
    console.error("[ERROR] getHistory failed:", err.message);
    res.status(500).json({ error: "Failed to fetch history." });
  }
};

// GET /api/dashboard - returns summary stats for Dashboard page
const getDashboardStats = async (req, res) => {
  try {
    const totalScans = await Scan.countDocuments();

    // Count scans grouped by category
    const categoryCountsRaw = await Scan.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const categoryCounts = {};
    categoryCountsRaw.forEach((item) => {
      categoryCounts[item._id] = item.count;
    });

    const recentScans = await Scan.find().sort({ timestamp: -1 }).limit(5);

    res.status(200).json({
      totalScans,
      categoryCounts,
      recentScans,
    });
  } catch (err) {
    console.error("[ERROR] getDashboardStats failed:", err.message);
    res.status(500).json({ error: "Failed to fetch dashboard stats." });
  }
};

// DELETE /api/history - deletes all scan records AND their stored image files
const clearHistory = async (req, res) => {
  try {
    const allScans = await Scan.find();

    // Remove each associated image file from disk before deleting DB records
    allScans.forEach((scan) => {
      const filePath = path.join(UPLOADS_DIR, scan.imageFilename);
      fs.unlink(filePath, (err) => {
        if (err && err.code !== "ENOENT") {
          console.error(`[WARN] Could not delete file ${scan.imageFilename}:`, err.message);
        }
      });
    });

    const result = await Scan.deleteMany({});

    res.status(200).json({
      message: "History cleared successfully.",
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error("[ERROR] clearHistory failed:", err.message);
    res.status(500).json({ error: "Failed to clear history." });
  }
};

module.exports = { getHistory, getDashboardStats, clearHistory };
