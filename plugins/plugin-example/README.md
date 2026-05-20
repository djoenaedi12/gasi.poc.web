# @gasi/plugin-example

Contoh implementasi plugin untuk GASI platform. Gunakan ini sebagai
referensi ketika membuat plugin baru.

## Struktur

```
plugin-example/
├── src/
│   ├── features/
│   │   └── example/
│   │       └── routes.tsx     # Definisi route untuk feature ini
│   ├── ExampleWidget.tsx      # Page components
│   └── index.ts               # Entry point — kumpulkan routes & register plugin
├── vite.config.ts
└── package.json
```

## Cara kerja

Saat file `plugin-example.umd.js` di-load oleh platform, `index.ts` langsung
berjalan dan memanggil `pluginRegistry.register()` dengan mendaftarkan
semua route milik plugin. Platform kemudian me-mount route-route tersebut
ke React Router.

## Membuat plugin baru (contoh: plugin-hr)

**1. Duplikat folder ini:**
```bash
cp -r plugins/plugin-example plugins/plugin-hr
```

**2. Update `package.json`:**
```json
{ "name": "@gasi/plugin-hr" }
```

**3. Update `vite.config.ts`:**
```ts
name:     'GasiPluginHr',
fileName: 'plugin-hr',
```

**4. Buat struktur features:**
```
plugin-hr/
└── src/
    ├── features/
    │   ├── employee/
    │   │   ├── pages/
    │   │   │   ├── EmployeeListPage.tsx
    │   │   │   └── EmployeeFormPage.tsx
    │   │   ├── employeeService.ts
    │   │   ├── employeeHooks.ts
    │   │   ├── employeeSchema.ts
    │   │   └── routes.tsx
    │   ├── organization/
    │   │   └── routes.tsx
    │   └── position/
    │       └── routes.tsx
    └── index.ts
```

**5. Setiap feature punya `routes.tsx` sendiri:**
```ts
// features/employee/routes.tsx
import type { RouteDefinition } from '@gasi/core-api';
import { EmployeeListPage } from './pages/EmployeeListPage';
import { EmployeeFormPage } from './pages/EmployeeFormPage';

export const employeeRoutes: RouteDefinition[] = [
  { path: '/hr/employees',      component: EmployeeListPage },
  { path: '/hr/employees/new',  component: EmployeeFormPage },
  { path: '/hr/employees/:id',  component: EmployeeFormPage },
];
```

**6. `index.ts` kumpulkan semua routes dari features:**
```ts
import { pluginRegistry, ExtensionPoints } from '@gasi/core-api';
import { employeeRoutes }     from './features/employee/routes';
import { organizationRoutes } from './features/organization/routes';
import { positionRoutes }     from './features/position/routes';

pluginRegistry.register({
  id:      'plugin.hr',
  name:    'HR Module',
  version: '1.0.0',
  extensions: [
    {
      point: ExtensionPoints.ROUTE,
      routes: [
        ...employeeRoutes,
        ...organizationRoutes,
        ...positionRoutes,
      ],
    },
  ],
});
```

**7. Build plugin:**
```bash
npm run build -w plugins/plugin-hr
```

**8. Daftarkan di `platform-app/src/main.tsx`:**
```ts
await loadAndStartPlugins([
  '/plugins/plugin-hr.umd.js',
]);
```

## Di platform-app — mount route dari semua plugin

```tsx
// platform-app/src/routes/index.tsx
import { useExtensions } from '@gasi/core-starter';
import { ExtensionPoints } from '@gasi/core-api';

function AppRoutes() {
  const routeExts = useExtensions(ExtensionPoints.ROUTE);
  const pluginRoutes = routeExts.flatMap(ext => ext.routes ?? []);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<DashboardPage />} />

        {/* Route dari semua plugin yang aktif */}
        {pluginRoutes.map(r => (
          <Route key={r.path} path={r.path} element={<r.component />} />
        ))}
      </Route>
    </Routes>
  );
}
```

## Dependency

Plugin depend ke `@gasi/core-api` untuk kontrak dan `@gasi/core-ui` untuk
UI components. React dan semua core libs tidak di-bundle karena sudah
disediakan platform saat runtime.
