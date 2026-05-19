import { useState, useEffect } from 'react';
import { pluginRegistry } from '@gasi/core-api';

/**
 * Hook untuk mendapatkan daftar semua plugin beserta state-nya.
 * Otomatis re-render ketika ada perubahan state plugin.
 */
export function usePlugins() {
  const [plugins, setPlugins] = useState(() => pluginRegistry.getPlugins());

  useEffect(() => {
    const unsubscribe = pluginRegistry.onEvent(() => {
      setPlugins([...pluginRegistry.getPlugins()]);
    });
    return unsubscribe;
  }, []);

  return plugins;
}
