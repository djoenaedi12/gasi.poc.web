# @gasi/platform-app

Aplikasi utama GASI berbasis React + Vite + Shadcn. Berfungsi sebagai host
yang memuat dan menjalankan plugin-plugin yang tersedia.

## Stack

- **React 19** + **TypeScript**
- **Vite 7**
- **Shadcn UI** + **Tailwind CSS 4**
- **TanStack Query** — server state management
- **TanStack Table** — data table
- **Zustand** — client state management
- **React Hook Form** + **Zod** — form & validasi
- **React Router 7** — routing
- **Axios** — HTTP client

## Struktur

```
platform-app/
├── public/
│   └── plugins/          # Taruh file .umd.js plugin di sini (manual)
├── src/
│   ├── components/
│   │   ├── ui/           # Shadcn components
│   │   ├── molecules/    # Composite components (form, picker, dll)
│   │   ├── organisms/    # Layout components (sidebar, header)
│   │   └── datatable/    # Data table components
│   ├── features/         # Feature modules (auth, dashboard, dll)
│   ├── layouts/          # Page layouts
│   ├── lib/              # Utilities (axios, base-hooks, base-service)
│   ├── routes/           # Route definitions
│   ├── stores/           # Zustand stores
│   ├── types/            # Global TypeScript types
│   └── main.tsx          # Entry point + load plugins
└── vite.config.ts
```

## Development

```bash
# Dari root monorepo
npm run dev

# Atau langsung dari folder ini
npm install
npm run dev
```

## Menambah Plugin

1. Build plugin yang diinginkan:
   ```bash
   npm run build -w plugins/nama-plugin
   ```
2. File `.umd.js` otomatis masuk ke `public/plugins/`
3. Daftarkan URL-nya di `src/main.tsx`:
   ```ts
   await loadAndStartPlugins([
     '/plugins/nama-plugin.umd.js',
   ]);
   ```
4. Gunakan `PluginSlot` di halaman yang sesuai:
   ```tsx
   <PluginSlot point={ExtensionPoints.WIDGET} />
   ```

## Environment Variables

Salin `.env.example` menjadi `.env` dan sesuaikan:

```env
VITE_API_BASE_URL=http://localhost:8080
```
