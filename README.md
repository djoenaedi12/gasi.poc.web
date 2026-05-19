# GASI POC — Monorepo

Plugin architecture untuk React + Vite menggunakan npm workspaces.

## Struktur

```
gasi.poc.web/
├── core-api/          # Kontrak plugin (ExtensionPoints, PluginRegistry, interfaces)
├── core-starter/      # Utility & hooks (useExtensions, PluginSlot, PluginLoader)
├── platform-app/      # Aplikasi utama React + Vite + Shadcn
└── plugins/
    └── plugin-example/  # Contoh implementasi plugin
```

## Cara kerja

```
core-api  →  core-starter  →  platform-app
    ↑                               ↑
    └──────── plugin-*  ────────────┘
```

Plugin di-build menjadi file `.umd.js` dan di-copy manual ke
`platform-app/public/plugins/`. Platform akan load plugin saat startup —
jika file tidak ada, plugin di-skip dan app tetap berjalan normal.

## Development

```bash
# Install semua dependencies
npm install

# Jalankan platform-app
npm run dev

# Build plugin (output ke platform-app/public/plugins/)
npm run build -w plugins/plugin-example

# Build semua
npm run build
```

## Membuat plugin baru

1. Buat folder `plugins/nama-plugin/`
2. Ikuti struktur `plugins/plugin-example/`
3. Plugin depend ke `@gasi/core-api`
4. Build: `npm run build -w plugins/nama-plugin`
5. File `.umd.js` otomatis masuk ke `platform-app/public/plugins/`
6. Daftarkan URL-nya di `platform-app/src/main.tsx`
