import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    plugins: [react(), tailwindcss()],
    resolve: { alias: { "@": path.resolve(__dirname, ".") } },
    server: { hmr: process.env.DISABLE_HMR !== "true" },
    build: {
      cssMinify: "lightningcss",
    },
    css: {
      transformer: "lightningcss",
      lightningcss: {
        targets: { chrome: 90 << 16, safari: 14 << 16 }
      }
    }
  };
});
