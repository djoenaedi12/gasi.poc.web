import * as React from 'react';
import { createRoot } from 'react-dom/client';
import * as CoreApi from '@gasi/core-api';
import * as CoreStarter from '@gasi/core-starter';
import * as CoreUi from '@gasi/core-ui';
import * as ReactRouter from 'react-router';
import { loadAndStartPlugins } from '@gasi/core-starter';
import './index.css';
import App from './App.tsx';

// Expose core libs ke window supaya plugin UMD bisa mengaksesnya
(window as any).GasiCoreApi = CoreApi;
(window as any).GasiCoreStarter = CoreStarter;
(window as any).GasiCoreUi = CoreUi;
(window as any).React = React;
(window as any).ReactRouter = ReactRouter;
(window as any).process = { env: { NODE_ENV: import.meta.env.MODE } };

async function loadPluginUrls() {
  const defaultUrls = ['/plugins/plugin-auth.umd.js'];

  try {
    const res = await fetch('/plugins/manifest.json');
    if (!res.ok) return defaultUrls;

    const manifest = await res.json();
    if (!Array.isArray(manifest)) return defaultUrls;

    const manifestUrls = manifest
      .map((entry) => typeof entry === 'string' ? entry : entry?.url)
      .filter((url): url is string => typeof url === 'string' && url.length > 0);

    return Array.from(new Set([...defaultUrls, ...manifestUrls]));
  } catch {
    return defaultUrls;
  }
}

// Load dan start semua plugin, lalu render app
// plugin-auth harus di-load pertama supaya interceptor terpasang sebelum request lain
loadPluginUrls().then(loadAndStartPlugins).then(() => {
  createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
