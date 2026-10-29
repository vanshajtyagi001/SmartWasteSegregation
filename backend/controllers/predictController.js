/**
 * predictController.js
 * ---------------------
 * Handles the "predict" API request:
 * 1. Receives an uploaded image from the frontend (via multer).
 * 2. Calls the Python CNN model (predict.py) as a child process.
 * 3. Parses the JSON prediction result.
 * 4. Saves the result to MongoDB.
 * 5. Sends the result back to the frontend.
 */

const path = require("path");
const { execFile } = require("child_process");
const Scan = require("../models/Scan");

// Path to the ml/ folder (Python project) relative to backend/
const ML_DIR = path.join(__dirname, "..", "..", "ml");
const PYTHON_PATH = process.env.PYTHON_PATH || "python3";

const predictWaste = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded." });
    }

    const imagePath = req.file.path; // absolute/relative path saved by multer
    const imageFilename = req.file.filename;

    // Run: python3 predict.py <imagePath>  (executed inside ml/ directory)
    execFile(
      PYTHON_PATH,
      ["predict.py", path.resolve(imagePath)],
      { cwd: ML_DIR },
      async (error, stdout, stderr) => {
        if (error) {
          console.error("[ERROR] Python prediction failed:", stderr || error.message);
          return res.status(500).json({ error: "Prediction failed. See server logs." });
        }

        let prediction;
        try {
          prediction = JSON.parse(stdout.trim());
        } catch (parseError) {
          console.error("[ERROR] Could not parse Python output:", stdout);
          return res.status(500).json({ error: "Invalid response from prediction model." });
        }

        if (prediction.error) {
          return res.status(500).json({ error: prediction.error });
        }

        // Save result to MongoDB
        const newScan = new Scan({
          imageFilename: imageFilename,
          category: prediction.category,
          confidence: prediction.confidence,
          dustbinColor: prediction.dustbin_color,
        });
        await newScan.save();

        return res.status(200).json({
          category: prediction.category,
          confidence: prediction.confidence,
          dustbinColor: prediction.dustbin_color,
          timestamp: newScan.timestamp,
        });
      }
    );
  } catch (err) {
    console.error("[ERROR] predictWaste controller error:", err.message);
    res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = { predictWaste };
