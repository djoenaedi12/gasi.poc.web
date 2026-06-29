# @gasi/core-starter

`@gasi/core-starter` provides runtime utilities for integrating the plugin system into a React app. It depends on `@gasi/core-api` and provides the UMD plugin loader, hooks for reading extensions and plugins, resource permission helpers, and a Zustand-based session store.

Use this package in the host app and in plugins that need runtime or session access.

## Package Contents

```text
core-starter/
└── src/
    ├── hooks/
    │   ├── useExtensions.ts
    │   ├── usePlugins.ts
    │   └── useResourcePermissions.ts
    ├── stores/
    │   └── useAppStore.ts
    ├── index.ts
    └── pluginLoader.ts
```

## Main Exports

```ts
export { useExtensions } from './hooks/useExtensions';
export { usePlugins } from './hooks/usePlugins';
export { resourcePermission, useResourcePermissions } from './hooks/useResourcePermissions';
export { loadExternalPlugins, loadAndStartPlugins } from './pluginLoader';
export { useAppStore } from './stores/useAppStore';
```

Public types:

- `ResourcePermissions`
- `AppUser`
- `AppSession`
- `MenuItem`

## Plugin Loader

### `loadExternalPlugins`

Loads UMD plugin files from URLs. Missing files are skipped with a warning instead of stopping the app.

```ts
import { loadExternalPlugins } from '@gasi/core-starter';

await loadExternalPlugins([
  '/plugins/plugin-auth.umd.js',
  '/plugins/plugin-example.umd.js',
]);
```

### `loadAndStartPlugins`

Loads UMD plugins and starts all registered plugins that are still in the `registered` state.

```ts
import { loadAndStartPlugins } from '@gasi/core-starter';

await loadAndStartPlugins([
  '/plugins/plugin-auth.umd.js',
  '/plugins/plugin-example.umd.js',
]);
```

Workflow:

1. Fetch each plugin URL to confirm it is available.
2. Add the script to `document.head`.
3. The plugin UMD bundle registers itself with `pluginRegistry`.
4. The loader reads the plugin list from the registry.
5. The loader calls `pluginRegistry.start` for plugins that are still `registered`.

## Hooks

### `useExtensions`

Reads active extensions for an extension point. The hook re-renders when the registry changes.

```tsx
import { ExtensionPoints } from '@gasi/core-api';
import { useExtensions } from '@gasi/core-starter';

function RouteDebug() {
  const routeExtensions = useExtensions(ExtensionPoints.ROUTE);
  return <pre>{JSON.stringify(routeExtensions, null, 2)}</pre>;
}
```

### `usePlugins`

Reads all plugins and their lifecycle states.

```tsx
import { usePlugins } from '@gasi/core-starter';

function PluginList() {
  const plugins = usePlugins();

  return (
    <ul>
      {plugins.map((plugin) => (
        <li key={plugin.id}>
          {plugin.name} - {plugin.state}
        </li>
      ))}
    </ul>
  );
}
```

### `useResourcePermissions`

Builds common permission checks for a resource.

```tsx
import { useResourcePermissions } from '@gasi/core-starter';

function EmployeeToolbar() {
  const permissions = useResourcePermissions('employee');

  return (
    <>
      {permissions.canCreate && <button>Create</button>}
      {permissions.canDelete && <button>Delete</button>}
    </>
  );
}
```

Permission string helper:

```ts
import { resourcePermission } from '@gasi/core-starter';

resourcePermission('employee', 'read'); // employee:read
```

## Session Store

`useAppStore` is a Zustand store for application session state.

```ts
import { useAppStore } from '@gasi/core-starter';

const session = useAppStore((state) => state.session);
const hasPermission = useAppStore((state) => state.hasPermission);

const canReadEmployee = hasPermission('employee:read');
```

Access outside React components:

```ts
useAppStore.getState().setSession(sessionData);
useAppStore.getState().clearSession();
```

Session shape:

```ts
interface AppSession {
  user: AppUser;
  roles: string[];
  permissions: string[];
  menus: MenuItem[];
}
```

The auth plugin is responsible for filling the session after login or session restore. If no auth plugin is installed, `session` remains `null` and permission checks follow the empty state.

## Usage in Platform App

Typical host pattern:

```ts
import { loadAndStartPlugins } from '@gasi/core-starter';

const urls = [
  '/plugins/plugin-auth.umd.js',
  '/plugins/plugin-example.umd.js',
];

await loadAndStartPlugins(urls);
```

The host routes then read extensions:

```tsx
import { ExtensionPoints, resolvePermission } from '@gasi/core-api';
import { useExtensions } from '@gasi/core-starter';

const routeExtensions = useExtensions(ExtensionPoints.ROUTE);
const guardExtensions = useExtensions(ExtensionPoints.AUTH_GUARD);
```

## Integration Notes

- `core-starter` requires React as a peer dependency.
- The loader runs in the browser because it uses `fetch` and `document`.
- UMD plugins must be built with globals that match the host: `React`, `GasiCoreApi`, `GasiCoreStarter`, and `GasiCoreUi`.
- A plugin that fails to load does not stop other plugins.
- A plugin that fails to start enters the `error` state.

## Troubleshooting

### Plugin does not start

Check that the plugin file calls:

```ts
pluginRegistry.register({ ... });
```

If the script loads but does not register a plugin, the loader has no new plugin to start.

### Hook does not update

Make sure plugin changes happen through `pluginRegistry.start` or `pluginRegistry.stop`, because hooks listen to registry events.

### Permission is always false

Make sure the session store is populated by the auth plugin and that the permission string uses `{resource}:{action}` format.
