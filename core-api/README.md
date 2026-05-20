# @gasi/core-api

Kontrak dan definisi inti untuk plugin system. Package ini menjadi
dependency utama bagi semua plugin maupun `core-starter`.

## Isi

```
core-api/
└── src/
    ├── ExtensionPoints.ts   # Konstanta daftar extension points yang tersedia
    ├── PluginDefinition.ts  # Interface kontrak yang harus dipenuhi setiap plugin
    ├── PluginRegistry.ts    # PluginRegistry class + singleton pluginRegistry
    └── index.ts             # Public exports
```

## API

### ExtensionPoints

Extension point yang tersedia di platform:

```ts
import { ExtensionPoints } from '@gasi/core-api';

ExtensionPoints.ROUTE  // Route/halaman yang didaftarkan plugin
```

### PluginDefinition

Interface yang harus diimplementasikan setiap plugin:

```ts
import type { PluginDefinition } from '@gasi/core-api';

const myPlugin: PluginDefinition = {
  id:          'plugin.nama',
  name:        'Nama Plugin',
  version:     '1.0.0',
  description: 'Deskripsi singkat',
  extensions: [
    {
      point: ExtensionPoints.ROUTE,
      routes: [
        { path: '/nama/list',   component: ListPage },
        { path: '/nama/new',    component: FormPage },
        { path: '/nama/:id',    component: FormPage },
      ],
    },
  ],
  onStart() { /* dipanggil saat plugin di-start */ },
  onStop()  { /* dipanggil saat plugin di-stop  */ },
};
```

### RouteDefinition

```ts
interface RouteDefinition {
  path:      string;              // '/hr/employees/:id'
  component: ComponentType<any>; // React component
}
```

### PluginRegistry

Mengelola lifecycle semua plugin:

```ts
import { pluginRegistry } from '@gasi/core-api';

pluginRegistry.register(myPlugin);       // Daftarkan plugin
pluginRegistry.start('plugin.nama');     // Start plugin
pluginRegistry.stop('plugin.nama');      // Stop plugin
pluginRegistry.getExtensions(point);     // Ambil semua extension aktif
pluginRegistry.getPlugins();             // Ambil semua plugin + state-nya
pluginRegistry.onEvent(fn);             // Subscribe ke event lifecycle
```

## Dependency

Package ini tidak memiliki dependency runtime. Pure TypeScript.
