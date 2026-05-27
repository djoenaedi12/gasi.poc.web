import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type ColumnDef,
    type Header,
    type PaginationState,
    type Row,
    type RowSelectionState,
    type SortingState,
    type TableOptions,
    type Updater,
    useReactTable,
} from "@tanstack/react-table";
import type { UseQueryResult } from "@tanstack/react-query";
import {
    ChevronDown,
    ChevronFirst,
    ChevronLast,
    ChevronLeft,
    ChevronRight,
    Columns3,
    Download,
    Search,
    SearchX,
    X,
} from "lucide-react";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    EmptyContent,
} from "../ui/empty";
import { type MouseEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import type {
    GenericFilter,
    PageResult,
    SearchRequest,
    SortOrder,
} from "../../types/api.types";

import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { DateRangePicker } from "../molecules/DateRangePicker";
import {
    Popover,
    PopoverContent,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from "../ui/popover";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table";
import { exportVisibleTableRowsToCsv } from "./dataTableExport";
import { DataTableSortableHeader } from "./DataTableSortableHeader";
import {
    buildSearchRequest,
    getColumnFieldIds,
    getColumnClassName,
    getColumnLabel,
    getSavedColumnVisibility,
    getInitialColumnVisibility,
    type ColumnVisibilityState,
    type DataTableColumn,
} from "./dataTableUtils";
import type {
    DataTableAction,
    DataTableEmptyState,
    DataTableFilterChip,
    DataTableFilterControl,
    DataTableFilterField,
} from "./dataTableTypes";

function formatDateLabel(value: string) {
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
}

function formatFilterChipValue(filter: DataTableFilterField, value: string) {
    if (filter.type === "date-range") {
        const [from, to] = value.split("..");

        if (from && to) {
            return `${formatDateLabel(from)} - ${formatDateLabel(to)}`;
        }

        if (from) {
            return `From ${formatDateLabel(from)}`;
        }

        if (to) {
            return `Until ${formatDateLabel(to)}`;
        }
    }

    if (filter.type === "multi-select") {
        return value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
            .map((item) => filter.options?.find((option) => option.value === item)?.label ?? item)
            .join(", ");
    }

    if (filter.type === "select" || filter.type === "boolean") {
        return filter.options?.find((option) => option.value === value)?.label ?? value;
    }

    if (filter.type === "toggle") {
        return filter.options?.find((option) => option.value === value)?.label ?? filter.label;
    }

    return value;
}

function renderFilterControl(filter: DataTableFilterControl, mode: "inline" | "toolbar" = "toolbar") {
    if (filter.renderControl) {
        return filter.renderControl(filter);
    }

    const selectedValues = filter.value
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
    const selectedLabels = selectedValues
        .map((value) => filter.options?.find((option) => option.value === value)?.label ?? value);
    const className = mode === "inline" ? "h-10 w-full sm:w-44" : "h-10 w-full sm:w-48";

    if (filter.type === "select" || filter.type === "boolean") {
        return (
            <select
                value={filter.value}
                onChange={(event) => filter.onChange(event.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
                {(filter.options ?? []).map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        );
    }

    if (filter.type === "toggle") {
        return (
            <label className="flex h-10 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs">
                <Switch
                    checked={filter.value === "true"}
                    onCheckedChange={(checked) => filter.onChange(checked ? "true" : "")}
                    size="sm"
                />
                <span className="truncate">{filter.label}</span>
            </label>
        );
    }

    if (filter.type === "multi-select") {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger
                    render={
                        <Button
                            type="button"
                            variant="outline"
                            className={[
                                "justify-between truncate",
                                mode === "inline" ? "w-full sm:w-48" : "w-full sm:w-52",
                            ].join(" ")}
                        />
                    }
                >
                    <span className="truncate">
                        {selectedLabels.length ? selectedLabels.join(", ") : filter.placeholder ?? filter.label}
                    </span>
                    <ChevronDown className="size-4 shrink-0 opacity-70" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" sideOffset={6} className="w-52">
                    <DropdownMenuGroup>
                        {(filter.options ?? []).map((option) => {
                            const checked = selectedValues.includes(option.value);
                            return (
                                <DropdownMenuCheckboxItem
                                    key={option.value}
                                    checked={checked}
                                    onCheckedChange={(nextChecked) => {
                                        const nextValues = nextChecked
                                            ? [...selectedValues, option.value]
                                            : selectedValues.filter((value) => value !== option.value);
                                        filter.onChange(nextValues.join(","));
                                    }}
                                >
                                    {option.label}
                                </DropdownMenuCheckboxItem>
                            );
                        })}
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    if (filter.type === "date-range") {
        return (
            <DateRangePicker
                value={filter.value}
                onChange={filter.onChange}
                placeholder={filter.placeholder ?? filter.label}
                className={mode === "toolbar" ? "w-full sm:w-auto" : "w-full"}
            />
        );
    }

    return (
        <Input
            type={filter.type === "date" ? "date" : undefined}
            value={filter.value}
            onChange={(event) => filter.onChange(event.target.value)}
            placeholder={filter.placeholder}
            className={className}
        />
    );
}

function renderHeader<TData>(header: Header<TData, unknown>) {
    if (header.isPlaceholder) {
        return null;
    }

    if (header.column.getCanSort()) {
        return (
            <DataTableSortableHeader
                label={getColumnLabel(header.column as DataTableColumn)}
                column={header.column}
            />
        );
    }

    return flexRender(
        header.column.columnDef.header,
        header.getContext(),
    );
}

export type DataTableProps<TData, TValue> = {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    searchKey?: string;
    searchPlaceholder?: string;
    emptyTitle?: string;
    emptyDescription?: string;
    emptyAction?: ReactNode;
    defaultPageSize?: number;
    pageSizeOptions?: number[];
    enableRowSelection?: boolean;
    rowSelectionMode?: "single" | "multiple";
    getRowId?: (row: TData) => string;
    renderSelectedActions?: (selectedRows: TData[]) => ReactNode;
    rowSelection?: RowSelectionState;
    onRowSelectionChange?: (selection: RowSelectionState) => void;
    onRowDoubleClick?: (row: TData) => void;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    toolbar?: ReactNode;
    toolbarEnd?: ReactNode;
    activeFilterChips?: DataTableFilterChip[];
    onClearFilters?: () => void;
    activeFilters?: ReactNode;
    entityLabel?: string;
    emptyState?: DataTableEmptyState;
    filteredEmptyState?: DataTableEmptyState;
    highlightFirstRow?: boolean;
    actions?: DataTableAction[];
    primaryAction?: DataTableAction;
    enableColumnSettings?: boolean;
    columnPreferenceKey?: string;
    initialColumnVisibility?: ColumnVisibilityState;
    defaultVisibleColumns?: string[];
    onColumnVisibilityChange?: (visibility: ColumnVisibilityState) => void;
    enableCsvExport?: boolean;
    csvFileName?: string;

    // Server-side props
    serverSide?: boolean;
    totalRows?: number;
    page?: number;
    pageSize?: number;
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
    onSortingChange?: (sorts: { field: string; direction: "ASC" | "DESC" }[]) => void;
};

export type ServerDataTableProps<TData, TValue> = Omit<
    DataTableProps<TData, TValue>,
    | "data"
    | "serverSide"
    | "totalRows"
    | "page"
    | "pageSize"
    | "onPageChange"
    | "onPageSizeChange"
    | "onSortingChange"
    | "searchValue"
    | "onSearchChange"
    | "initialColumnVisibility"
> & {
    pageQuery: (
        request: SearchRequest,
    ) => UseQueryResult<PageResult<TData> | undefined, unknown>;
    searchFields?: string[];
    buildFilter?: (search: string) => GenericFilter | undefined;
    filters?: DataTableFilterField[];
    advancedFilter?: GenericFilter;
    defaultSearchValue?: string;
    defaultVisibleColumns?: string[];
    loadingTitle?: string;
    errorDescription?: string;
};

export function ServerDataTable<TData, TValue>({
    columns,
    pageQuery,
    searchFields,
    buildFilter,
    filters = [],
    advancedFilter,
    columnPreferenceKey,
    defaultSearchValue = "",
    defaultPageSize = 10,
    defaultVisibleColumns,
    loadingTitle = "Loading data...",
    emptyTitle = "No data found",
    emptyDescription,
    errorDescription = "Unable to load data from API.",
    ...props
}: ServerDataTableProps<TData, TValue>) {
    const [search, setSearch] = useState(defaultSearchValue);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(defaultPageSize);
    const [sorts, setSorts] = useState<SortOrder[]>([]);
    const [draftFilterValues, setDraftFilterValues] = useState<Record<string, string>>(
        () => Object.fromEntries(filters.map((filter) => [filter.id, filter.value ?? ""])),
    );
    const [appliedFilterValues, setAppliedFilterValues] = useState<Record<string, string>>(
        () => Object.fromEntries(filters.map((filter) => [filter.id, filter.value ?? ""])),
    );
    const [columnVisibility, setColumnVisibility] =
        useState<ColumnVisibilityState>(() =>
            getInitialColumnVisibility(columns, defaultVisibleColumns, columnPreferenceKey),
        );

    const fields = useMemo(() => {
        const fieldIds = getColumnFieldIds(columns);
        return fieldIds.filter((field) => columnVisibility[field] !== false);
    }, [columnVisibility, columns]);

    const activeFilterChips = useMemo<DataTableFilterChip[]>(() => (
        filters
            .filter((filter) => filter.requestFilter !== false)
            .reduce<DataTableFilterChip[]>((result, filter) => {
                const value = appliedFilterValues[filter.id]?.trim();
                if (!value) {
                    return result;
                }

                result.push({
                    id: filter.id,
                    label: `${filter.chipLabel ?? filter.label}: ${formatFilterChipValue(filter, value)}`,
                    onRemove: () => {
                        setDraftFilterValues((current) => ({ ...current, [filter.id]: "" }));
                        setAppliedFilterValues((current) => ({ ...current, [filter.id]: "" }));
                        setPage(0);
                    },
                });
                return result;
            }, [])
    ), [appliedFilterValues, filters]);

    const inlineFilterControls = useMemo<DataTableFilterControl[]>(() => (
        filters
            .filter((filter) => filter.placement === "inline")
            .map((filter) => ({
                ...filter,
                value: appliedFilterValues[filter.id] ?? "",
                onChange: (value) => {
                    setDraftFilterValues((current) => ({ ...current, [filter.id]: value }));
                    setAppliedFilterValues((current) => ({ ...current, [filter.id]: value }));
                    setPage(0);
                },
            }))
    ), [appliedFilterValues, filters]);
    const toolbarFilterControls = useMemo<DataTableFilterControl[]>(() => (
        filters
            .filter((filter) => filter.placement !== "inline")
            .map((filter) => ({
                ...filter,
                value: appliedFilterValues[filter.id] ?? "",
                onChange: (value) => {
                    setDraftFilterValues((current) => ({ ...current, [filter.id]: value }));
                    setAppliedFilterValues((current) => ({ ...current, [filter.id]: value }));
                    setPage(0);
                },
            }))
    ), [appliedFilterValues, filters]);

    const handleResetFilters = () => {
        const emptyValues = Object.fromEntries(filters.map((filter) => [filter.id, ""]));
        setDraftFilterValues(emptyValues);
        setAppliedFilterValues(emptyValues);
        setPage(0);
    };

    const searchRequest = useMemo<SearchRequest>(() => (
        buildSearchRequest({
            search,
            searchFields,
            buildFilter,
            advancedFilter,
            filters,
            filterValues: appliedFilterValues,
            sorts,
            fields,
            page,
            size: pageSize,
        })
    ), [advancedFilter, appliedFilterValues, buildFilter, fields, filters, page, pageSize, search, searchFields, sorts]);

    const query = pageQuery(searchRequest);
    const pageResult = query.data;

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(0);
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setPage(0);
    };

    const handleSortingChange = (nextSorts: SortOrder[]) => {
        setSorts(nextSorts);
        setPage(0);
    };
    const { toolbar: providedToolbar, toolbarEnd: providedToolbarEnd, ...dataTableProps } = props;
    const inlineFilters = inlineFilterControls.length ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {inlineFilterControls.map((filter) => (
                <div key={filter.id} className="flex min-w-0 items-center">
                    {renderFilterControl(filter, "inline")}
                </div>
            ))}
        </div>
    ) : null;
    const toolbarFilters = toolbarFilterControls.length ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {toolbarFilterControls.map((filter) => (
                <div key={filter.id} className="flex min-w-0 items-center">
                    {renderFilterControl(filter, "toolbar")}
                </div>
            ))}
        </div>
    ) : null;
    const resolvedToolbar = inlineFilters || providedToolbar ? (
        <>
            {inlineFilters}
            {providedToolbar}
        </>
    ) : undefined;
    const resolvedToolbarEnd = toolbarFilters || providedToolbarEnd ? (
        <>
            {toolbarFilters}
            {providedToolbarEnd}
        </>
    ) : undefined;

    return (
        <DataTable
            {...dataTableProps}
            serverSide
            columns={columns}
            data={pageResult?.content ?? []}
            totalRows={pageResult?.totalElements}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
            onSortingChange={handleSortingChange}
            searchValue={search}
            onSearchChange={handleSearchChange}
            toolbar={resolvedToolbar}
            toolbarEnd={resolvedToolbarEnd}
            activeFilterChips={activeFilterChips}
            onClearFilters={handleResetFilters}
            defaultPageSize={defaultPageSize}
            emptyTitle={query.isLoading ? loadingTitle : emptyTitle}
            emptyDescription={query.isError ? errorDescription : emptyDescription}
            columnPreferenceKey={columnPreferenceKey}
            initialColumnVisibility={columnVisibility}
            defaultVisibleColumns={defaultVisibleColumns}
            onColumnVisibilityChange={setColumnVisibility}
        />
    );
}

export function DataTable<TData, TValue>({
    columns,
    data,
    searchKey,
    searchPlaceholder = "Search...",
    emptyTitle = "No data found",
    emptyDescription,
    emptyAction,
    defaultPageSize = 10,
    pageSizeOptions = [5, 10, 20, 50, 100],
    enableRowSelection = false,
    rowSelectionMode = "multiple",
    getRowId,
    renderSelectedActions,
    rowSelection: controlledRowSelection,
    onRowSelectionChange,
    onRowDoubleClick,
    searchValue,
    onSearchChange,
    toolbar,
    toolbarEnd,
    activeFilterChips = [],
    onClearFilters,
    activeFilters,
    entityLabel = "row(s)",
    emptyState,
    filteredEmptyState,
    highlightFirstRow = false,
    actions = [],
    primaryAction,
    enableColumnSettings = false,
    columnPreferenceKey,
    initialColumnVisibility,
    defaultVisibleColumns,
    onColumnVisibilityChange,
    enableCsvExport = false,
    csvFileName = "table-export.csv",
    serverSide = false,
    totalRows,
    page = 0,
    pageSize,
    onPageChange,
    onPageSizeChange,
    onSortingChange,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [internalGlobalFilter, setInternalGlobalFilter] = useState("");
    const [internalRowSelection, setInternalRowSelection] =
        useState<RowSelectionState>({});

    const [columnVisibility, setColumnVisibility] =
        useState<ColumnVisibilityState>(() =>
            initialColumnVisibility ?? getSavedColumnVisibility(columnPreferenceKey),
        );

    useEffect(() => {
        if (!columnPreferenceKey) {
            return;
        }

        localStorage.setItem(
            `${columnPreferenceKey}:column-visibility`,
            JSON.stringify(columnVisibility),
        );
    }, [columnPreferenceKey, columnVisibility]);

    const globalFilter = searchValue ?? internalGlobalFilter;
    const rowSelection = controlledRowSelection ?? internalRowSelection;
    const resolvedPageSize = pageSize ?? defaultPageSize;

    const handleSearchChange = (value: string) => {
        if (onSearchChange) {
            onSearchChange(value);
            return;
        }

        setInternalGlobalFilter(value);
    };

    const isInteractiveTarget = (target: EventTarget | null) =>
        target instanceof HTMLElement &&
        Boolean(target.closest(
            'a, button, input, select, textarea, [role="button"], [role="checkbox"], [role="menuitem"], [data-slot="checkbox"]',
        ));

    const handleTableRowClick = (
        event: MouseEvent<HTMLTableRowElement>,
        row: Row<TData>,
    ) => {
        if (!enableRowSelection || event.detail > 1 || isInteractiveTarget(event.target)) {
            return;
        }

        row.toggleSelected(!row.getIsSelected());
    };

    const handleTableRowDoubleClick = (
        event: MouseEvent<HTMLTableRowElement>,
        row: Row<TData>,
    ) => {
        if (!onRowDoubleClick || isInteractiveTarget(event.target)) {
            return;
        }

        onRowDoubleClick(row.original);
    };

    const handleRowSelectionChange = (updater: Updater<RowSelectionState>) => {
        const nextSelection =
            typeof updater === "function" ? updater(rowSelection) : updater;

        if (onRowSelectionChange) {
            onRowSelectionChange(nextSelection);
            return;
        }

        setInternalRowSelection(nextSelection);
    };

    const handleColumnVisibilityChange = (
        updater: Updater<ColumnVisibilityState>,
    ) => {
        const nextVisibility =
            typeof updater === "function" ? updater(columnVisibility) : updater;

        setColumnVisibility(nextVisibility);
        onColumnVisibilityChange?.(nextVisibility);
    };

    const handlePaginationChange = (updater: Updater<PaginationState>) => {
        const current: PaginationState = { pageIndex: page, pageSize: resolvedPageSize };
        const next = typeof updater === "function" ? updater(current) : updater;
        if (next.pageIndex !== current.pageIndex) onPageChange?.(next.pageIndex);
        if (next.pageSize !== current.pageSize) onPageSizeChange?.(next.pageSize);
    };

    const tableColumns = useMemo<ColumnDef<TData, unknown>[]>(() => {
        if (!enableRowSelection) {
            return columns as ColumnDef<TData, unknown>[];
        }

        return [
            {
                id: "select",
                size: 40,
                meta: {
                    className: "w-10 min-w-10 max-w-10 px-0",
                },
                header: ({ table }) =>
                    rowSelectionMode === "single" ? (
                        <div className="w-10" />
                    ) : (
                        <div className="flex w-10 items-center justify-center">
                            <Checkbox
                                checked={table.getIsAllPageRowsSelected()}
                                onCheckedChange={(checked) =>
                                    table.toggleAllPageRowsSelected(!!checked)
                                }
                                aria-label="Select all rows"
                            />
                        </div>
                    ),
                cell: ({ row }) => (
                    <div className="flex w-10 items-center justify-center">
                        <Checkbox
                            checked={row.getIsSelected()}
                            onCheckedChange={(checked) =>
                                row.toggleSelected(!!checked)
                            }
                            aria-label="Select row"
                        />
                    </div>
                ),
                enableSorting: false,
                enableHiding: false,
            },
            ...(columns as ColumnDef<TData, unknown>[]),
        ];
    }, [columns, enableRowSelection, rowSelectionMode]);

    const tableOptions: TableOptions<TData> = {
        data,
        columns: tableColumns,
        state: {
            sorting,
            globalFilter: serverSide ? undefined : globalFilter,
            rowSelection,
            columnVisibility,
            ...(serverSide && {
                pagination: { pageIndex: page, pageSize: resolvedPageSize },
            }),
        },
        getRowId,
        enableRowSelection,
        enableMultiRowSelection: rowSelectionMode === "multiple",
        initialState: {
            pagination: { pageSize: defaultPageSize },
        },
        manualFiltering: serverSide,
        manualPagination: serverSide,
        manualSorting: serverSide,
        rowCount: serverSide ? (totalRows ?? 0) : undefined,
        onSortingChange: (updater) => {
            const next = typeof updater === "function" ? updater(sorting) : updater;
            setSorting(next);
            if (serverSide) {
                onSortingChange?.(next.map((s) => ({ field: s.id, direction: s.desc ? "DESC" : "ASC" as const })));
            }
        },
        onRowSelectionChange: handleRowSelectionChange,
        onColumnVisibilityChange: handleColumnVisibilityChange,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    };

    if (serverSide) {
        tableOptions.onPaginationChange = handlePaginationChange;
    } else {
        tableOptions.onGlobalFilterChange = (value) => {
            const nextValue =
                typeof value === "function" ? value(globalFilter) : value;
            handleSearchChange(String(nextValue));
        };
        tableOptions.getFilteredRowModel = getFilteredRowModel();
        tableOptions.globalFilterFn = (row, _columnId, filterValue) => {
            const value = String(filterValue).toLowerCase();

            if (!searchKey) {
                return Object.values(row.original as Record<string, unknown>).some(
                    (item) => String(item).toLowerCase().includes(value),
                );
            }

            return String(row.getValue(searchKey))
                .toLowerCase()
                .includes(value);
        };
    }

    const table = useReactTable(tableOptions);

    const selectedRows = table
        .getSelectedRowModel()
        .rows.map((row) => row.original);

    const resetColumnVisibility = () => {
        const defaultVisibility = getInitialColumnVisibility(
            columns,
            defaultVisibleColumns,
        );

        setColumnVisibility(defaultVisibility);
        onColumnVisibilityChange?.(defaultVisibility);

        if (columnPreferenceKey) {
            localStorage.removeItem(`${columnPreferenceKey}:column-visibility`);
        }
    };

    const hideableColumns = table
        .getAllLeafColumns()
        .filter((column) => column.getCanHide());

    const visibleHideableColumnCount = hideableColumns.filter((column) =>
        column.getIsVisible(),
    ).length;
    const areAllHideableColumnsVisible =
        hideableColumns.length > 0 &&
        visibleHideableColumnCount === hideableColumns.length;
    const areSomeHideableColumnsVisible =
        visibleHideableColumnCount > 0 &&
        visibleHideableColumnCount < hideableColumns.length;

    const toggleAllColumns = (checked: boolean) => {
        handleColumnVisibilityChange((current) => {
            const nextVisibility = { ...current };

            hideableColumns.forEach((column) => {
                nextVisibility[column.id] = checked;
            });

            return nextVisibility;
        });
    };

    const visibleActions = actions.filter((action) => !action.hidden);
    const resolvedPrimaryAction =
        primaryAction && !primaryAction.hidden ? primaryAction : undefined;

    const columnSettingsAction = enableColumnSettings ? (
        <Popover>
            <PopoverTrigger
                render={
                    <Button
                        type="button"
                        variant="outline"
                        title="Column settings"
                        aria-label="Column settings"
                    />
                }
            >
                <Columns3 className="size-4" />
                Columns
                <ChevronDown className="size-4" />
            </PopoverTrigger>

            <PopoverContent align="end" sideOffset={6} className="w-72 gap-4">
                <PopoverHeader className="flex-row items-center justify-between border-b pb-3">
                    <PopoverTitle>Columns</PopoverTitle>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={resetColumnVisibility}
                    >
                        Reset
                    </Button>
                </PopoverHeader>

                <div className="flex flex-col gap-3">
                    <label className="flex cursor-pointer items-center gap-3 rounded-md px-1 py-1.5 text-sm transition hover:bg-muted">
                        <Checkbox
                            checked={areAllHideableColumnsVisible}
                            indeterminate={areSomeHideableColumnsVisible}
                            onCheckedChange={(value) => toggleAllColumns(Boolean(value))}
                            disabled={!hideableColumns.length}
                            aria-label="Check all columns"
                        />
                        <span className="font-medium">Check all</span>
                    </label>

                    <div className="max-h-72 overflow-y-auto pr-1">
                        <div className="flex flex-col gap-1">
                            {hideableColumns.map((column) => (
                                <label
                                    key={column.id}
                                    className="flex cursor-pointer items-center gap-3 rounded-md px-1 py-1.5 text-sm transition hover:bg-muted"
                                >
                                    <Checkbox
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(Boolean(value))
                                        }
                                        aria-label={`Toggle ${getColumnLabel(column)} column`}
                                    />
                                    <span>{getColumnLabel(column)}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    ) : null;

    const handleCsvExport = () => {
        exportVisibleTableRowsToCsv(table, csvFileName);
    };

    const csvExportAction = enableCsvExport ? (
        <Button
            type="button"
            variant="outline"
            onClick={handleCsvExport}
            disabled={!table.getRowModel().rows.length}
        >
            <Download className="size-4" />
            Export
        </Button>
    ) : null;

    const generatedToolbarEnd =
        csvExportAction || visibleActions.length || columnSettingsAction || resolvedPrimaryAction ? (
            <>
                {csvExportAction}

                {visibleActions.map((action) => (
                    <Button
                        key={action.label}
                        type="button"
                        variant={action.variant ?? "outline"}
                        onClick={action.onClick}
                        disabled={action.disabled || !action.onClick}
                    >
                        {action.icon}
                        {action.label}
                    </Button>
                ))}

                {columnSettingsAction}

                {resolvedPrimaryAction ? (
                    resolvedPrimaryAction.items?.length ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                type="button"
                                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary px-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
                            >
                                {resolvedPrimaryAction.icon}
                                {resolvedPrimaryAction.label}
                                <ChevronDown className="size-4" />
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" sideOffset={6}>
                                <DropdownMenuGroup>
                                    {resolvedPrimaryAction.items
                                        .filter((item) => !item.hidden)
                                        .map((item) => (
                                            <DropdownMenuItem
                                                key={item.label}
                                                onClick={item.onClick}
                                                disabled={item.disabled || !item.onClick}
                                            >
                                                {item.icon}
                                                <span>{item.label}</span>
                                            </DropdownMenuItem>
                                        ))}
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button
                            type="button"
                            variant={resolvedPrimaryAction.variant ?? "default"}
                            onClick={resolvedPrimaryAction.onClick}
                            disabled={
                                resolvedPrimaryAction.disabled ||
                                !resolvedPrimaryAction.onClick
                            }
                        >
                            {resolvedPrimaryAction.icon}
                            {resolvedPrimaryAction.label}
                        </Button>
                    )
                ) : null}
            </>
        ) : null;

    const resolvedToolbarEnd = toolbarEnd ?? generatedToolbarEnd;

    const currentPageIndex = table.getState().pagination.pageIndex;

    const totalCount = serverSide
        ? (totalRows ?? 0)
        : table.getFilteredRowModel().rows.length;

    const currentPageSize = serverSide
        ? resolvedPageSize
        : table.getState().pagination.pageSize;

    const handlePageSizeChange = (newSize: number) => {
        if (serverSide) {
            onPageSizeChange?.(newSize);
        } else {
            table.setPageSize(newSize);
        }
    };

    const pageCount = table.getPageCount();
    const pageNumbers = Array.from({ length: pageCount }, (_, index) => index)
        .filter((index) => pageCount <= 5 || Math.abs(index - currentPageIndex) <= 1 || index === 0 || index === pageCount - 1);
    const visibleRowCount = table.getRowModel().rows.length;
    const firstVisibleRow = totalCount === 0 ? 0 : currentPageIndex * currentPageSize + 1;
    const lastVisibleRow = totalCount === 0 ? 0 : Math.min(totalCount, firstVisibleRow + visibleRowCount - 1);
    const searchChip = globalFilter.trim()
        ? {
            id: "search",
            label: `Search: ${globalFilter.trim()}`,
            onRemove: () => handleSearchChange(""),
        }
        : undefined;
    const resolvedActiveFilterChips = [
        ...(searchChip ? [searchChip] : []),
        ...activeFilterChips,
    ];
    const hasActiveConstraints = resolvedActiveFilterChips.length > 0;
    const handleClearAllFilters = () => {
        handleSearchChange("");
        onClearFilters?.();
    };
    const generatedActiveFilters = hasActiveConstraints ? (
        <div className="flex flex-col gap-3 rounded-lg border border-primary/15 bg-primary/5 px-4 py-3 text-sm sm:flex-row sm:items-center">
            <span className="font-medium text-foreground">Active filters:</span>

            <div className="flex flex-1 flex-wrap items-center gap-2">
                {resolvedActiveFilterChips.map((chip) => (
                    <span
                        key={chip.id}
                        className="inline-flex items-center gap-1.5 rounded-md border border-primary/15 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                    >
                        {chip.label}
                        <button
                            type="button"
                            className="rounded-sm transition hover:bg-primary/10"
                            onClick={chip.onRemove}
                            aria-label={`Remove ${chip.label}`}
                        >
                            <X className="size-3.5" />
                        </button>
                    </span>
                ))}
            </div>

            <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary"
                onClick={handleClearAllFilters}
            >
                Clear all
            </Button>
        </div>
    ) : null;
    const resolvedActiveFilters = activeFilters ?? generatedActiveFilters;
    const resolvedEmptyState = hasActiveConstraints
        ? (filteredEmptyState ?? emptyState)
        : emptyState;

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={globalFilter}
                            onChange={(event) =>
                                handleSearchChange(event.target.value)
                            }
                            placeholder={searchPlaceholder}
                            className="pl-9"
                        />
                    </div>
                    {toolbar}
                </div>

                {selectedRows.length && renderSelectedActions ? (
                    <div className="flex items-center justify-end gap-3">
                        <span className="text-sm text-muted-foreground">
                            {selectedRows.length} selected
                        </span>
                        {renderSelectedActions(selectedRows)}
                    </div>
                ) : resolvedToolbarEnd ? (
                    <div className="flex items-center justify-end gap-2">
                        {resolvedToolbarEnd}
                    </div>
                ) : null}
            </div>

            {resolvedActiveFilters}

            <div className="overflow-hidden rounded-lg border border-border bg-card">
                <Table containerClassName="max-h-[58vh] overflow-auto">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className={[
                                            "sticky top-0 z-20 bg-muted text-xs font-semibold tracking-normal text-muted-foreground shadow-[inset_0_-1px_0_var(--border)]",
                                            getColumnClassName(header.column.columnDef),
                                        ]
                                            .filter(Boolean)
                                            .join(" ")}
                                    >
                                        {renderHeader<TData>(header)}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row, index) => (
                                <TableRow
                                    key={row.id}
                                    className={[
                                        enableRowSelection || onRowDoubleClick ? "cursor-pointer" : "",
                                        highlightFirstRow && index === 0 ? "bg-primary/5 hover:bg-primary/10" : "",
                                    ].filter(Boolean).join(" ") || undefined}
                                    onClick={(event) => handleTableRowClick(event, row)}
                                    onDoubleClick={(event) => handleTableRowDoubleClick(event, row)}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className={getColumnClassName(
                                                cell.column.columnDef,
                                            )}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={table.getVisibleLeafColumns().length}
                                    className="h-80"
                                >
                                    <Empty className="border-0">
                                        <EmptyHeader>
                                            <EmptyMedia
                                                variant="icon"
                                                className="size-20 rounded-full bg-primary/10 text-primary ring-8 ring-primary/5"
                                            >
                                                {resolvedEmptyState?.icon ?? <SearchX className="size-9" />}
                                            </EmptyMedia>

                                            <EmptyTitle>
                                                {resolvedEmptyState?.title ?? emptyTitle}
                                            </EmptyTitle>

                                            <EmptyDescription>
                                                {resolvedEmptyState?.description ?? emptyDescription}
                                            </EmptyDescription>
                                        </EmptyHeader>

                                        {resolvedEmptyState?.actions ?? emptyAction ? (
                                            <EmptyContent>
                                                <div className="flex flex-wrap items-center justify-center gap-2">
                                                    {resolvedEmptyState?.actions ?? emptyAction}
                                                </div>
                                            </EmptyContent>
                                        ) : null}
                                    </Empty>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2">
                        <span>Rows per page</span>
                        <select
                            value={currentPageSize}
                            onChange={(event) =>
                                handlePageSizeChange(Number(event.target.value))
                            }
                            className="h-8 rounded-md border border-input bg-background px-2 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                            {pageSizeOptions.map((size) => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                    </div>

                    <p>
                        Showing {firstVisibleRow} to {lastVisibleRow} of{" "}
                        {totalCount} {entityLabel}
                    </p>
                </div>

                <div className="flex items-center justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronFirst className="size-4" />
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeft className="size-4" />
                    </Button>

                    {pageNumbers.map((pageNumber, index) => {
                        const previousPageNumber = pageNumbers[index - 1];
                        const hasGap = previousPageNumber !== undefined && pageNumber - previousPageNumber > 1;

                        return (
                            <div key={pageNumber} className="flex items-center gap-2">
                                {hasGap ? (
                                    <span className="px-1 text-muted-foreground">...</span>
                                ) : null}

                                <Button
                                    type="button"
                                    variant={pageNumber === currentPageIndex ? "default" : "outline"}
                                    size="icon-sm"
                                    onClick={() => table.setPageIndex(pageNumber)}
                                    aria-current={pageNumber === currentPageIndex ? "page" : undefined}
                                >
                                    {pageNumber + 1}
                                </Button>
                            </div>
                        );
                    })}

                    <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronRight className="size-4" />
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        onClick={() => table.setPageIndex(pageCount - 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronLast className="size-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
