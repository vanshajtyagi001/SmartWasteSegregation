import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite configuration for the Smart Waste Segregation frontend
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
});
