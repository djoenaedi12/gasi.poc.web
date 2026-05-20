import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as CoreApi     from '@gasi/core-api';
import * as CoreStarter from '@gasi/core-starter';
import * as CoreUi      from '@gasi/core-ui';
import './index.css';
import App from './App.tsx';

// Expose shared libraries ke window supaya plugin UMD bisa mengaksesnya
(window as any).GasiCoreApi     = CoreApi;
(window as any).GasiCoreStarter = CoreStarter;
(window as any).GasiCoreUi      = CoreUi;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
