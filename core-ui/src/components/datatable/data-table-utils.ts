import type { ColumnDef } from "@tanstack/react-table";

import type { GenericFilter } from "../../types/api.types";

export type ColumnVisibilityState = Record<string, boolean>;

export type DataTableColumnMeta = {
    className?: string;
};

export type DataTableColumn = {
    id: string;
    columnDef: {
        header?: unknown;
        meta?: DataTableColumnMeta;
    };
};

export function getColumnLabel(column: DataTableColumn) {
    if (typeof column.columnDef.header === "string") {
        return column.columnDef.header;
    }

    return column.id;
}

export function getColumnClassName(columnDef: { meta?: unknown }) {
    return (columnDef.meta as DataTableColumnMeta | undefined)?.className;
}

export function buildSearchFilter(search: string, fields?: string[]) {
    const value = search.trim();

    if (!value || !fields?.length) {
        return undefined;
    }

    if (fields.length === 1) {
        return {
            type: "simple",
            field: fields[0],
            operator: "LIKE",
            value,
        } satisfies GenericFilter;
    }

    return {
        type: "or",
        filters: fields.map((field) => ({
            type: "simple",
            field,
            operator: "LIKE",
            value,
        })),
    } satisfies GenericFilter;
}

export function getColumnFieldIds<TData, TValue>(
    columns: ColumnDef<TData, TValue>[],
) {
    return columns
        .map((column) => {
            const candidate = column as {
                id?: unknown;
                accessorKey?: unknown;
            };

            if (typeof candidate.accessorKey === "string") {
                return candidate.accessorKey;
            }

            if (typeof candidate.id === "string") {
                return candidate.id;
            }

            return undefined;
        })
        .filter((field): field is string =>
            Boolean(field && !["select", "actions"].includes(field)),
        );
}

export function getSavedColumnVisibility(
    columnPreferenceKey?: string,
): ColumnVisibilityState {
    if (!columnPreferenceKey) {
        return {};
    }

    const saved = localStorage.getItem(
        `${columnPreferenceKey}:column-visibility`,
    );

    if (!saved) {
        return {};
    }

    try {
        return JSON.parse(saved) as ColumnVisibilityState;
    } catch {
        return {};
    }
}

export function getInitialColumnVisibility<TData, TValue>(
    columns: ColumnDef<TData, TValue>[],
    defaultVisibleColumns?: string[],
    columnPreferenceKey?: string,
): ColumnVisibilityState {
    const saved = getSavedColumnVisibility(columnPreferenceKey);
    if (Object.keys(saved).length > 0) return saved;

    if (!defaultVisibleColumns?.length) return {};

    const allFieldIds = getColumnFieldIds(columns);
    return Object.fromEntries(
        allFieldIds.map((field) => [field, defaultVisibleColumns.includes(field)]),
    );
}
