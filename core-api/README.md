# @gasi/core-api

Kontrak dan definisi inti untuk plugin system.

## Isi

```
core-api/
└── src/
    ├── registry/
    │   └── pluginRegistry.ts          # PluginRegistry class + singleton pluginRegistry
    ├── types/
    │   ├── extensionPoints.types.ts   # ROUTE, AUTH_GUARD
    │   └── pluginDefinition.types.ts  # PluginDefinition, RouteDefinition, Actions, resolvePermission
    └── index.ts
```

## API

### ExtensionPoints

```ts
import { ExtensionPoints } from '@gasi/core-api';

ExtensionPoints.ROUTE       // Plugin daftarkan halaman
ExtensionPoints.AUTH_GUARD  // Plugin auth daftarkan guard & permission checker
```

### Actions

Standard actions yang dipakai semua plugin:

```ts
import { Actions } from '@gasi/core-api';

Actions.READ    // 'read'
Actions.CREATE  // 'create'
Actions.UPDATE  // 'update'
Actions.DELETE  // 'delete'
Actions.DOWNLOAD // 'download'
Actions.UPLOAD   // 'upload'
```

### RouteDefinition

```ts
interface RouteDefinition {
  path:      string;
  component: ComponentType<any>;
  resource?: string;  // 'employee' — tanpa prefix plugin
  action?:   Action;  // default: 'read'
}

// Permission di-generate otomatis: resource:action
// 'employee' + 'read' → 'employee:read'
```

### resolvePermission

```ts
import { resolvePermission, Actions } from '@gasi/core-api';

resolvePermission({ path: '/employees', component: X, resource: 'employee', action: Actions.READ })
// → 'employee:read'

resolvePermission({ path: '/employees', component: X })
// → undefined (bebas diakses)
```

### Plugin definition contoh

```ts
import { pluginRegistry, ExtensionPoints, Actions } from '@gasi/core-api';
import type { PluginDefinition } from '@gasi/core-api';

pluginRegistry.register({
  id:      'plugin.hr',
  name:    'HR Module',
  version: '1.0.0',
  extensions: [
    {
      point: ExtensionPoints.ROUTE,
      routes: [
        { path: '/employees',      component: EmployeeListPage,   resource: 'employee', action: Actions.READ   },
        { path: '/employees/new',  component: EmployeeFormPage,   resource: 'employee', action: Actions.CREATE },
        { path: '/employees/:id',  component: EmployeeFormPage,   resource: 'employee', action: Actions.UPDATE },
      ],
    },
  ],
});
```

### Auth Guard (plugin-auth)

```ts
pluginRegistry.register({
  id: 'plugin.auth',
  extensions: [
    {
      point: ExtensionPoints.AUTH_GUARD,
      guard: {
        component:     PermissionGuard,   // wrap protected routes
        hasPermission: (p) => store.hasPermission(p),
      },
    },
    {
      point: ExtensionPoints.ROUTE,
      routes: [
        { path: '/login', component: LoginPage },
      ],
    },
  ],
  async onStart() {
    // Restore session saat refresh
    try {
      await api.get('/auth/validate');
      const res = await api.get('/auth/me');
      useAppStore.getState().setSession(res.data);
    } catch { /* tidak ada session, redirect akan handle */ }
  },
});
```

### Behaviour tanpa plugin-auth

| Kondisi | Behaviour |
|---|---|
| Sidebar | Kosong (session null, tidak ada menu) |
| Routes plugin | Bisa diakses bebas (tidak ada guard) |
| hasPermission | Selalu false |
| Login page | Tidak ada |
