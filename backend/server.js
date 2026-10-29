/**
 * server.js
 * ---------
 * Entry point for the Smart Waste Segregation backend.
 * Sets up Express app, connects to MongoDB, serves uploaded images
 * statically, and mounts all API routes.
 */

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const connectDB = require("./config/db");
const predictRoutes = require("./routes/predictRoutes");
const historyRoutes = require("./routes/historyRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded images so frontend can display them in History page
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/predict", predictRoutes);
app.use("/api", historyRoutes); // provides /api/history and /api/dashboard

// Simple health check route
app.get("/", (req, res) => {
  res.send("Smart Waste Segregation API is running.");
});

app.listen(PORT, () => {
  console.log(`[INFO] Server running on http://localhost:${PORT}`);
});
