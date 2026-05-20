# GASI POC — Monorepo

Plugin architecture untuk React + Vite menggunakan npm workspaces.

## Struktur

```
gasi.poc.web/
├── core-api/          # Kontrak plugin (ExtensionPoints, PluginRegistry, interfaces)
├── core-starter/      # Plugin hooks, loader, dan app store
├── core-ui/           # Shared UI components, lib, dan types
├── platform-app/      # Aplikasi utama React + Vite + Shadcn
└── plugins/
    └── plugin-example/  # Contoh implementasi plugin
```

## Dependency graph

```
core-api
    ↓
core-starter
    ↓
core-ui
    ↓
platform-app  ←── plugin-*
```

Plugin yang hanya butuh registry → cukup depend ke `core-api`.
Plugin yang butuh UI component → depend ke `core-ui`.

## File naming

| Kategori | Konvensi | Contoh |
| --- | --- | --- |
| Shadcn UI (`components/ui/`) | kebab-case | `button.tsx`, `dropdown-menu.tsx` |
| Components | PascalCase | `DepartmentForm.tsx`, `ConfirmDialog.tsx` |
| Pages | PascalCase | `DepartmentListPage.tsx`, `DepartmentEditPage.tsx` |
| Hooks | camelCase + prefix `use` | `useDepartment.ts`, `useMobile.ts` |
| Services | camelCase | `departmentService.ts` |
| Schemas | camelCase | `departmentCreateSchema.ts` |
| Types | camelCase + suffix `.types` | `department.types.ts`, `api.types.ts` |
| Utilities / Lib | camelCase | `baseService.ts`, `utils.ts`, `date.ts` |
| Routes | lowercase | `routes.tsx` |
| Config files | lowercase / kebab-case | `vite.config.ts`, `tsconfig.json` |

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
3. Depend ke `@gasi/core-api` dan/atau `@gasi/core-ui`
4. Build: `npm run build -w plugins/nama-plugin`
5. File `.umd.js` otomatis masuk ke `platform-app/public/plugins/`
6. Daftarkan URL-nya di `platform-app/src/main.tsx`
