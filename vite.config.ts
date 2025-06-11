
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Ensure history API fallback for development
    historyApiFallback: true,
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
  build: {
    outDir: 'dist',
    // Ensure proper handling of dynamic imports
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  // Add preview server configuration for local testing
  preview: {
    port: 8080,
    host: "::",
    // Enable history API fallback for preview mode
    historyApiFallback: true,
  },
}));
