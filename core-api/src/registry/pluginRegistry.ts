import type { PluginDefinition, PluginExtension } from '../types/pluginDefinition.types';
import type { ExtensionPoint } from '../types/extensionPoints.types';

type PluginState = 'registered' | 'started' | 'stopped';

interface PluginEntry extends PluginDefinition {
  state: PluginState;
}

type RegistryEvent = 'registered' | 'started' | 'stopped';
type EventListener = (event: { type: RegistryEvent; pluginId: string }) => void;

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

  start(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) throw new Error(`Plugin ${pluginId} tidak ditemukan`);
    if (plugin.state === 'started') return;

    plugin.state = 'started';
    plugin.extensions?.forEach(ext => {
      const list = this.extensions.get(ext.point) ?? [];
      this.extensions.set(ext.point, [...list, { ...ext, pluginId } as any]);
    });

    plugin.onStart?.();
    this.emit('started', pluginId);
  }

  stop(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return;

    plugin.state = 'stopped';
    this.extensions.forEach((exts, point) => {
      this.extensions.set(point, exts.filter((e: any) => e.pluginId !== pluginId));
    });

    plugin.onStop?.();
    this.emit('stopped', pluginId);
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

  private emit(type: RegistryEvent, pluginId: string): void {
    this.listeners.forEach(fn => fn({ type, pluginId }));
  }
}

/** Global singleton registry — satu instance untuk seluruh platform */
export const pluginRegistry = new PluginRegistry();
