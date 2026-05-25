import type { PluginDefinition, PluginExtension } from '../types/pluginDefinition.types';
import type { ExtensionPoint } from '../types/extensionPoints.types';

export type PluginState = 'registered' | 'starting' | 'started' | 'stopping' | 'stopped' | 'error';

export interface PluginEntry extends PluginDefinition {
  state: PluginState;
  error?: unknown;
}

type RegistryEvent = 'registered' | 'starting' | 'started' | 'stopping' | 'stopped' | 'error';
type EventListener = (event: { type: RegistryEvent; pluginId: string; error?: unknown }) => void;

/**
 * Mengelola lifecycle semua plugin.
 * Mirip dengan PluginManager di PF4J.
 */
export class PluginRegistry {
  private plugins = new Map<string, PluginEntry>();
  private extensions = new Map<ExtensionPoint, PluginExtension[]>();
  private listeners: EventListener[] = [];

  register(plugin: PluginDefinition): void {
    if (this.plugins.has(plugin.id)) {
      console.warn(`Plugin ${plugin.id} sudah terdaftar`);
      return;
    }
    this.plugins.set(plugin.id, { ...plugin, state: 'registered' });
    this.emit('registered', plugin.id);
  }

  async start(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) throw new Error(`Plugin ${pluginId} tidak ditemukan`);
    if (plugin.state === 'started' || plugin.state === 'starting') return;

    plugin.state = 'starting';
    plugin.error = undefined;
    this.emit('starting', pluginId);

    try {
      await plugin.onStart?.();

      plugin.extensions?.forEach(ext => {
        const list = this.extensions.get(ext.point) ?? [];
        this.extensions.set(ext.point, [...list, { ...ext, pluginId }]);
      });

      plugin.state = 'started';
      this.emit('started', pluginId);
    } catch (error) {
      plugin.state = 'error';
      plugin.error = error;
      this.removePluginExtensions(pluginId);
      this.emit('error', pluginId, error);
      throw error;
    }
  }

  async stop(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return;
    if (plugin.state === 'stopping' || plugin.state === 'stopped') return;

    plugin.state = 'stopping';
    this.emit('stopping', pluginId);

    try {
      await plugin.onStop?.();
      this.removePluginExtensions(pluginId);
      plugin.state = 'stopped';
      this.emit('stopped', pluginId);
    } catch (error) {
      plugin.state = 'error';
      plugin.error = error;
      this.emit('error', pluginId, error);
      throw error;
    }
  }

  getExtensions(point: ExtensionPoint): PluginExtension[] {
    return this.extensions.get(point) ?? [];
  }

  getPlugins(): PluginEntry[] {
    return Array.from(this.plugins.values());
  }

  getPlugin(id: string): PluginEntry | undefined {
    return this.plugins.get(id);
  }

  onEvent(listener: EventListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private removePluginExtensions(pluginId: string): void {
    this.extensions.forEach((exts, point) => {
      this.extensions.set(point, exts.filter((ext) => ext.pluginId !== pluginId));
    });
  }

  private emit(type: RegistryEvent, pluginId: string, error?: unknown): void {
    this.listeners.forEach(fn => fn({ type, pluginId, error }));
  }
}

/** Global singleton registry — satu instance untuk seluruh platform */
export const pluginRegistry = new PluginRegistry();
