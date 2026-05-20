/**
 * Daftar extension points yang tersedia di platform.
 */
export const ExtensionPoints = {
  /** Route/halaman yang didaftarkan plugin */
  ROUTE: 'route',
  /**
   * Auth guard — plugin auth mendaftarkan komponen wrapper
   * untuk protected routes dan permission check.
   * Kalau tidak ada plugin auth, semua route bebas diakses.
   */
  AUTH_GUARD: 'auth_guard',
} as const;

export type ExtensionPoint = typeof ExtensionPoints[keyof typeof ExtensionPoints];
