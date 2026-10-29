/**
 * Home.jsx
 * --------
 * Landing page of the application.
 * Shows project title, a short pitch, the 4 waste categories with their
 * bin colors as a visual preview, and a button to start scanning.
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

const CATEGORY_PREVIEW = [
  { name: "Plastic", bin: "Yellow", color: "var(--bin-plastic)" },
  { name: "Paper", bin: "Blue", color: "var(--bin-paper)" },
  { name: "Glass", bin: "Green", color: "var(--bin-glass)" },
  { name: "Metal", bin: "Grey", color: "var(--bin-metal)" },
];

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <div className="home-hero">
        <span className="home-eyebrow">HPC-Accelerated Deep Learning</span>
        <h1 className="home-title">Know the right bin, instantly.</h1>
        <p className="home-subtitle">
          Point your camera at plastic, paper, glass, or metal waste and get
          an instant AI classification with the exact dustbin to use —
          powered by a CNN trained on a GPU-accelerated HPC cluster.
        </p>
        <button className="start-button" onClick={() => navigate("/camera")}>
          Start Camera
        </button>
      </div>

      <div className="home-categories">
        {CATEGORY_PREVIEW.map((cat) => (
          <div className="category-card" key={cat.name}>
            <div className="category-swatch" style={{ backgroundColor: cat.color }}></div>
            <p className="category-name">{cat.name}</p>
            <p className="category-bin">{cat.bin} Bin</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
