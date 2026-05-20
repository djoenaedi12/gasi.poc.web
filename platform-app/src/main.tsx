import { StrictMode }   from 'react';
import { createRoot }   from 'react-dom/client';
import * as CoreApi     from '@gasi/core-api';
import * as CoreStarter from '@gasi/core-starter';
import * as CoreUi      from '@gasi/core-ui';
import { loadAndStartPlugins } from '@gasi/core-starter';
import './index.css';
import App from './App.tsx';

// Expose core libs ke window supaya plugin UMD bisa mengaksesnya
(window as any).GasiCoreApi     = CoreApi;
(window as any).GasiCoreStarter = CoreStarter;
(window as any).GasiCoreUi      = CoreUi;

// Load dan start semua plugin, lalu render app
// plugin-auth harus di-load pertama supaya interceptor terpasang sebelum request lain
loadAndStartPlugins([
  '/plugins/plugin-auth.umd.js',
  // tambahkan plugin lain di sini:
  // '/plugins/plugin-hr.umd.js',
]).then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
