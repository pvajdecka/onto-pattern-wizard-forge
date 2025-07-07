
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8501,
    // PROXY SETTINGS:
    proxy: {
      // Any request that starts with "/api" will get forwarded to FastAPI:
      '/api': {
        target: 'http://127.0.0.1:8000', // Your FastAPI URL & port
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''), 
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
