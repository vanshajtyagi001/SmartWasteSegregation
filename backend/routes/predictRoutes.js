/**
 * predictRoutes.js
 * ----------------
 * Defines the /api/predict endpoint.
 * Uses multer middleware to handle image file uploads.
 */

const express = require("express");
const multer = require("multer");
const path = require("path");
const { predictWaste } = require("../controllers/predictController");

const router = express.Router();

// Configure multer to store uploaded images in backend/uploads/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// POST /api/predict  (expects form-data field name: "image")
router.post("/", upload.single("image"), predictWaste);

module.exports = router;
