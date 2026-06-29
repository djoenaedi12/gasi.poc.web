# @gasi/core-ui

`@gasi/core-ui` is the shared UI and application helper package for the GASI platform. It is used by `platform-app` and frontend plugins so UI, forms, data tables, API services, i18n, and toast behavior stay consistent.

This package is source-only in the npm workspace and is exported through `src/index.ts`.

## Package Contents

```text
core-ui/
└── src/
    ├── components/
    │   ├── ui/          # Base UI components
    │   ├── molecules/   # Form fields, pickers, dialogs, steppers
    │   ├── organisms/   # Layout and resource pages
    │   └── datatable/   # DataTable, server table, actions, export
    ├── hooks/
    ├── lib/
    ├── types/
    └── index.ts
```

## When to Use

Use `@gasi/core-ui` when you are:

- building a page in `platform-app`;
- building a frontend plugin;
- using standard form components;
- using data tables with filters, sorting, pagination, bulk actions, or export;
- creating standard CRUD services;
- creating standard TanStack Query hooks;
- showing toast messages or applying API validation errors to a form;
- using lightweight i18n inside a plugin.

## Main Exports

Export categories:

- base UI: `Button`, `Input`, `Select`, `Dialog`, `DropdownMenu`, `Tabs`, `Table`, `Tooltip`, and others;
- form components: `FormInput`, `FormSelect`, `FormDatePicker`, `FormLookupPicker`, `FormArrayTable`, and others;
- layout/resource components: `AppHeader`, `AppSidebar`, `PageHeader`, `ResourceListPage`;
- data table: `DataTable`, `ServerDataTable`, `DataTableSortableHeader`, `DataTableRowActions`;
- service/query helpers: `api`, `createBaseService`, `createBaseHooks`;
- utilities: `cn`, date/time helpers, form error helpers, toast, i18n;
- API types: `ApiResponse`, `PageResult`, `SearchRequest`, and other types from `types/api.types`.

Common import:

```ts
import {
  Button,
  DataTable,
  FormInput,
  PageHeader,
  api,
  createBaseHooks,
  createBaseService,
} from '@gasi/core-ui';
```

## Base Service

`createBaseService` creates a standard CRUD service for platform-style API endpoints.

```ts
import { createBaseService } from '@gasi/core-ui';
import type {
  EmployeeCreateRequest,
  EmployeeDetailResponse,
  EmployeeSummaryResponse,
  EmployeeUpdateRequest,
} from './employee.types';

export const employeeService = createBaseService<
  EmployeeSummaryResponse,
  EmployeeDetailResponse,
  EmployeeCreateRequest,
  EmployeeUpdateRequest
>('/platform-app/api/v1/employees');
```

Available methods:

| Method | Endpoint |
| --- | --- |
| `list(request)` | `POST {basePath}/search/list` |
| `page(request)` | `POST {basePath}/search/page` |
| `lookupPage(request)` | `POST {basePath}/lookup/search/page` |
| `detail(id)` | `GET {basePath}/{id}` |
| `create(data)` | `POST {basePath}` |
| `update(id, data)` | `PUT {basePath}/{id}` |
| `delete(id)` | `DELETE {basePath}/{id}` |

## Base Hooks

`createBaseHooks` creates TanStack Query hooks from a service.

```ts
import { createBaseHooks } from '@gasi/core-ui';
import { employeeService } from '../services/employeeService';

export const employeeHooks = createBaseHooks('employees', employeeService);

export const {
  useList,
  usePage,
  useDetail,
  useCreate,
  useUpdate,
  useDelete,
} = employeeHooks;
```

This keeps query keys and invalidation behavior consistent across plugins.

## Resource Custom Registry

Generated web resources can read optional custom behavior through a shared
registry. No custom file is required by default; register one only when a
resource needs custom UI behavior.

```ts
import { registerResourceCustom } from '@gasi/core-ui';
import { employeeCustom } from './features/employees/custom/employeeCustom';

registerResourceCustom('employee', employeeCustom);
```

Generated code reads the registry with `getResourceCustom`. If nothing is
registered, it receives an empty custom object.

## Form Components

Form components are designed for `react-hook-form`.

```tsx
import { FormInput, FormSelect, FormSwitch } from '@gasi/core-ui';
import { useForm } from 'react-hook-form';

function EmployeeForm() {
  const form = useForm({
    defaultValues: {
      fullName: '',
      status: 'ACTIVE',
      active: true,
    },
  });

  return (
    <form>
      <FormInput form={form} name="fullName" label="Full Name" />
      <FormSelect
        form={form}
        name="status"
        label="Status"
        options={[
          { label: 'Active', value: 'ACTIVE' },
          { label: 'Inactive', value: 'INACTIVE' },
        ]}
      />
      <FormSwitch form={form} name="active" label="Active" />
    </form>
  );
}
```

Common form components:

- `FormInput`
- `FormTextarea`
- `FormSelect`
- `FormMultiSelect`
- `FormDatePicker`
- `FormDateTimePicker`
- `FormTimePicker`
- `FormCheckbox`
- `FormSwitch`
- `FormRadioGroup`
- `FormLookupPicker`
- `FormArrayTable`

## Lookup

Use `LookupPicker` or `FormLookupPicker` to select reference data from lookup endpoints.

```tsx
import { FormLookupPicker } from '@gasi/core-ui';

<FormLookupPicker
  form={form}
  name="departmentId"
  label="Department"
  preset={departmentLookup}
/>;
```

Lookup presets usually live in the plugin feature so they can be reused by forms and table filters.

## Data Table

Client-side table:

```tsx
import { DataTable } from '@gasi/core-ui';

<DataTable columns={columns} data={rows} />;
```

Server-side table:

```tsx
import { ServerDataTable } from '@gasi/core-ui';

<ServerDataTable
  columns={columns}
  data={page?.content ?? []}
  pageCount={page?.totalPages ?? 0}
  totalElements={page?.totalElements ?? 0}
  isLoading={isLoading}
  onSearchRequestChange={setSearchRequest}
/>;
```

Search and filter helpers:

```ts
import {
  buildDataTableFilter,
  buildSearchFilter,
  buildSearchRequest,
  combineFilters,
} from '@gasi/core-ui';
```

## Resource List Page

`ResourceListPage` provides the standard list-page pattern used by generated resources.

Use it when you need a list page with platform-standard behavior and feature-specific details.

## Toast and Form Errors

```ts
import { appToast, applyApiFieldErrors } from '@gasi/core-ui';

appToast.success('Data saved');
appToast.error('Failed to save data');

applyApiFieldErrors(form, error);
```

`applyApiFieldErrors` maps API validation errors onto `react-hook-form` fields.

## I18n

```ts
import {
  registerTranslations,
  setLocale,
  translate,
  useI18n,
} from '@gasi/core-ui';

registerTranslations('employee', {
  en: { 'employee.title': 'Employees' },
  id: { 'employee.title': 'Karyawan' },
});

setLocale('id');
translate('employee.title');
```

Inside a component:

```tsx
const t = useI18n();
return <h1>{t('employee.title')}</h1>;
```

## Styling

Use `cn` to combine Tailwind classes:

```ts
import { cn } from '@gasi/core-ui';

cn('flex items-center', active && 'text-primary');
```

This package relies on styles provided by the host app. Plugins do not need to ship their own Tailwind runtime, but classes used by plugins must be visible to the host/plugin build.

## Important Dependencies

- React and React DOM as peer dependencies.
- React Router as a peer dependency for route integration.
- Tailwind CSS as a peer dependency for styling.
- TanStack Query and TanStack Table for data fetching and tables.
- Axios for HTTP.
- React Hook Form and Zod for forms and validation.
- Lucide React for icons.

## Contribution Guidelines

- Export new reusable components from `src/index.ts`.
- Put base components in `components/ui`.
- Put combined fields, dialogs, and pickers in `components/molecules`.
- Put layout or page-level components in `components/organisms`.
- Avoid business-feature-specific logic in `core-ui`.
- Keep component APIs stable because generated plugins depend on them.

## Troubleshooting

### Import cannot be found

Make sure the component or helper is exported from `core-ui/src/index.ts`.

### Styles do not appear

Make sure Tailwind can detect the classes used by the host/plugin build and that the platform CSS loads Tailwind.

### API errors do not appear on the form

Make sure the backend response shape is supported by `applyApiFieldErrors`, and that form field names match backend error field names.
