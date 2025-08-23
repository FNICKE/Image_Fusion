import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: "./", // 👈 ensures correct paths in preview & production
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
