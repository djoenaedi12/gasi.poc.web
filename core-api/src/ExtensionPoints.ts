/**
 * Daftar extension points yang tersedia di platform.
 * Plugin mendaftarkan extension ke salah satu point ini.
 * Mirip dengan @ExtensionPoint di PF4J.
 */
export const ExtensionPoints = {
  /** Widget yang ditampilkan di dashboard */
  WIDGET: 'widget',
  /** Item tambahan di sidebar menu */
  MENU_ITEM: 'menu_item',
  /** Route/halaman tambahan dari plugin */
  ROUTE: 'route',
  /** Processor untuk transformasi data */
  DATA_PROCESSOR: 'data_processor',
} as const;

export type ExtensionPoint = typeof ExtensionPoints[keyof typeof ExtensionPoints];
