import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tsconfigPaths(), tailwindcss()],
  resolve: {
    alias: {
      '@gasi/core-api':     path.resolve(__dirname, '../core-api/src'),
      '@gasi/core-starter': path.resolve(__dirname, '../core-starter/src'),
      '@gasi/core-ui':      path.resolve(__dirname, '../core-ui/src'),
    },
  },
  server: {
    proxy: {
      '/platform-app': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
