import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as CoreApi from '@gasi/core-api';
import * as CoreStarter from '@gasi/core-starter';
import './index.css';
import App from './App.tsx';

// Expose shared libraries ke window supaya plugin UMD bisa mengaksesnya
// (mirip Spring Boot yang expose beans ke application context)
(window as any).GasiCoreApi     = CoreApi;
(window as any).GasiCoreStarter = CoreStarter;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
