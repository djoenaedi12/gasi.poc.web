import type { ExtensionPoint } from './ExtensionPoints';
import type { ComponentType } from 'react';

export interface RouteDefinition {
  /** Path route, contoh: '/hr/employees' atau '/hr/employees/:id' */
  path: string;
  /** React component yang di-render untuk route ini */
  component: ComponentType<any>;
}

export interface PluginExtension {
  /** Extension point yang dituju */
  point: ExtensionPoint;
  /** Daftar route yang didaftarkan plugin (untuk point: 'route') */
  routes?: RouteDefinition[];
}

/**
 * Kontrak yang harus dipenuhi setiap plugin.
 */
export interface PluginDefinition {
  /** ID unik plugin, format: 'plugin.nama' */
  id: string;
  /** Nama display plugin */
  name: string;
  /** Versi plugin */
  version: string;
  /** Deskripsi singkat */
  description?: string;
  /** Extension yang didaftarkan plugin ini */
  extensions?: PluginExtension[];
  /** Dipanggil saat plugin di-start */
  onStart?: () => void;
  /** Dipanggil saat plugin di-stop */
  onStop?: () => void;
}
