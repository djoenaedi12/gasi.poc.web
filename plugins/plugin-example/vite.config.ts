import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@gasi/core-api': path.resolve(__dirname, '../../core-api/src'),
    },
  },
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'GasiPluginExample',
      formats: ['umd'],
      fileName: 'plugin-example',
    },
    rollupOptions: {
      // Jangan bundle react dan core — pakai punya platform-app
      external: ['react', 'react-dom', '@gasi/core-api', '@gasi/core-starter'],
      output: {
        globals: {
          'react':               'React',
          'react-dom':           'ReactDOM',
          '@gasi/core-api':     'GasiCoreApi',
          '@gasi/core-starter': 'GasiCoreStarter',
        },
      },
    },
    // Output langsung ke platform-app/public/plugins/
    outDir: '../../platform-app/public/plugins',
    emptyOutDir: false,
  },
});
