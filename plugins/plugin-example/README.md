# @gasi/plugin-example

Contoh implementasi plugin untuk GASI platform.

## Struktur

```
plugin-example/
├── src/
│   ├── features/
│   │   └── example/
│   │       └── routes.tsx     # Definisi route + resource + action
│   ├── ExampleWidget.tsx      # Page components
│   └── index.ts               # Entry point — register plugin
├── vite.config.ts             # Build UMD → dist/
└── package.json
```

## Membuat plugin baru (contoh: plugin-hr)

**1. Buat struktur features:**
```
plugin-hr/
└── src/
    ├── features/
    │   ├── employee/
    │   │   ├── pages/
    │   │   │   ├── EmployeeListPage.tsx
    │   │   │   └── EmployeeFormPage.tsx
    │   │   └── routes.tsx
    │   └── organization/
    │       └── routes.tsx
    └── index.ts
```

**2. Setiap feature define routes dengan resource + action:**
```ts
// features/employee/routes.tsx
import { Actions } from '@gasi/core-api';
import type { RouteDefinition } from '@gasi/core-api';

export const employeeRoutes: RouteDefinition[] = [
  { path: '/employees',      component: EmployeeListPage,   resource: 'employee', action: Actions.READ   },
  { path: '/employees/new',  component: EmployeeFormPage,   resource: 'employee', action: Actions.CREATE },
  { path: '/employees/:id',  component: EmployeeFormPage,   resource: 'employee', action: Actions.UPDATE },
];
// Permission otomatis: 'employee:read', 'employee:create', 'employee:update'
// Kalau plugin-auth tidak ada → permission diabaikan, route bebas diakses
```

**3. index.ts kumpulkan semua routes:**
```ts
import { pluginRegistry, ExtensionPoints } from '@gasi/core-api';
import { employeeRoutes }     from './features/employee/routes';
import { organizationRoutes } from './features/organization/routes';

pluginRegistry.register({
  id:      'plugin.hr',
  name:    'HR Module',
  version: '1.0.0',
  extensions: [
    {
      point:  ExtensionPoints.ROUTE,
      routes: [
        ...employeeRoutes,
        ...organizationRoutes,
      ],
    },
  ],
});
```

**4. Build dan deploy:**
```bash
npm run build -w plugins/plugin-hr      # → dist/plugin-hr.umd.js
gasi plugin deploy hr --target web      # → platform-app/public/plugins/
```

**5. Daftarkan di platform-app/src/main.tsx:**
```ts
await loadAndStartPlugins([
  '/plugins/plugin-hr.umd.js',
]);
```

## Permission pattern

Resource name tanpa prefix plugin — cukup nama entity:

| Resource | Action | Permission |
|---|---|---|
| `employee` | `read` | `employee:read` |
| `employee` | `create` | `employee:create` |
| `payroll` | `read` | `payroll:read` |

Permission di-enforce oleh plugin-auth. Kalau plugin-auth tidak terpasang,
semua route bisa diakses tanpa pengecekan.
