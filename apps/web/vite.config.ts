
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Конфігурація збирача фронтенду.
 *
 * strictPort: true — якщо 5173 зайнятий, Vite впаде з помилкою,
 * а не мовчки візьме 5174.
 *
 * proxy: запити /api/* передаються на backend,
 * при цьому префікс /api видаляється.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
        cookiePathRewrite: {
          "/auth": "/api/auth",
        },
      },
    },
  },
});
