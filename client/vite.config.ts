import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.cjs',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
  server: {
    proxy: {
      // Όλα τα API requests πηγαίνουν στο port 5000
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        xfwd: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log(`[API Proxy] ${req.method} ${req.url} -> ${options.target}${req.url}`);
          });
          proxy.on('error', (err, req, res) => {
            console.error(`[API Proxy Error] ${req.method} ${req.url}:`, err);
          });
        }
      }
    },
    // Επιτρέπω τη χρήση του API_URL από το .env
    cors: true
  },
  // Επιταχύνω το build
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: process.env.NODE_ENV !== 'production',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-query', 'wouter']
        }
      }
    }
  }
}); 