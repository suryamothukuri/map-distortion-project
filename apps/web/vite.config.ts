import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@map-distortion/geo': path.resolve(__dirname, '../../packages/geo/src'),
      '@map-distortion/contracts': path.resolve(__dirname, '../../packages/contracts/src'),
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          d3: ['d3', 'd3-geo', 'd3-geo-projection'],
          icons: ['lucide-react'],
        },
      },
    },
  },
});
