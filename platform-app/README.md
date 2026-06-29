# @gasi/platform-app

`@gasi/platform-app` adalah aplikasi host React + Vite untuk frontend GASI. App ini memuat core packages, mengeksposnya sebagai global untuk plugin UMD, membaca manifest plugin, menjalankan plugin, lalu merender route dari extension yang didaftarkan plugin.

Fitur bisnis baru sebaiknya dibuat sebagai plugin. `platform-app` berperan sebagai shell, layout, runtime plugin, dan halaman dasar seperti dashboard/error page.

## Stack

- React 19
- TypeScript
- Vite 7
- React Router 7
- Tailwind CSS 4
- TanStack Query
- Zustand
- React Hook Form
- Zod
- Axios
- Lucide React

## Struktur

```text
platform-app/
├── public/
│   └── plugins/
│       └── manifest.json
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── features/
│   │   └── dashboard/
│   ├── layouts/
│   │   └── DashboardLayout.tsx
│   └── routes/
│       └── index.tsx
├── vite.config.ts
└── package.json
```

## Menjalankan Lokal

Dari root workspace:

```bash
npm run dev
```

Atau dari workspace platform:

```bash
npm run dev -w platform-app
```

## Build

```bash
npm run build -w platform-app
```

Preview hasil build:

```bash
npm run preview -w platform-app
```

Lint:

```bash
npm run lint -w platform-app
```

## Runtime Plugin

Entry point runtime ada di `src/main.tsx`.

Saat startup, app melakukan:

1. Import core packages:
   - `@gasi/core-api`
   - `@gasi/core-starter`
   - `@gasi/core-ui`
2. Expose core packages ke `window` supaya plugin UMD dapat memakai external global.
3. Membaca `/plugins/manifest.json`.
4. Menambahkan `/plugins/plugin-auth.umd.js` sebagai default plugin yang dicoba load pertama.
5. Memanggil `loadAndStartPlugins`.
6. Render React app setelah plugin selesai diproses.

Global yang disediakan host:

```ts
window.GasiCoreApi;
window.GasiCoreStarter;
window.GasiCoreUi;
window.React;
window.ReactRouter;
```

## Manifest Plugin

Manifest berada di:

```text
public/plugins/manifest.json
```

Format yang didukung:

```json
[
  "/plugins/plugin-example.umd.js",
  { "url": "/plugins/plugin-data-upload.umd.cjs" }
]
```

Host akan menggabungkan default plugin URL dengan isi manifest dan menghapus duplikasi.

Catatan:

- `/plugins/plugin-auth.umd.js` selalu dicoba load lebih dulu dari `src/main.tsx`.
- File plugin yang tidak ditemukan akan di-skip oleh loader dengan warning.
- Plugin yang berhasil load harus mendaftarkan dirinya ke `pluginRegistry`.

## Menambahkan Plugin ke Platform

Build plugin:

```bash
npm run build -w plugins/plugin-example
```

Salin hasil build ke:

```text
platform-app/public/plugins/
```

Tambahkan URL bundle ke manifest:

```json
[
  "/plugins/plugin-example.umd.js"
]
```

Jika memakai GASI CLI, proses deploy web akan menyalin bundle dan memperbarui manifest.

## Routing

Route platform ada di `src/routes/index.tsx`.

Route bawaan:

- `/dashboard`
- `/403`
- `/404`
- fallback `*`

Route plugin berasal dari extension point `ExtensionPoints.ROUTE`.

```tsx
const routeExts = useExtensions(ExtensionPoints.ROUTE);
const pluginRoutes = routeExts.flatMap((ext) => ext.routes ?? []);
```

Route public atau blank layout:

```ts
{
  path: '/login',
  component: LoginPage,
  public: true,
  layout: 'blank'
}
```

Route dashboard/protected:

```ts
{
  path: '/employees',
  component: EmployeeListPage,
  resource: 'employee',
  action: Actions.READ
}
```

Jika auth guard tersedia, route protected dibungkus guard. Jika auth guard tidak tersedia, route tetap dirender tanpa guard.

## Layout

Dashboard route dirender di dalam `DashboardLayout`.

Blank/public route dirender tanpa dashboard layout. Gunakan pola ini untuk halaman login, callback auth, atau halaman full-screen lain.

## API Proxy

`vite.config.ts` mem-proxy:

```text
/platform-app -> http://localhost:8080
```

Jika backend berjalan di host/port lain, ubah bagian `server.proxy`.

## Core Package Alias

`vite.config.ts` mengarahkan package internal ke source:

```ts
alias: {
  '@gasi/core-api': '../core-api/src',
  '@gasi/core-starter': '../core-starter/src',
  '@gasi/core-ui': '../core-ui/src',
}
```

Karena itu perubahan di core package langsung terasa saat dev server berjalan.

## Konvensi Perubahan

- Tambahkan fitur bisnis sebagai plugin, bukan langsung di platform shell.
- Tambahkan komponen reusable ke `core-ui`.
- Tambahkan kontrak plugin ke `core-api`.
- Tambahkan runtime helper plugin/session ke `core-starter`.
- Jaga `src/main.tsx` tetap fokus pada bootstrap.
- Jaga `src/routes/index.tsx` tetap fokus pada komposisi route host dan plugin.

## Troubleshooting

### Aplikasi kosong setelah startup

Periksa console browser. Error di plugin UMD bisa terjadi sebelum React app dirender karena app menunggu plugin loader selesai.

### Plugin tidak muncul

Periksa:

- file bundle ada di `public/plugins/`;
- manifest berisi URL yang benar;
- URL dapat diakses dari browser;
- plugin memanggil `pluginRegistry.register`;
- plugin route menggunakan `ExtensionPoints.ROUTE`.

### Login tidak muncul

Pastikan `plugin-auth.umd.js` tersedia di `public/plugins/` atau plugin auth masuk manifest dengan URL yang benar.

### API request tidak sampai backend

Pastikan backend berjalan di `http://localhost:8080` atau sesuaikan proxy Vite.
