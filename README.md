# GASI Web

GASI Web is the frontend workspace for the GASI application. It contains the React host app, internal packages for the plugin contract and runtime, shared UI components, and frontend plugins that can be loaded dynamically.

This README is written for new developers who need to understand the workspace structure, run the app locally, and follow the plugin workflow.

## Workspace Structure

```text
gasi-web/
├── core-api/          # Plugin contracts, extension points, registry, and public types
├── core-starter/      # Runtime helpers: plugin loader, hooks, session store
├── core-ui/           # Shared UI, data table, form components, service helpers
├── platform-app/      # React + Vite host application
└── plugins/           # Frontend plugins built as UMD bundles
```

The npm workspaces are defined in `package.json`:

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

## Main Modules

| Module | Purpose |
| --- | --- |
| `core-api` | Base plugin system contract: `PluginDefinition`, `ExtensionPoints`, `Actions`, `PluginRegistry`, and `resolvePermission`. |
| `core-starter` | Runtime utilities for the host app: load UMD plugins, start plugins, read active extensions, read plugin states, and manage session state. |
| `core-ui` | Shared UI and application helpers: base components, form components, data table, layout components, axios instance, base service, base hooks, i18n, and toast. |
| `platform-app` | Host application that exposes core libraries on `window`, reads the plugin manifest, starts plugins, and renders plugin routes. |
| `plugins/*` | Frontend plugins. Each plugin builds to a UMD bundle that can be loaded from `platform-app/public/plugins/`. |

## Dependency Direction

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

Practical rules:

- A plugin that only registers routes can depend on `@gasi/core-api`.
- A plugin that uses UI components, service helpers, or data tables should depend on `@gasi/core-ui`.
- Auth plugins or plugins that need session/runtime helpers can depend on `@gasi/core-starter`.
- `platform-app` is the host shell. New business features should usually live in plugins.

## Prerequisites

- Node.js 18 or newer.
- npm.
- A running backend API if you want to test real data flows. The platform dev server proxies `/platform-app` to `http://localhost:8080`.

## Install

From the workspace root:

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

This runs `platform-app` through npm workspaces.

Alternative:

```bash
npm run dev -w platform-app
```

Vite will print the local URL in the terminal.

## Build

Build everything:

```bash
npm run build
```

Build only the platform app:

```bash
npm run build -w platform-app
```

Build a specific plugin:

```bash
npm run build -w plugins/plugin-example
```

`core-api`, `core-starter`, and `core-ui` are source-only packages in this workspace, so the root `build:core` script does not produce separate bundles.

## Lint

```bash
npm run lint
```

The root command runs lint for workspaces that define a `lint` script.

## How Plugin Runtime Works

1. `platform-app/src/main.tsx` exposes core libraries globally:
   - `window.GasiCoreApi`
   - `window.GasiCoreStarter`
   - `window.GasiCoreUi`
   - `window.React`
   - `window.ReactRouter`
2. The host reads plugin URLs from `/plugins/manifest.json`.
3. The host always tries to load `/plugins/plugin-auth.umd.js` first.
4. `loadAndStartPlugins` injects each UMD script into the document.
5. The plugin UMD bundle registers itself with `pluginRegistry`.
6. The registry runs the plugin lifecycle and activates its extensions.
7. `platform-app/src/routes/index.tsx` reads route extensions and renders them.

Plugin manifest path:

```text
platform-app/public/plugins/manifest.json
```

Manifest format:

```json
[
  "/plugins/plugin-example.umd.js",
  { "url": "/plugins/plugin-data-upload.umd.cjs" }
]
```

## Creating a Frontend Plugin

The recommended path is to use GASI CLI so the generated structure stays consistent. If you create a plugin manually, follow `plugins/plugin-example`.

Minimal plugin entry:

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

Build the plugin:

```bash
npm run build -w plugins/plugin-example
```

Deploy the build output to the host:

- copy the UMD bundle to `platform-app/public/plugins/`;
- add the bundle URL to `platform-app/public/plugins/manifest.json`;
- restart or refresh the dev server.

## File Naming

| Category | Convention | Example |
| --- | --- | --- |
| Base UI | kebab-case | `button.tsx`, `dropdown-menu.tsx` |
| Component | PascalCase | `EmployeeForm.tsx`, `ConfirmDialog.tsx` |
| Page | PascalCase | `EmployeeListPage.tsx` |
| Hook | camelCase with `use` prefix | `useEmployee.ts` |
| Service | camelCase | `employeeService.ts` |
| Schema | camelCase | `employeeCreateSchema.ts` |
| Types | camelCase + `.types.ts` | `employee.types.ts` |
| Route module | `routes.tsx` | `routes.tsx` |
| Utility | camelCase | `baseService.ts`, `date.ts` |

## Environment and API

`platform-app/vite.config.ts` proxies:

```text
/platform-app -> http://localhost:8080
```

The shared axios instance is in `core-ui/src/lib/axios.ts` and is exported as `api`.

## Related READMEs

- `core-api/README.md`: plugin contracts and registry.
- `core-starter/README.md`: loader, hooks, and session store.
- `core-ui/README.md`: shared UI and app helpers.
- `platform-app/README.md`: host application and plugin manifest.

## Troubleshooting

### Plugin does not appear

Check that:

- the plugin bundle exists in `platform-app/public/plugins/`;
- the bundle URL is listed in `platform-app/public/plugins/manifest.json`;
- the plugin calls `pluginRegistry.register`;
- the plugin route uses `ExtensionPoints.ROUTE`;
- the browser console has no script loading error.

### Plugin route returns 403

Check the route `resource` and `action`. Permission is resolved as:

```text
{resource}:{action}
```

For example, `resource: "employee"` and `action: Actions.READ` become `employee:read`.

### API requests fail in development

Make sure the backend is running on `http://localhost:8080`, or update the proxy in `platform-app/vite.config.ts`.
