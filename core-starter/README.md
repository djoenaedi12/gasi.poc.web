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
    ├── components/
    │   └── PluginSlot.tsx     # Komponen untuk me-render extension di UI
    ├── PluginLoader.ts        # Utility untuk load plugin UMD dari URL
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
  const widgets = useExtensions(ExtensionPoints.WIDGET);

  return (
    <div>
      {widgets.map((ext, i) => {
        const Widget = ext.component!;
        return <Widget key={i} />;
      })}
    </div>
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

### PluginSlot

Komponen deklaratif untuk me-render semua plugin pada suatu extension point.

```tsx
import { PluginSlot } from '@gasi/core-starter';
import { ExtensionPoints } from '@gasi/core-api';

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <PluginSlot
        point={ExtensionPoints.WIDGET}
        fallback={<p>Tidak ada widget aktif</p>}
      />
    </div>
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
