/**
 * Camera.jsx
 * ----------
 * Lets the user open their webcam, capture a photo of the waste item,
 * or upload an image file as a fallback. Sends the image to the backend
 * and then navigates to the Prediction page with the result.
 */

import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { predictWasteImage } from "../api/api.js";
import "../styles/Camera.css";

function Camera() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Start webcam when component mounts
  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        setError("Could not access webcam. You can upload an image instead.");
      }
    };
    startCamera();

    // Cleanup: stop camera when leaving the page
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Converts current video frame into an image Blob
  const captureFrame = () => {
    return new Promise((resolve) => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => resolve(blob), "image/jpeg");
    });
  };

  const handleCapture = async () => {
    setLoading(true);
    setError("");
    try {
      const blob = await captureFrame();
      const imageFile = new File([blob], "captured.jpg", { type: "image/jpeg" });
      const result = await predictWasteImage(imageFile);
      navigate("/prediction", { state: { result } });
    } catch (err) {
      setError("Prediction failed. Please make sure the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError("");
    try {
      const result = await predictWasteImage(file);
      navigate("/prediction", { state: { result } });
    } catch (err) {
      setError("Prediction failed. Please make sure the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="camera-container">
      <h2>Capture Waste Image</h2>

      <div className="video-frame">
        <video ref={videoRef} autoPlay playsInline className="video-preview"></video>
      </div>
      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>

      {error && <p className="error-text">{error}</p>}

      <div className="camera-buttons">
        <button onClick={handleCapture} disabled={loading}>
          {loading ? "Processing..." : "Capture Image"}
        </button>

        <label className="upload-button">
          Upload Image
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
        </label>
      </div>
    </div>
  );
}

export default Camera;
