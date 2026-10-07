import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// One index.html per page so /privacy/, /impressum/ … resolve on GitHub Pages without a router.
const pages = ["support", "privacy", "datenschutz", "impressum"];

export default defineConfig({
  base: "/earshift/",
  plugins: [react(), tailwindcss()],
  build: {
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        ...Object.fromEntries(pages.map((p) => [p, resolve(__dirname, `${p}/index.html`)])),
      },
    },
  },
});
