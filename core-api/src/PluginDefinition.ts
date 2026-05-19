import type { ExtensionPoint } from './ExtensionPoints';
import type { ComponentType } from 'react';

export interface PluginExtension {
  /** Extension point yang dituju */
  point: ExtensionPoint;
  /** React component (untuk WIDGET, MENU_ITEM, ROUTE) */
  component?: ComponentType<any>;
  /** Function processor (untuk DATA_PROCESSOR) */
  fn?: (...args: any[]) => any;
  /** Metadata tambahan */
  meta?: Record<string, any>;
}

/**
 * Kontrak yang harus dipenuhi setiap plugin.
 * Mirip dengan interface Plugin di PF4J.
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
