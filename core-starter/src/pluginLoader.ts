import { pluginRegistry } from '@gasi/core-api';

/**
 * Load plugin dari file UMD yang ada di public/plugins/.
 * Plugin yang filenya tidak ada akan di-skip (tidak error).
 * Mirip dengan PF4J PluginManager.loadPlugins() dari folder plugins/.
 */
export async function loadExternalPlugins(pluginUrls: string[]): Promise<void> {
  for (const url of pluginUrls) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`[PluginLoader] Plugin tidak ditemukan, skip: ${url}`);
        continue;
      }

      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Gagal load: ${url}`));
        document.head.appendChild(script);
      });

      console.info(`[PluginLoader] Loaded: ${url}`);
    } catch (err) {
      console.warn(`[PluginLoader] Skip plugin karena error:`, err);
    }
  }
}

/**
 * Daftarkan dan start plugin dari manifest URL.
 * Plugin UMD harus mengekspos dirinya via window setelah di-load.
 */
export async function loadAndStartPlugins(pluginUrls: string[]): Promise<void> {
  await loadExternalPlugins(pluginUrls);

  // Plugin UMD akan auto-register ke pluginRegistry saat script di-load
  // Start semua yang sudah registered tapi belum started
  pluginRegistry.getPlugins().forEach(plugin => {
    if (plugin.state === 'registered') {
      pluginRegistry.start(plugin.id);
    }
  });
}
