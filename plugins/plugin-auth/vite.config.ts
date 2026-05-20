import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@gasi/core-api':     path.resolve(__dirname, '../../core-api/src'),
      '@gasi/core-starter': path.resolve(__dirname, '../../core-starter/src'),
      '@gasi/core-ui':      path.resolve(__dirname, '../../core-ui/src'),
    },
  },
  build: {
    lib: {
      entry:    'src/index.ts',
      name:     'GasiPluginAuth',
      formats:  ['umd'],
      fileName: 'plugin-auth',
    },
    rollupOptions: {
      external: ['react', 'react-dom', '@gasi/core-api', '@gasi/core-starter', '@gasi/core-ui'],
      output: {
        globals: {
          'react':               'React',
          'react-dom':           'ReactDOM',
          '@gasi/core-api':     'GasiCoreApi',
          '@gasi/core-starter': 'GasiCoreStarter',
          '@gasi/core-ui':      'GasiCoreUi',
        },
      },
    },
    outDir:      'dist',
    emptyOutDir: true,
  },
});
