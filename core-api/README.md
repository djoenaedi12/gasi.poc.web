# @gasi/core-api

`@gasi/core-api` is the contract package for the GASI frontend plugin system. It does not contain UI code and does not load plugins from the network. Its job is to provide shared types, constants, the plugin registry, and permission helpers used by both the host app and plugins.

Use this package when creating a plugin, host runtime, or library that needs to interact with the plugin registry.

## Package Contents

```text
core-api/
└── src/
    ├── index.ts
    ├── registry/
    │   └── pluginRegistry.ts
    └── types/
        ├── extensionPoints.types.ts
        └── pluginDefinition.types.ts
```

## Main Exports

```ts
export { ExtensionPoints } from './types/extensionPoints.types';
export { Actions, resolvePermission } from './types/pluginDefinition.types';
export { PluginRegistry, pluginRegistry } from './registry/pluginRegistry';
```

Common public types:

- `PluginDefinition`
- `PluginExtension`
- `RouteDefinition`
- `AuthGuardExtension`
- `Action`
- `ExtensionPoint`
- `PluginEntry`
- `PluginState`

## Extension Points

```ts
import { ExtensionPoints } from '@gasi/core-api';

ExtensionPoints.ROUTE;
ExtensionPoints.AUTH_GUARD;
```

| Extension Point | Purpose |
| --- | --- |
| `ROUTE` | A plugin registers pages that the host app can render. |
| `AUTH_GUARD` | An auth plugin registers a route wrapper and permission checker. |

## Actions

```ts
import { Actions } from '@gasi/core-api';

Actions.READ;
Actions.CREATE;
Actions.UPDATE;
Actions.DELETE;
Actions.DOWNLOAD;
Actions.UPLOAD;
```

Route permissions are built from `resource` and `action`.

```ts
import { Actions, resolvePermission } from '@gasi/core-api';

const permission = resolvePermission({
  path: '/employees',
  component: EmployeeListPage,
  resource: 'employee',
  action: Actions.READ,
});

// employee:read
```

If a route has no `resource`, `resolvePermission` returns `undefined` and the route has no specific permission requirement.

## Route Definition

```ts
interface RouteDefinition {
  path: string;
  component: ComponentType<any>;
  public?: boolean;
  layout?: 'dashboard' | 'blank';
  title?: string;
  order?: number;
  resource?: string;
  action?: Action;
}
```

Field guide:

| Field | Description |
| --- | --- |
| `path` | React Router path, for example `/employees` or `/employees/:id`. |
| `component` | React component rendered for the route. |
| `public` | If `true`, the route is not wrapped by the auth guard. Useful for login or auth callback pages. |
| `layout` | `dashboard` or `blank`. The host defaults to dashboard for non-public routes. |
| `title` | Optional title for menus, breadcrumbs, tabs, or observability. |
| `order` | Optional ordering value when the host sorts routes. |
| `resource` | Permission resource name, for example `employee`. |
| `action` | Permission action. The permission helper defaults to `read`. |

## Plugin Definition

Every plugin registers itself with the singleton `pluginRegistry`.

```ts
import { Actions, ExtensionPoints, pluginRegistry } from '@gasi/core-api';
import { EmployeeListPage } from './features/employees/pages/EmployeeListPage';

pluginRegistry.register({
  id: 'plugin.hr',
  name: 'HR',
  version: '1.0.0',
  description: 'Human resource module',
  extensions: [
    {
      point: ExtensionPoints.ROUTE,
      routes: [
        {
          path: '/employees',
          component: EmployeeListPage,
          title: 'Employees',
          resource: 'employee',
          action: Actions.READ,
        },
      ],
    },
  ],
  async onStart() {
    // Optional startup work.
  },
  async onStop() {
    // Optional cleanup.
  },
});
```

Plugin IDs must be unique. If the same ID is registered twice, the registry logs a warning and ignores the second registration.

## Auth Guard Extension

An auth plugin can register a route guard and permission checker.

```ts
import { ExtensionPoints, pluginRegistry } from '@gasi/core-api';
import { useAppStore } from '@gasi/core-starter';
import { PermissionGuard } from './components/PermissionGuard';

pluginRegistry.register({
  id: 'plugin.auth',
  name: 'Auth',
  version: '1.0.0',
  extensions: [
    {
      point: ExtensionPoints.AUTH_GUARD,
      guard: {
        component: PermissionGuard,
        hasPermission: (permission) =>
          useAppStore.getState().hasPermission(permission),
      },
    },
  ],
});
```

The host app uses the first available guard to wrap protected routes.

## Plugin Registry

`PluginRegistry` manages plugin lifecycle and active extensions.

Plugin states:

- `registered`
- `starting`
- `started`
- `stopping`
- `stopped`
- `error`

Main operations:

```ts
import { ExtensionPoints, pluginRegistry } from '@gasi/core-api';

pluginRegistry.register(pluginDefinition);
await pluginRegistry.start('plugin.hr');
await pluginRegistry.stop('plugin.hr');

const plugins = pluginRegistry.getPlugins();
const plugin = pluginRegistry.getPlugin('plugin.hr');
const routeExtensions = pluginRegistry.getExtensions(ExtensionPoints.ROUTE);
```

Listen to registry events:

```ts
const unsubscribe = pluginRegistry.onEvent((event) => {
  console.log(event.type, event.pluginId, event.error);
});

unsubscribe();
```

## Lifecycle

1. The plugin calls `pluginRegistry.register`.
2. The registry stores the plugin with state `registered`.
3. The host calls `pluginRegistry.start(plugin.id)`.
4. The registry runs `onStart` if provided.
5. The plugin extensions are added to the active extension map.
6. The plugin state becomes `started`.
7. On stop, the registry runs `onStop` and removes the plugin extensions.

If `onStart` fails, the plugin state becomes `error` and its extensions are not activated.

## Usage Notes

- This package is source-only in the workspace. Imports from `@gasi/core-api` resolve to `src/index.ts`.
- Do not add UI dependencies to `core-api`.
- Keep plugin entry side effects limited to plugin registration.
- Public routes such as login pages should use `public: true` or `layout: 'blank'`.
