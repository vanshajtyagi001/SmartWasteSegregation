/**
 * historyRoutes.js
 * ----------------
 * Defines endpoints for History page and Dashboard page.
 */

const express = require("express");
const { getHistory, getDashboardStats, clearHistory } = require("../controllers/historyController");

const router = express.Router();

// GET /api/history
router.get("/history", getHistory);

// DELETE /api/history - clears all scan records and their image files
router.delete("/history", clearHistory);

// GET /api/dashboard
router.get("/dashboard", getDashboardStats);

module.exports = router;
