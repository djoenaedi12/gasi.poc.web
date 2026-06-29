# @gasi/core-api

`@gasi/core-api` adalah package kontrak untuk plugin system frontend GASI. Package ini tidak berisi UI dan tidak memuat plugin dari network. Tugasnya adalah menyediakan type, constant, registry, dan helper permission yang dipakai bersama oleh host application dan plugin.

Gunakan package ini saat membuat plugin, host runtime, atau library yang perlu berinteraksi dengan plugin registry.

## Isi Package

```text
core-api/
└── src/
    ├── index.ts
    ├── registry/
    │   └── pluginRegistry.ts
    └── types/
        ├── extensionPoints.types.ts
        └── pluginDefinition.types.ts
```

## Export Utama

```ts
export { ExtensionPoints } from './types/extensionPoints.types';
export { Actions, resolvePermission } from './types/pluginDefinition.types';
export { PluginRegistry, pluginRegistry } from './registry/pluginRegistry';
```

Type public yang sering dipakai:

- `PluginDefinition`
- `PluginExtension`
- `RouteDefinition`
- `AuthGuardExtension`
- `Action`
- `ExtensionPoint`
- `PluginEntry`
- `PluginState`

## Extension Points

```ts
import { ExtensionPoints } from '@gasi/core-api';

ExtensionPoints.ROUTE;
ExtensionPoints.AUTH_GUARD;
```

| Extension Point | Fungsi |
| --- | --- |
| `ROUTE` | Plugin mendaftarkan halaman yang akan dirender oleh host app. |
| `AUTH_GUARD` | Plugin auth mendaftarkan wrapper route dan function permission checker. |

## Actions

```ts
import { Actions } from '@gasi/core-api';

Actions.READ;
Actions.CREATE;
Actions.UPDATE;
Actions.DELETE;
Actions.DOWNLOAD;
Actions.UPLOAD;
```

Permission route dibentuk dari `resource` dan `action`.

```ts
import { Actions, resolvePermission } from '@gasi/core-api';

const permission = resolvePermission({
  path: '/employees',
  component: EmployeeListPage,
  resource: 'employee',
  action: Actions.READ,
});

// employee:read
```

Jika route tidak memiliki `resource`, `resolvePermission` mengembalikan `undefined` dan route dianggap tidak membutuhkan permission spesifik.

## Route Definition

```ts
interface RouteDefinition {
  path: string;
  component: ComponentType<any>;
  public?: boolean;
  layout?: 'dashboard' | 'blank';
  title?: string;
  order?: number;
  resource?: string;
  action?: Action;
}
```

Panduan field:

| Field | Keterangan |
| --- | --- |
| `path` | Path React Router, contoh `/employees` atau `/employees/:id`. |
| `component` | React component yang dirender. |
| `public` | Jika `true`, route tidak dibungkus auth guard. Cocok untuk login atau callback auth. |
| `layout` | `dashboard` atau `blank`. Default host adalah dashboard untuk route non-public. |
| `title` | Judul opsional untuk menu, breadcrumb, tab, atau observability. |
| `order` | Urutan opsional saat host menyusun route. |
| `resource` | Nama resource permission, contoh `employee`. |
| `action` | Action permission. Default permission helper adalah `read`. |

## Plugin Definition

Setiap plugin mendaftarkan dirinya ke singleton `pluginRegistry`.

```ts
import { Actions, ExtensionPoints, pluginRegistry } from '@gasi/core-api';
import { EmployeeListPage } from './features/employees/pages/EmployeeListPage';

pluginRegistry.register({
  id: 'plugin.hr',
  name: 'HR',
  version: '1.0.0',
  description: 'Human resource module',
  extensions: [
    {
      point: ExtensionPoints.ROUTE,
      routes: [
        {
          path: '/employees',
          component: EmployeeListPage,
          title: 'Employees',
          resource: 'employee',
          action: Actions.READ,
        },
      ],
    },
  ],
  async onStart() {
    // Optional startup work.
  },
  async onStop() {
    // Optional cleanup.
  },
});
```

ID plugin harus unik. Jika ID yang sama didaftarkan dua kali, registry akan memberi warning dan mengabaikan registration kedua.

## Auth Guard Extension

Plugin auth dapat mendaftarkan guard route dan permission checker.

```ts
import { ExtensionPoints, pluginRegistry } from '@gasi/core-api';
import { PermissionGuard } from './components/PermissionGuard';
import { useAppStore } from '@gasi/core-starter';

pluginRegistry.register({
  id: 'plugin.auth',
  name: 'Auth',
  version: '1.0.0',
  extensions: [
    {
      point: ExtensionPoints.AUTH_GUARD,
      guard: {
        component: PermissionGuard,
        hasPermission: (permission) =>
          useAppStore.getState().hasPermission(permission),
      },
    },
  ],
});
```

Host app akan menggunakan guard pertama yang tersedia untuk membungkus protected route.

## Plugin Registry

`PluginRegistry` mengelola lifecycle plugin dan extension aktif.

State plugin:

- `registered`
- `starting`
- `started`
- `stopping`
- `stopped`
- `error`

Operasi utama:

```ts
import { pluginRegistry, ExtensionPoints } from '@gasi/core-api';

pluginRegistry.register(pluginDefinition);
await pluginRegistry.start('plugin.hr');
await pluginRegistry.stop('plugin.hr');

const plugins = pluginRegistry.getPlugins();
const plugin = pluginRegistry.getPlugin('plugin.hr');
const routeExtensions = pluginRegistry.getExtensions(ExtensionPoints.ROUTE);
```

Mendengar event registry:

```ts
const unsubscribe = pluginRegistry.onEvent((event) => {
  console.log(event.type, event.pluginId, event.error);
});

unsubscribe();
```

## Lifecycle

1. Plugin memanggil `pluginRegistry.register`.
2. Registry menyimpan plugin dengan state `registered`.
3. Host memanggil `pluginRegistry.start(plugin.id)`.
4. Registry menjalankan `onStart` jika tersedia.
5. Extension plugin ditambahkan ke map extension aktif.
6. State plugin menjadi `started`.
7. Saat stop, registry menjalankan `onStop` lalu menghapus extension plugin dari extension aktif.

Jika `onStart` gagal, state menjadi `error` dan extension plugin tidak dipasang.

## Catatan Penggunaan

- Package ini source-only di workspace. Import dari `@gasi/core-api` diarahkan ke `src/index.ts`.
- Jangan menaruh dependency UI di `core-api`.
- Jangan menjalankan side effect selain registration plugin di file entry plugin.
- Route public seperti login sebaiknya memakai `public: true` atau `layout: 'blank'`.
