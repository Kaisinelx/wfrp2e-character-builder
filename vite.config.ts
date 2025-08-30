// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "robots.txt"],
      manifest: {
        name: "WFRP2e Character Builder",
        short_name: "WFRP2e Builder",
        description: "Offline character builder for WFRP 2nd Edition",
        theme_color: "#111111",
        background_color: "#0b0b0b",
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          { 
            src: "/icon-144.png", 
            sizes: "144x144", 
            type: "image/png" 
          },
          { 
            src: "/icon-192.png", 
            sizes: "192x192", 
            type: "image/png" 
          },
          { 
            src: "/icon-512.png", 
            sizes: "512x512", 
            type: "image/png" 
          },
          { 
            src: "/icon-maskable-512.png", 
            sizes: "512x512", 
            type: "image/png", 
            purpose: "maskable" 
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/data/"),
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "data-cache",
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
            }
          },
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
            }
          },
          {
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: { cacheName: "pages-cache", networkTimeoutSeconds: 2 }
          }
        ],
      },
    }),
  ],
});