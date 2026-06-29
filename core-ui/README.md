# @gasi/core-ui

`@gasi/core-ui` adalah shared UI dan application helper untuk platform GASI. Package ini dipakai oleh `platform-app` dan plugin frontend agar tampilan, pola form, data table, service API, i18n, dan toast tetap konsisten.

Package ini source-only di npm workspace dan diekspor melalui `src/index.ts`.

## Isi Package

```text
core-ui/
└── src/
    ├── components/
    │   ├── ui/          # Base UI components
    │   ├── molecules/   # Form field, picker, dialog, stepper
    │   ├── organisms/   # Layout dan resource page
    │   └── datatable/   # DataTable, server table, action, export
    ├── hooks/
    ├── lib/
    ├── types/
    └── index.ts
```

## Kapan Menggunakan

Gunakan `@gasi/core-ui` saat:

- membuat page di `platform-app`;
- membuat plugin frontend;
- membutuhkan komponen form standar;
- membutuhkan data table dengan filter, sorting, pagination, bulk action, atau export;
- membuat service CRUD standar;
- membuat TanStack Query hooks standar;
- menampilkan toast atau error form dari response API;
- memakai i18n ringan di plugin.

## Export Utama

Kategori export:

- base UI: `Button`, `Input`, `Select`, `Dialog`, `DropdownMenu`, `Tabs`, `Table`, `Tooltip`, dan lainnya;
- form component: `FormInput`, `FormSelect`, `FormDatePicker`, `FormLookupPicker`, `FormArrayTable`, dan lainnya;
- layout/resource: `AppHeader`, `AppSidebar`, `PageHeader`, `ResourceListPage`;
- data table: `DataTable`, `ServerDataTable`, `DataTableSortableHeader`, `DataTableRowActions`;
- service/query helper: `api`, `createBaseService`, `createBaseHooks`;
- utility: `cn`, date/time helper, form error helper, toast, i18n;
- type API: `ApiResponse`, `PageResult`, `SearchRequest`, dan type lain dari `types/api.types`.

Import umum:

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

`createBaseService` membuat service CRUD standar untuk endpoint API yang mengikuti pola platform.

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

Method yang tersedia:

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

`createBaseHooks` membuat hook TanStack Query dari service.

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

Pola ini membantu plugin memakai query key dan invalidation yang konsisten.

## Form Components

Komponen form dibangun untuk `react-hook-form`.

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

Form component yang umum:

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

Gunakan `LookupPicker` atau `FormLookupPicker` untuk memilih data referensi dari endpoint lookup.

```tsx
import { FormLookupPicker } from '@gasi/core-ui';

<FormLookupPicker
  form={form}
  name="departmentId"
  label="Department"
  preset={departmentLookup}
/>;
```

Preset lookup biasanya diletakkan di feature plugin agar bisa dipakai ulang oleh form dan filter table.

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

Helper filter/search:

```ts
import {
  buildDataTableFilter,
  buildSearchFilter,
  buildSearchRequest,
  combineFilters,
} from '@gasi/core-ui';
```

## Resource List Page

`ResourceListPage` menyediakan pola list page yang sering dipakai generator resource.

Gunakan komponen ini saat ingin page list dengan behavior standar platform, lalu custom detailnya di feature masing-masing.

## Toast dan Error Form

```ts
import { appToast, applyApiFieldErrors } from '@gasi/core-ui';

appToast.success('Data saved');
appToast.error('Failed to save data');

applyApiFieldErrors(form, error);
```

`applyApiFieldErrors` membantu menempelkan validation error API ke field `react-hook-form`.

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

Di component:

```tsx
const t = useI18n();
return <h1>{t('employee.title')}</h1>;
```

## Styling

Gunakan utility `cn` untuk menggabungkan class Tailwind:

```ts
import { cn } from '@gasi/core-ui';

cn('flex items-center', active && 'text-primary');
```

Package ini mengandalkan styling dari host app. Plugin tidak perlu membawa Tailwind runtime sendiri, tetapi class yang dipakai plugin harus tersedia dalam build host/plugin.

## Dependency Penting

- React dan React DOM sebagai peer dependency.
- React Router sebagai peer dependency untuk integrasi route.
- Tailwind CSS sebagai peer dependency untuk styling.
- TanStack Query dan TanStack Table untuk data fetching/table.
- Axios untuk HTTP client.
- React Hook Form dan Zod untuk form dan validasi.
- Lucide React untuk icon.

## Panduan Kontribusi

- Export komponen baru dari `src/index.ts` jika perlu dipakai oleh platform atau plugin.
- Letakkan komponen base di `components/ui`.
- Letakkan komponen gabungan field/dialog/picker di `components/molecules`.
- Letakkan layout atau komponen page-level di `components/organisms`.
- Hindari menaruh logic spesifik feature bisnis di `core-ui`.
- Pertahankan API component tetap stabil karena dipakai oleh plugin generated.

## Troubleshooting

### Import tidak ditemukan

Pastikan komponen atau helper sudah diekspor dari `core-ui/src/index.ts`.

### Style tidak muncul

Pastikan class Tailwind terdeteksi oleh build host/plugin dan CSS platform sudah memuat Tailwind.

### Error API tidak tampil di form

Pastikan response backend mengikuti shape error yang didukung helper `applyApiFieldErrors`, dan nama field form sama dengan field error backend.
