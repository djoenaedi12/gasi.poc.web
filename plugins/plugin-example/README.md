# @gasi/plugin-example

Contoh implementasi plugin untuk GASI platform. Gunakan ini sebagai
referensi ketika membuat plugin baru.

## Struktur

```
plugin-example/
├── src/
│   ├── ExampleWidget.tsx  # React component yang di-expose sebagai extension
│   └── index.ts           # Entry point — register plugin ke pluginRegistry
├── vite.config.ts         # Build config (output UMD ke platform-app/public/plugins/)
└── package.json
```

## Cara kerja

Saat file `plugin-example.umd.js` di-load oleh platform, `index.ts` langsung
berjalan dan memanggil `pluginRegistry.register()`. Platform kemudian
memanggil `pluginRegistry.start()` untuk mengaktifkan plugin.

## Membuat plugin baru

1. Duplikat folder ini:
   ```bash
   cp -r plugins/plugin-example plugins/plugin-nama-baru
   ```

2. Update `package.json`:
   ```json
   { "name": "@gasi/plugin-nama-baru" }
   ```

3. Update `vite.config.ts`:
   ```ts
   name: 'GasiPluginNamaBaru',
   fileName: 'plugin-nama-baru',
   ```

4. Update `src/index.ts` — ganti ID, nama, dan extensions:
   ```ts
   pluginRegistry.register({
     id:      'plugin.nama-baru',
     name:    'Nama Baru Plugin',
     version: '1.0.0',
     extensions: [
       { point: ExtensionPoints.WIDGET, component: NamaBaruWidget },
     ],
   });
   ```

5. Build plugin:
   ```bash
   npm run build -w plugins/plugin-nama-baru
   ```

6. File `plugin-nama-baru.umd.js` otomatis masuk ke `platform-app/public/plugins/`

7. Daftarkan di `platform-app/src/main.tsx`:
   ```ts
   await loadAndStartPlugins([
     '/plugins/plugin-nama-baru.umd.js',
   ]);
   ```

## Dependency

Plugin hanya boleh depend ke `@gasi/core-api`. React dan core libs
tidak di-bundle (di-mark sebagai `external`) karena sudah disediakan
oleh platform saat runtime.
