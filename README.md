# GASI POC — Monorepo

Plugin architecture mirip PF4J (Spring Boot) untuk React + Vite.

## Struktur

```
gasi.poc.web/
├── core-api/          # Kontrak plugin (ExtensionPoints, PluginRegistry, interfaces)
├── core-starter/      # Utility & hooks (useExtensions, PluginSlot, PluginLoader)
├── platform-app/      # Aplikasi utama React + Vite + Shadcn
└── plugins/
    └── plugin-example/  # Contoh plugin (build → UMD bundle)
```

## Cara kerja

```
core-api  →  core-starter  →  platform-app
    ↑                               ↑
    └──────── plugin-*  ────────────┘
              (build jadi .umd.js, copy manual ke platform-app/public/plugins/)
```

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
4. Build plugin: `npm run build -w plugins/nama-plugin`
5. File `.umd.js` otomatis masuk ke `platform-app/public/plugins/`
6. Daftarkan URL di `platform-app/src/main.tsx`

## Analogi Spring Boot PF4J

| Spring Boot | React + Vite |
|---|---|
| `core-api` (Maven lib) | `core-api` (TS package) |
| `core-starter` (Maven lib) | `core-starter` (TS package) |
| `platform-app` (Spring Boot app) | `platform-app` (Vite app) |
| `.jar` file | `.umd.js` file |
| `plugins/` folder | `platform-app/public/plugins/` |
| `PluginManager.loadPlugins()` | `loadAndStartPlugins()` |
| `@Plugin` annotation | `pluginRegistry.register()` |
| `@Extension` annotation | `extensions: [{ point, component }]` |
