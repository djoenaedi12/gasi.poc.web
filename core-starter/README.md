# @gasi/core-starter

Utility, hooks, dan komponen siap pakai untuk mengintegrasikan plugin system
ke dalam aplikasi React. Depend ke `@gasi/core-api`.

## Isi

```
core-starter/
└── src/
    ├── hooks/
    │   ├── useExtensions.ts   # Hook untuk mengambil extension aktif pada suatu point
    │   └── usePlugins.ts      # Hook untuk mengambil daftar semua plugin + state
    ├── pluginLoader.ts        # Utility untuk load plugin UMD dari URL
    ├── stores/
    │   └── useAppStore.ts     # Global session store
    └── index.ts               # Public exports
```

## API

### useExtensions

Mengambil semua extension yang aktif pada suatu extension point.
Otomatis re-render ketika ada plugin yang di-start atau di-stop.

```tsx
import { useExtensions } from '@gasi/core-starter';
import { ExtensionPoints } from '@gasi/core-api';

function Dashboard() {
  const routeExtensions = useExtensions(ExtensionPoints.ROUTE);

  return (
    <pre>{JSON.stringify(routeExtensions, null, 2)}</pre>
  );
}
```

### usePlugins

Mengambil daftar semua plugin beserta state-nya (`registered`, `started`, `stopped`).

```tsx
import { usePlugins } from '@gasi/core-starter';

function PluginManager() {
  const plugins = usePlugins();

  return (
    <ul>
      {plugins.map(p => (
        <li key={p.id}>{p.name} — {p.state}</li>
      ))}
    </ul>
  );
}
```

### loadAndStartPlugins

Load plugin UMD dari daftar URL, lalu start semua yang berhasil di-load.
Plugin yang file-nya tidak ada akan di-skip tanpa error.

```ts
import { loadAndStartPlugins } from '@gasi/core-starter';

await loadAndStartPlugins([
  '/plugins/plugin-example.umd.js',
  '/plugins/plugin-lain.umd.js',
]);
```

## Dependency

- `@gasi/core-api` — kontrak plugin
- `react` (peer) — untuk hooks dan komponen

### useAppStore

Global session store. Diisi oleh plugin-auth setelah login atau restore session.
Kalau plugin-auth tidak terpasang, `session` tetap `null`.

```ts
import { useAppStore } from '@gasi/core-starter';

// Di komponen React
const { session, hasPermission, clearSession } = useAppStore();

// Cek permission
const canDelete = hasPermission('employee:delete');

// Akses user info
const user = session?.user;
const menus = session?.menus ?? [];

// Programmatic (di luar React)
useAppStore.getState().setSession(sessionData);
useAppStore.getState().clearSession();
```

**Shape session:**
```ts
interface AppSession {
  user:        { id, username, fullName };
  roles:       string[];
  permissions: string[];  // ['employee:read', 'employee:create']
  menus:       MenuItem[];
}
```
