# GASI Web

GASI Web adalah workspace frontend untuk aplikasi GASI. Repo ini berisi host React yang menjalankan aplikasi utama, package internal untuk kontrak plugin, runtime loader, shared UI, dan plugin frontend yang dapat dimuat secara dinamis.

README ini membantu developer baru memahami pembagian module, menjalankan aplikasi lokal, dan mengikuti alur kerja plugin.

## Struktur Workspace

```text
gasi-web/
├── core-api/          # Kontrak plugin, extension point, registry, dan type public
├── core-starter/      # Runtime helper: plugin loader, hooks, session store
├── core-ui/           # Shared UI, data table, form component, service helper
├── platform-app/      # Aplikasi host React + Vite
└── plugins/           # Plugin frontend berbasis UMD
```

Workspace npm didefinisikan di `package.json`:

```json
{
  "workspaces": [
    "core-api",
    "core-starter",
    "core-ui",
    "platform-app",
    "plugins/*"
  ]
}
```

## Module Utama

| Module | Fungsi |
| --- | --- |
| `core-api` | Kontrak dasar plugin system: `PluginDefinition`, `ExtensionPoints`, `Actions`, `PluginRegistry`, dan `resolvePermission`. |
| `core-starter` | Utility runtime untuk host app: load plugin UMD, start plugin, membaca extension aktif, membaca daftar plugin, dan session store. |
| `core-ui` | Komponen dan helper UI bersama: Shadcn base component, form component, data table, layout component, axios instance, base service, base hooks, i18n, toast. |
| `platform-app` | Host application yang expose core libraries ke `window`, membaca manifest plugin, start plugin, dan render route dari extension. |
| `plugins/*` | Plugin frontend. Setiap plugin build menjadi UMD bundle yang dapat dimuat dari `platform-app/public/plugins/`. |

## Dependency Arah Tinggi

```text
core-api
  └── core-starter

core-api
  └── core-ui

core-api + core-starter + core-ui
  └── platform-app

core-api + core-ui + optional core-starter
  └── plugins/*
```

Aturan praktis:

- Plugin yang hanya mendaftarkan route cukup menggunakan `@gasi/core-api`.
- Plugin yang memakai komponen UI, service helper, atau data table menggunakan `@gasi/core-ui`.
- Plugin auth atau plugin yang butuh session/runtime helper dapat menggunakan `@gasi/core-starter`.
- `platform-app` adalah host, bukan tempat utama menaruh fitur bisnis baru. Fitur bisnis baru sebaiknya masuk ke plugin.

## Prasyarat

- Node.js 18 atau lebih baru.
- npm.
- Backend API berjalan jika ingin mencoba flow data nyata. Dev server platform mem-proxy `/platform-app` ke `http://localhost:8080`.

## Instalasi

Dari root workspace:

```bash
npm install
```

## Menjalankan Aplikasi

```bash
npm run dev
```

Command ini menjalankan `platform-app` melalui workspace npm.

Alternatif langsung:

```bash
npm run dev -w platform-app
```

Secara default Vite akan menampilkan URL lokal di terminal.

## Build

Build semua:

```bash
npm run build
```

Build platform app saja:

```bash
npm run build -w platform-app
```

Build plugin tertentu:

```bash
npm run build -w plugins/plugin-example
```

Package `core-api`, `core-starter`, dan `core-ui` bersifat source-only di workspace ini, sehingga script root `build:core` tidak menghasilkan bundle terpisah.

## Lint

```bash
npm run lint
```

Command root menjalankan lint untuk workspace yang memiliki script `lint`.

## Cara Runtime Plugin Bekerja

1. `platform-app/src/main.tsx` expose core libraries ke global `window`:
   - `window.GasiCoreApi`
   - `window.GasiCoreStarter`
   - `window.GasiCoreUi`
   - `window.React`
   - `window.ReactRouter`
2. Host membaca daftar plugin dari `/plugins/manifest.json`.
3. Host selalu mencoba load `/plugins/plugin-auth.umd.js` lebih dulu.
4. `loadAndStartPlugins` menambahkan script UMD ke document.
5. Plugin UMD menjalankan registration ke `pluginRegistry`.
6. Registry menjalankan lifecycle `onStart`, lalu extension plugin tersedia untuk host.
7. `platform-app/src/routes/index.tsx` membaca route extension dan merendernya.

Manifest plugin berada di:

```text
platform-app/public/plugins/manifest.json
```

Format manifest:

```json
[
  "/plugins/plugin-example.umd.js",
  { "url": "/plugins/plugin-data-upload.umd.cjs" }
]
```

## Membuat Plugin Frontend

Cara paling disarankan adalah memakai GASI CLI agar struktur plugin konsisten. Jika membuat manual, ikuti pola `plugins/plugin-example`.

Minimal `src/index.ts` plugin:

```ts
import { Actions, ExtensionPoints, pluginRegistry } from '@gasi/core-api';
import { ExamplePage } from './features/example/routes';

pluginRegistry.register({
  id: 'plugin.example',
  name: 'Example',
  version: '1.0.0',
  extensions: [
    {
      point: ExtensionPoints.ROUTE,
      routes: [
        {
          path: '/example',
          component: ExamplePage,
          resource: 'example',
          action: Actions.READ,
        },
      ],
    },
  ],
});
```

Build plugin:

```bash
npm run build -w plugins/plugin-example
```

Deploy hasil build ke host:

- salin bundle UMD ke `platform-app/public/plugins/`;
- tambahkan URL bundle ke `platform-app/public/plugins/manifest.json`;
- restart atau refresh dev server.

## File Naming

| Kategori | Konvensi | Contoh |
| --- | --- | --- |
| Shadcn/base UI | kebab-case | `button.tsx`, `dropdown-menu.tsx` |
| Component | PascalCase | `EmployeeForm.tsx`, `ConfirmDialog.tsx` |
| Page | PascalCase | `EmployeeListPage.tsx` |
| Hook | camelCase dengan prefix `use` | `useEmployee.ts` |
| Service | camelCase | `employeeService.ts` |
| Schema | camelCase | `employeeCreateSchema.ts` |
| Types | camelCase + `.types.ts` | `employee.types.ts` |
| Route module | `routes.tsx` | `routes.tsx` |
| Utility | camelCase | `baseService.ts`, `date.ts` |

## Environment dan API

`platform-app/vite.config.ts` mem-proxy request berikut:

```text
/platform-app -> http://localhost:8080
```

Axios instance bersama berada di `core-ui/src/lib/axios.ts` dan diekspor sebagai `api`.

## README Lanjutan

- `core-api/README.md`: kontrak plugin dan registry.
- `core-starter/README.md`: loader, hooks, dan session store.
- `core-ui/README.md`: shared UI dan helper aplikasi.
- `platform-app/README.md`: host application dan manifest plugin.

## Troubleshooting

### Plugin tidak muncul

Periksa:

- bundle plugin ada di `platform-app/public/plugins/`;
- URL bundle terdaftar di `platform-app/public/plugins/manifest.json`;
- plugin memanggil `pluginRegistry.register`;
- route plugin menggunakan `ExtensionPoints.ROUTE`;
- console browser tidak menunjukkan error saat load script.

### Route plugin kena 403

Periksa `resource` dan `action` route. Permission dihitung sebagai:

```text
{resource}:{action}
```

Contoh `resource: "employee"` dan `action: Actions.READ` menjadi `employee:read`.

### Request API gagal saat dev

Pastikan backend berjalan di `http://localhost:8080` atau sesuaikan proxy di `platform-app/vite.config.ts`.
