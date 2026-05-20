import type { ExtensionPoint } from './extensionPoints.types';
import type { ComponentType } from 'react';

/**
 * Standard actions yang bisa dipakai semua plugin.
 * Plugin cukup define resource-nya, action diambil dari sini.
 */
export const Actions = {
  READ: 'read',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  DOWNLOAD: 'download',
  UPLOAD: 'upload',
} as const;

export type Action = typeof Actions[keyof typeof Actions];

export interface RouteDefinition {
  /** Path route, contoh: '/employees' atau '/employees/:id' */
  path: string;
  /** React component yang di-render untuk route ini */
  component: ComponentType<any>;
  /**
   * Resource name untuk permission check.
   * Contoh: 'employee', 'payroll', 'benefit'
   * Permission di-generate otomatis: {resource}:{action}
   */
  resource?: string;
  /**
   * Action untuk permission check.
   * Default: 'read' kalau tidak di-define.
   */
  action?: Action;
}

/**
 * Generate permission string dari route definition.
 * Contoh: resource='employee', action='read' → 'employee:read'
 * Kalau tidak ada resource → undefined (bebas diakses)
 */
export function resolvePermission(route: RouteDefinition): string | undefined {
  if (!route.resource) return undefined;
  const action = route.action ?? Actions.READ;
  return `${route.resource}:${action}`;
}

export interface AuthGuardExtension {
  /**
   * Komponen wrapper untuk protected routes.
   * Kalau plugin auth tidak ada, wrapper tidak dipasang.
   */
  component: ComponentType<{ permission?: string; children: React.ReactNode }>;
  /**
   * Fungsi untuk cek permission secara programmatic.
   * Dipakai untuk show/hide tombol, menu, dll.
   */
  hasPermission: (permission: string) => boolean;
}

export interface PluginExtension {
  /** Extension point yang dituju */
  point: ExtensionPoint;
  /** Daftar route (untuk point: 'route') */
  routes?: RouteDefinition[];
  /** Auth guard (untuk point: 'auth_guard') */
  guard?: AuthGuardExtension;
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
  onStart?: () => void | Promise<void>;
  /** Dipanggil saat plugin di-stop */
  onStop?: () => void | Promise<void>;
}
