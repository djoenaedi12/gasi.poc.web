import type { ColumnDef } from "@tanstack/react-table";

import type { GenericFilter, SearchRequest, SortOrder } from "../../types/api.types";
import type { DataTableFilterField } from "./dataTableTypes";

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

export function combineFilters(
    ...filters: Array<GenericFilter | undefined>
): GenericFilter | undefined {
    const activeFilters = filters.filter(Boolean) as GenericFilter[];

    if (!activeFilters.length) {
        return undefined;
    }

    if (activeFilters.length === 1) {
        return activeFilters[0];
    }

    return {
        type: "and",
        filters: activeFilters,
    };
}

export function buildDataTableFilter(
    filters: DataTableFilterField[],
    values: Record<string, string>,
): GenericFilter | undefined {
    const simpleFilters = filters
        .filter((filter) => filter.requestFilter !== false)
        .reduce<GenericFilter[]>((result, filter) => {
            const value = values[filter.id]?.trim();
            if (!value) {
                return result;
            }

            if (filter.type === "date-range" && filter.range) {
                const [from, to] = value.split("..");

                if (from) {
                    result.push({
                        type: "simple",
                        field: filter.range.from.field,
                        operator: filter.range.from.operator,
                        value: filter.range.from.transformValue
                            ? filter.range.from.transformValue(from)
                            : from,
                    });
                }

                if (to) {
                    result.push({
                        type: "simple",
                        field: filter.range.to.field,
                        operator: filter.range.to.operator,
                        value: filter.range.to.transformValue
                            ? filter.range.to.transformValue(to)
                            : to,
                    });
                }

                return result;
            }

            if (!filter.field) {
                return result;
            }

            result.push({
                type: "simple",
                field: filter.field,
                operator: filter.operator ?? "LIKE",
                value: filter.transformValue ? filter.transformValue(value) : value,
            });
            return result;
        }, []);

    if (!simpleFilters.length) {
        return undefined;
    }

    return simpleFilters.length === 1
        ? simpleFilters[0]
        : { type: "and", filters: simpleFilters };
}

export type BuildSearchRequestOptions = {
    search: string;
    searchFields?: string[];
    buildFilter?: (search: string) => GenericFilter | undefined;
    advancedFilter?: GenericFilter;
    filters?: DataTableFilterField[];
    filterValues?: Record<string, string>;
    sorts?: SortOrder[];
    fields?: string[];
    page?: number;
    size?: number;
};

export function buildSearchRequest({
    search,
    searchFields,
    buildFilter,
    advancedFilter,
    filters = [],
    filterValues = {},
    sorts = [],
    fields,
    page,
    size,
}: BuildSearchRequestOptions): SearchRequest {
    const searchFilter = buildFilter
        ? buildFilter(search)
        : buildSearchFilter(search, searchFields);
    const requestFilter = buildDataTableFilter(filters, filterValues);
    const filter = combineFilters(searchFilter, advancedFilter, requestFilter);

    return { filter, sorts, fields, page, size };
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
