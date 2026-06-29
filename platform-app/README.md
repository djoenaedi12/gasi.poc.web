# @gasi/platform-app

`@gasi/platform-app` is the React + Vite host application for the GASI frontend. It loads the core packages, exposes them as globals for UMD plugins, reads the plugin manifest, starts plugins, and renders routes registered through plugin extensions.

New business features should usually be built as plugins. `platform-app` acts as the shell, layout, plugin runtime, and owner of base pages such as dashboard and error pages.

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

## Structure

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

## Run Locally

From the workspace root:

```bash
npm run dev
```

Or directly through the platform workspace:

```bash
npm run dev -w platform-app
```

## Build

```bash
npm run build -w platform-app
```

Preview the build:

```bash
npm run preview -w platform-app
```

Lint:

```bash
npm run lint -w platform-app
```

## Plugin Runtime

The runtime entry point is `src/main.tsx`.

On startup, the app:

1. Imports core packages:
   - `@gasi/core-api`
   - `@gasi/core-starter`
   - `@gasi/core-ui`
2. Exposes core packages on `window` so UMD plugins can use external globals.
3. Reads `/plugins/manifest.json`.
4. Adds `/plugins/plugin-auth.umd.js` as the default plugin loaded first.
5. Calls `loadAndStartPlugins`.
6. Renders the React app after plugin loading finishes.

Globals provided by the host:

```ts
window.GasiCoreApi;
window.GasiCoreStarter;
window.GasiCoreUi;
window.React;
window.ReactRouter;
```

## Plugin Manifest

Manifest path:

```text
public/plugins/manifest.json
```

Supported format:

```json
[
  "/plugins/plugin-example.umd.js",
  { "url": "/plugins/plugin-data-upload.umd.cjs" }
]
```

The host merges the default plugin URL with manifest entries and removes duplicates.

Notes:

- `/plugins/plugin-auth.umd.js` is always attempted first from `src/main.tsx`.
- Missing plugin files are skipped by the loader with a warning.
- A loaded plugin must register itself with `pluginRegistry`.

## Adding a Plugin to the Platform

Build the plugin:

```bash
npm run build -w plugins/plugin-example
```

Copy the build output to:

```text
platform-app/public/plugins/
```

Add the bundle URL to the manifest:

```json
[
  "/plugins/plugin-example.umd.js"
]
```

If you use GASI CLI, web deploy copies the bundle and updates the manifest for you.

## Routing

Platform routes are defined in `src/routes/index.tsx`.

Built-in routes:

- `/dashboard`
- `/403`
- `/404`
- fallback `*`

Plugin routes come from `ExtensionPoints.ROUTE`.

```tsx
const routeExts = useExtensions(ExtensionPoints.ROUTE);
const pluginRoutes = routeExts.flatMap((ext) => ext.routes ?? []);
```

Public or blank-layout route:

```ts
{
  path: '/login',
  component: LoginPage,
  public: true,
  layout: 'blank'
}
```

Dashboard/protected route:

```ts
{
  path: '/employees',
  component: EmployeeListPage,
  resource: 'employee',
  action: Actions.READ
}
```

If an auth guard is available, protected routes are wrapped by it. If no auth guard is available, protected routes are still rendered without a guard.

## Layout

Dashboard routes are rendered inside `DashboardLayout`.

Blank/public routes are rendered without the dashboard layout. Use this for login pages, auth callbacks, or other full-screen pages.

## API Proxy

`vite.config.ts` proxies:

```text
/platform-app -> http://localhost:8080
```

If the backend runs on another host or port, update `server.proxy`.

## Core Package Aliases

`vite.config.ts` maps internal packages to source:

```ts
alias: {
  '@gasi/core-api': '../core-api/src',
  '@gasi/core-starter': '../core-starter/src',
  '@gasi/core-ui': '../core-ui/src',
}
```

Because of this, changes in core packages are visible immediately while the dev server is running.

## Change Conventions

- Add business features as plugins, not directly in the platform shell.
- Add reusable components to `core-ui`.
- Add plugin contracts to `core-api`.
- Add plugin/session runtime helpers to `core-starter`.
- Keep `src/main.tsx` focused on bootstrap.
- Keep `src/routes/index.tsx` focused on host and plugin route composition.

## Troubleshooting

### The app is blank after startup

Check the browser console. A UMD plugin error can happen before the React app renders because startup waits for plugin loading.

### Plugin does not appear

Check that:

- the bundle exists in `public/plugins/`;
- the manifest contains the correct URL;
- the URL is accessible from the browser;
- the plugin calls `pluginRegistry.register`;
- the plugin route uses `ExtensionPoints.ROUTE`.

### Login does not appear

Make sure `plugin-auth.umd.js` exists in `public/plugins/`, or that the auth plugin is listed in the manifest with the correct URL.

### API requests do not reach the backend

Make sure the backend is running on `http://localhost:8080`, or update the Vite proxy.
