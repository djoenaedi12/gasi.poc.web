/**
 * Daftar extension points yang tersedia di platform.
 * Plugin mendaftarkan route-route miliknya ke ROUTE extension point.
 */
export const ExtensionPoints = {
  /** Route/halaman yang didaftarkan plugin */
  ROUTE: 'route',
} as const;

export type ExtensionPoint = typeof ExtensionPoints[keyof typeof ExtensionPoints];
