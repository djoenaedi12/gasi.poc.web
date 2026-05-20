import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type ColumnDef,
    type Header,
    type PaginationState,
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
    Download,
    Search,
    Settings2,
    SearchX,
} from "lucide-react";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    EmptyContent,
} from "../ui/empty";
import { type ReactNode, useEffect, useMemo, useState } from "react";
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
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
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
    buildSearchFilter,
    combineFilters,
    getColumnFieldIds,
    getColumnClassName,
    getColumnLabel,
    getSavedColumnVisibility,
    getInitialColumnVisibility,
    type ColumnVisibilityState,
    type DataTableColumn,
} from "./dataTableUtils";

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

type DataTableAction = {
    label: string;
    icon?: ReactNode;
    onClick?: () => void | Promise<void>;
    variant?: "default" | "outline" | "secondary" | "destructive" | "ghost";
    hidden?: boolean;
    disabled?: boolean;
    items?: DataTableAction[];
};

type DataTableProps<TData, TValue> = {
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
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    toolbar?: ReactNode;
    moreFilter?: ReactNode;
    toolbarEnd?: ReactNode;
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

type ServerDataTableProps<TData, TValue> = Omit<
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
    moreFilter?: ReactNode;
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
    moreFilter,
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
    const [columnVisibility, setColumnVisibility] =
        useState<ColumnVisibilityState>(() =>
            getInitialColumnVisibility(columns, defaultVisibleColumns, columnPreferenceKey),
        );

    const fields = useMemo(() => {
        const fieldIds = getColumnFieldIds(columns);
        return fieldIds.filter((field) => columnVisibility[field] !== false);
    }, [columnVisibility, columns]);

    const searchRequest = useMemo<SearchRequest>(() => {
        const searchFilter = buildFilter
            ? buildFilter(search)
            : buildSearchFilter(search, searchFields);
        const filter = combineFilters(searchFilter, advancedFilter);

        return { filter, sorts, fields, page, size: pageSize };
    }, [advancedFilter, buildFilter, fields, page, pageSize, search, searchFields, sorts]);

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

    return (
        <DataTable
            {...props}
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
            moreFilter={moreFilter}
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
    searchValue,
    onSearchChange,
    toolbar,
    moreFilter,
    toolbarEnd,
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
                        size="icon"
                        title="Column settings"
                        aria-label="Column settings"
                    />
                }
            >
                <Settings2 className="size-4" />
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
    const [inputPage, setInputPage] = useState(String(currentPageIndex + 1));

    useEffect(() => {
        setInputPage(String(currentPageIndex + 1));
    }, [currentPageIndex]);

    const handleGoToPage = (value: string) => {
        const val = Number(value);
        if (val >= 1 && val <= table.getPageCount()) {
            table.setPageIndex(val - 1);
        } else {
            setInputPage(String(table.getState().pagination.pageIndex + 1));
        }
    };

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

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative w-full sm:w-72">
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

                    {moreFilter}

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

            <div className="overflow-hidden rounded-md border">
                <Table containerClassName="max-h-[58vh] overflow-auto">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className={[
                                            "sticky top-0 z-10 bg-background",
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
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
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
                                    className="h-64"
                                >
                                    <Empty>
                                        <EmptyHeader>
                                            <EmptyMedia variant="icon">
                                                <SearchX className="size-6" />
                                            </EmptyMedia>

                                            <EmptyTitle>{emptyTitle}</EmptyTitle>

                                            <EmptyDescription>
                                                {emptyDescription}
                                            </EmptyDescription>
                                        </EmptyHeader>

                                        {emptyAction ? (
                                            <EmptyContent>
                                                <div className="flex flex-wrap items-center justify-center gap-2">
                                                    {emptyAction}
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
                        Showing {table.getRowModel().rows.length} of{" "}
                        {totalCount} row(s).
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

                    <div className="flex items-center gap-1.5 text-sm">
                        <span className="text-muted-foreground">Page</span>
                        <Input
                            type="number"
                            min={1}
                            max={table.getPageCount()}
                            value={inputPage}
                            onChange={(e) => setInputPage(e.target.value)}
                            onBlur={(e) => handleGoToPage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleGoToPage(inputPage);
                            }}
                            className="h-8 w-14 text-center"
                        />
                        <span className="text-muted-foreground">of {table.getPageCount()}</span>
                    </div>

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
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronLast className="size-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
