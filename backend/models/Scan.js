/**
 * Scan.js
 * -------
 * Mongoose schema representing one waste-classification scan result.
 * Stored fields match project requirements exactly:
 *   Image filename, Predicted Category, Confidence, Timestamp
 */

const mongoose = require("mongoose");

const scanSchema = new mongoose.Schema({
  imageFilename: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ["plastic", "paper", "glass", "metal"],
  },
  confidence: {
    type: Number,
    required: true,
  },
  dustbinColor: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Scan", scanSchema);
