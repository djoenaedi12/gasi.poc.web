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

Daftar extension points yang tersedia di platform:

```ts
import { ExtensionPoints } from '@gasi/core-api';

ExtensionPoints.WIDGET         // Widget di dashboard
ExtensionPoints.MENU_ITEM      // Item di sidebar
ExtensionPoints.ROUTE          // Halaman/route tambahan
ExtensionPoints.DATA_PROCESSOR // Transformasi data
```

### PluginDefinition

Interface yang harus diimplementasikan setiap plugin:

```ts
import type { PluginDefinition } from '@gasi/core-api';

const myPlugin: PluginDefinition = {
  id:          'plugin.nama',   // ID unik, format: 'plugin.nama'
  name:        'Nama Plugin',
  version:     '1.0.0',
  description: 'Deskripsi singkat',
  extensions: [
    { point: ExtensionPoints.WIDGET, component: MyWidget },
  ],
  onStart() { /* dipanggil saat plugin di-start */ },
  onStop()  { /* dipanggil saat plugin di-stop  */ },
};
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
