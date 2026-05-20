import { useState, useEffect } from 'react';
import { pluginRegistry } from '@gasi/core-api';
import type { ExtensionPoint, PluginExtension } from '@gasi/core-api';

/**
 * Hook untuk mendapatkan semua extension yang aktif pada suatu extension point.
 * Otomatis re-render ketika plugin di-start atau di-stop.
 *
 * @example
 * const routes = useExtensions(ExtensionPoints.ROUTE);
 */
export function useExtensions(point: ExtensionPoint): PluginExtension[] {
  const [extensions, setExtensions] = useState<PluginExtension[]>(
    () => pluginRegistry.getExtensions(point)
  );

  useEffect(() => {
    const unsubscribe = pluginRegistry.onEvent(() => {
      setExtensions([...pluginRegistry.getExtensions(point)]);
    });
    return unsubscribe;
  }, [point]);

  return extensions;
}
