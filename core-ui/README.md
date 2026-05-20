# @gasi/core-ui

Shared UI component library untuk GASI platform. Berisi semua komponen,
hooks, utilities, dan types yang bisa digunakan oleh `platform-app` maupun plugin.

## Isi

```
core-ui/
└── src/
    ├── components/
    │   ├── ui/          # Shadcn base components
    │   ├── molecules/   # Composite components (form fields, pickers, dll)
    │   ├── organisms/   # Layout components (sidebar, header)
    │   └── datatable/   # Data table components
    ├── hooks/
    │   └── use-mobile.ts
    ├── lib/
    │   ├── utils.ts          # cn() utility
    │   ├── axios.ts          # Axios instance + interceptors
    │   ├── base-service.ts   # createBaseService factory
    │   ├── base-hooks.ts     # createBaseHooks factory (TanStack Query)
    │   ├── date.ts           # Date utilities
    │   └── time.ts           # Time utilities
    ├── types/
    │   └── api.types.ts      # ApiResponse, SearchRequest, PageResult, dll
    └── index.ts              # Public exports
```

## Penggunaan

### Di platform-app atau plugin

```ts
import { Button, FormInput, DataTable } from '@gasi/core-ui';
import { createBaseService, createBaseHooks } from '@gasi/core-ui';
import type { ApiResponse, SearchRequest } from '@gasi/core-ui';
```

### createBaseService

Factory untuk membuat service CRUD dengan pola API standar:

```ts
import { createBaseService } from '@gasi/core-ui';

const userService = createBaseService<UserSummary, UserDetail, CreateUser, UpdateUser>('/api/users');

// Menghasilkan: list, page, detail, create, update, delete
await userService.list({ page: 0, size: 10 });
```

### createBaseHooks

Factory untuk membuat TanStack Query hooks dari service:

```ts
import { createBaseHooks } from '@gasi/core-ui';

const userHooks = createBaseHooks('users', userService);

// Menghasilkan: useList, usePage, useDetail, useCreate, useUpdate, useDelete
const { data } = userHooks.useList();
```

### FormInput dan form components

```tsx
import { FormInput, FormSelect, FormDatePicker } from '@gasi/core-ui';
import { useForm } from 'react-hook-form';

function MyForm() {
  const form = useForm();
  return (
    <form>
      <FormInput    form={form} name="name"      label="Nama" />
      <FormSelect   form={form} name="status"    label="Status" options={[...]} />
      <FormDatePicker form={form} name="date"    label="Tanggal" />
    </form>
  );
}
```

### DataTable

```tsx
import { DataTable } from '@gasi/core-ui';

<DataTable columns={columns} data={data} />
```

## Dependency

- `@gasi/core-api` — untuk types plugin (opsional, hanya jika plugin butuh registry)
- `react` / `react-dom` (peer)
- `tailwindcss` (peer) — styling
- `@tanstack/react-query` — untuk base hooks
- `@tanstack/react-table` — untuk datatable
- `axios` — HTTP client
- `react-hook-form` + `zod` — form & validasi
- `date-fns` / `react-day-picker` — date picker
- `lucide-react` — icons
- `clsx` + `tailwind-merge` — class utilities
