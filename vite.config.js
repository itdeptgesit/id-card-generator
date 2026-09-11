import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: false,
  },
  // @imgly/background-removal perlu di-exclude dari pre-bundling
  // agar file WASM & ONNX bisa diload dengan benar dari CDN
  optimizeDeps: {
    exclude: ['@imgly/background-removal'],
  },
  build: {
    target: 'esnext',
  },
});
