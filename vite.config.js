// vite.config.js
import { defineConfig } from "vite";
import { config as loadEnv } from "dotenv";
// Load .env into process.env for Vite (node-side) so import.meta.env will be populated
loadEnv();
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
      manifest: {
        name: "Smart Home Hub",
        short_name: "Home Hub",
        description: "My Custom HiveMQ Smart Home Dashboard",
        theme_color: "#0d0e12",
        background_color: "#0d0e12",
        display: "standalone", // Hides the Safari browser address bar
        orientation: "portrait",
        icons: [
          {
            src: "pwa-180x180.png",
            sizes: "180x180",
            type: "image/png",
          },
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
});
