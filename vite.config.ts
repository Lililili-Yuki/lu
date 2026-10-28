import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  base: './',
  build: { rollupOptions: { input: path.resolve(__dirname, 'dev.html') } },
  server: { open: '/dev.html', proxy: { '/api': 'http://localhost:3001' } },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

