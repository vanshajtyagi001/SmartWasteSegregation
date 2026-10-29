/**
 * db.js
 * -----
 * Handles connection to MongoDB using Mongoose.
 */

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smart_waste_segregation";
    await mongoose.connect(mongoUri);
    console.log("[INFO] MongoDB connected successfully");
  } catch (error) {
    console.error("[ERROR] MongoDB connection failed:", error.message);
    process.exit(1); // Stop the server if DB connection fails
  }
};

module.exports = connectDB;
