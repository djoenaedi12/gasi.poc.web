# @gasi/core-starter

`@gasi/core-starter` berisi utility runtime untuk mengintegrasikan plugin system ke aplikasi React. Package ini bergantung pada `@gasi/core-api` dan menyediakan loader plugin UMD, hook untuk membaca extension/plugin, helper permission resource, dan session store berbasis Zustand.

Gunakan package ini di host application dan plugin yang perlu akses runtime/session.

## Isi Package

```text
core-starter/
└── src/
    ├── hooks/
    │   ├── useExtensions.ts
    │   ├── usePlugins.ts
    │   └── useResourcePermissions.ts
    ├── stores/
    │   └── useAppStore.ts
    ├── index.ts
    └── pluginLoader.ts
```

## Export Utama

```ts
export { useExtensions } from './hooks/useExtensions';
export { usePlugins } from './hooks/usePlugins';
export { resourcePermission, useResourcePermissions } from './hooks/useResourcePermissions';
export { loadExternalPlugins, loadAndStartPlugins } from './pluginLoader';
export { useAppStore } from './stores/useAppStore';
```

Type public:

- `ResourcePermissions`
- `AppUser`
- `AppSession`
- `MenuItem`

## Plugin Loader

### `loadExternalPlugins`

Memuat file plugin UMD dari URL. File yang tidak ditemukan akan di-skip dengan warning, bukan menghentikan aplikasi.

```ts
import { loadExternalPlugins } from '@gasi/core-starter';

await loadExternalPlugins([
  '/plugins/plugin-auth.umd.js',
  '/plugins/plugin-example.umd.js',
]);
```

### `loadAndStartPlugins`

Memuat UMD plugin lalu menjalankan semua plugin yang sudah terdaftar dengan state `registered`.

```ts
import { loadAndStartPlugins } from '@gasi/core-starter';

await loadAndStartPlugins([
  '/plugins/plugin-auth.umd.js',
  '/plugins/plugin-example.umd.js',
]);
```

Alur kerja:

1. Fetch URL plugin untuk memastikan file tersedia.
2. Tambahkan script ke `document.head`.
3. Plugin UMD melakukan registration ke `pluginRegistry`.
4. Loader membaca daftar plugin dari registry.
5. Loader menjalankan `pluginRegistry.start` untuk plugin yang masih `registered`.

## Hooks

### `useExtensions`

Mengambil extension aktif berdasarkan extension point. Hook akan re-render saat registry berubah.

```tsx
import { ExtensionPoints } from '@gasi/core-api';
import { useExtensions } from '@gasi/core-starter';

function RouteDebug() {
  const routeExtensions = useExtensions(ExtensionPoints.ROUTE);
  return <pre>{JSON.stringify(routeExtensions, null, 2)}</pre>;
}
```

### `usePlugins`

Mengambil daftar plugin dan state lifecycle-nya.

```tsx
import { usePlugins } from '@gasi/core-starter';

function PluginList() {
  const plugins = usePlugins();

  return (
    <ul>
      {plugins.map((plugin) => (
        <li key={plugin.id}>
          {plugin.name} - {plugin.state}
        </li>
      ))}
    </ul>
  );
}
```

### `useResourcePermissions`

Membantu membentuk permission standar untuk resource.

```tsx
import { useResourcePermissions } from '@gasi/core-starter';

function EmployeeToolbar() {
  const permissions = useResourcePermissions('employee');

  return (
    <>
      {permissions.canCreate && <button>Create</button>}
      {permissions.canDelete && <button>Delete</button>}
    </>
  );
}
```

Helper string permission:

```ts
import { resourcePermission } from '@gasi/core-starter';

resourcePermission('employee', 'read'); // employee:read
```

## Session Store

`useAppStore` adalah Zustand store untuk session aplikasi.

```ts
import { useAppStore } from '@gasi/core-starter';

const session = useAppStore((state) => state.session);
const hasPermission = useAppStore((state) => state.hasPermission);

const canReadEmployee = hasPermission('employee:read');
```

Akses di luar component:

```ts
useAppStore.getState().setSession(sessionData);
useAppStore.getState().clearSession();
```

Shape session:

```ts
interface AppSession {
  user: AppUser;
  roles: string[];
  permissions: string[];
  menus: MenuItem[];
}
```

Plugin auth bertanggung jawab mengisi session setelah login atau restore session. Jika plugin auth tidak terpasang, `session` tetap `null` dan permission check akan mengikuti state kosong.

## Penggunaan di Platform App

Contoh pola di host:

```ts
import { loadAndStartPlugins } from '@gasi/core-starter';

const urls = [
  '/plugins/plugin-auth.umd.js',
  '/plugins/plugin-example.umd.js',
];

await loadAndStartPlugins(urls);
```

Lalu route host membaca extension:

```tsx
import { ExtensionPoints, resolvePermission } from '@gasi/core-api';
import { useExtensions } from '@gasi/core-starter';

const routeExtensions = useExtensions(ExtensionPoints.ROUTE);
const guardExtensions = useExtensions(ExtensionPoints.AUTH_GUARD);
```

## Catatan Integrasi

- `core-starter` membutuhkan React sebagai peer dependency.
- Loader berjalan di browser karena menggunakan `fetch` dan `document`.
- Plugin UMD harus dibuat dengan external global yang cocok dengan host: `React`, `GasiCoreApi`, `GasiCoreStarter`, dan `GasiCoreUi`.
- Plugin yang gagal load tidak menghentikan plugin lain.
- Plugin yang gagal start akan masuk state `error`.

## Troubleshooting

### Plugin tidak start

Periksa apakah file plugin benar-benar melakukan:

```ts
pluginRegistry.register({ ... });
```

Jika script berhasil dimuat tetapi plugin tidak register, loader tidak punya plugin baru untuk di-start.

### Hook tidak update

Pastikan perubahan plugin dilakukan melalui `pluginRegistry.start` atau `pluginRegistry.stop`, karena hook mendengar event dari registry.

### Permission selalu false

Pastikan session store sudah diisi oleh plugin auth dan permission string sesuai format `{resource}:{action}`.
