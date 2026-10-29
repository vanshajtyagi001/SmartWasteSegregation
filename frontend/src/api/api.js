/**
 * api.js
 * ------
 * Central place for all API calls from frontend to backend.
 * Keeping this in one file makes it easy to change the backend
 * URL in one place if needed.
 */

import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

// Sends captured/uploaded image to backend for prediction
export const predictWasteImage = async (imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await axios.post(`${API_BASE_URL}/predict`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Fetches all previous scan history
export const fetchHistory = async () => {
  const response = await axios.get(`${API_BASE_URL}/history`);
  return response.data;
};

// Deletes all scan history records and their stored images
export const clearHistory = async () => {
  const response = await axios.delete(`${API_BASE_URL}/history`);
  return response.data;
};

// Fetches dashboard summary stats
export const fetchDashboardStats = async () => {
  const response = await axios.get(`${API_BASE_URL}/dashboard`);
  return response.data;
};
