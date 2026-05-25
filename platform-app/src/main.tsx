import * as React from 'react';
import { createRoot } from 'react-dom/client';
import * as CoreApi from '@gasi/core-api';
import * as CoreStarter from '@gasi/core-starter';
import * as CoreUi from '@gasi/core-ui';
import * as ReactRouter from 'react-router';
import { loadAndStartPlugins } from '@gasi/core-starter';
import './index.css';
import App from './App.tsx';

declare global {
  interface Window {
    GasiCoreApi: typeof CoreApi;
    GasiCoreStarter: typeof CoreStarter;
    GasiCoreUi: typeof CoreUi;
    React: typeof React;
    ReactRouter: typeof ReactRouter;
    process: { env: { NODE_ENV: string } };
  }
}

// Expose core libs ke window supaya plugin UMD bisa mengaksesnya
window.GasiCoreApi = CoreApi;
window.GasiCoreStarter = CoreStarter;
window.GasiCoreUi = CoreUi;
window.React = React;
window.ReactRouter = ReactRouter;
window.process = { env: { NODE_ENV: import.meta.env.MODE } };

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
