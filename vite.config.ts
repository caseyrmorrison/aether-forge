import { defineConfig } from "vite";

// Relative assets work on both localhost and GitHub Pages repository URLs.
// three.js is lazy-loaded in its own ~500 kB chunk after the interface is ready.
export default defineConfig({
  base: "./",
  build: { chunkSizeWarningLimit: 600 },
});
