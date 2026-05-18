import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type ColumnDef,
    type RowSelectionState,
    type SortingState,
    type Updater,
    useReactTable,
} from "@tanstack/react-table";
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
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
} from "@/components/ui/empty";
import { type ReactNode, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

type ColumnVisibilityState = Record<string, boolean>;

type DataTableColumnMeta = {
    label?: string;
    className?: string;
};

type DataTableColumn = {
    id: string;
    columnDef: {
        header?: unknown;
        meta?: DataTableColumnMeta;
    };
};

function getColumnLabel(column: DataTableColumn) {
    const metaLabel = column.columnDef.meta?.label;

    if (metaLabel) {
        return metaLabel;
    }

    if (typeof column.columnDef.header === "string") {
        return column.columnDef.header;
    }

    return column.id;
}

function getColumnClassName(columnDef: { meta?: unknown }) {
    return (columnDef.meta as DataTableColumnMeta | undefined)?.className;
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
    toolbarEnd?: ReactNode;

    actions?: DataTableAction[];
    primaryAction?: DataTableAction;

    enableColumnSettings?: boolean;
    columnPreferenceKey?: string;
};

export function DataTable<TData, TValue>({
    columns,
    data,
    searchKey,
    searchPlaceholder = "Search...",
    emptyTitle = "No data found",
    emptyDescription,
    emptyAction,
    defaultPageSize = 10,
    pageSizeOptions = [10, 20, 50],
    enableRowSelection = false,
    rowSelectionMode = "multiple",
    getRowId,
    renderSelectedActions,
    rowSelection: controlledRowSelection,
    onRowSelectionChange,
    searchValue,
    onSearchChange,
    toolbar,
    toolbarEnd,
    actions = [],
    primaryAction,
    enableColumnSettings = false,
    columnPreferenceKey,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [internalGlobalFilter, setInternalGlobalFilter] = useState("");
    const [internalRowSelection, setInternalRowSelection] =
        useState<RowSelectionState>({});

    const [columnVisibility, setColumnVisibility] =
        useState<ColumnVisibilityState>(() => {
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
        });

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

    const table = useReactTable({
        data,
        columns: tableColumns,
        state: {
            sorting,
            globalFilter,
            rowSelection,
            columnVisibility,
        },
        getRowId,
        enableRowSelection,
        enableMultiRowSelection: rowSelectionMode === "multiple",
        initialState: {
            pagination: {
                pageSize: defaultPageSize,
            },
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: (value) => {
            const nextValue =
                typeof value === "function" ? value(globalFilter) : value;
            handleSearchChange(String(nextValue));
        },
        onRowSelectionChange: handleRowSelectionChange,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        globalFilterFn: (row, _columnId, filterValue) => {
            const value = String(filterValue).toLowerCase();

            if (!searchKey) {
                return Object.values(row.original as Record<string, unknown>).some(
                    (item) => String(item).toLowerCase().includes(value),
                );
            }

            return String(row.getValue(searchKey))
                .toLowerCase()
                .includes(value);
        },
    });

    const selectedRows = table
        .getSelectedRowModel()
        .rows.map((row) => row.original);

    const resetColumnVisibility = () => {
        setColumnVisibility({});

        if (columnPreferenceKey) {
            localStorage.removeItem(`${columnPreferenceKey}:column-visibility`);
        }
    };

    const visibleActions = actions.filter((action) => !action.hidden);
    const resolvedPrimaryAction =
        primaryAction && !primaryAction.hidden ? primaryAction : undefined;

    const columnSettingsAction = enableColumnSettings ? (
        <DropdownMenu>
            <DropdownMenuTrigger
                type="button"
                className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-2.5 text-sm font-medium transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
                <Settings2 className="size-4" />
                <span className="sr-only">Column settings</span>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" sideOffset={6} className="w-56">
                <DropdownMenuGroup>
                    {table
                        .getAllLeafColumns()
                        .filter((column) => column.getCanHide())
                        .map((column) => (
                            <DropdownMenuCheckboxItem
                                key={column.id}
                                checked={column.getIsVisible()}
                                onCheckedChange={(value) =>
                                    column.toggleVisibility(!!value)
                                }
                            >
                                {getColumnLabel(column)}
                            </DropdownMenuCheckboxItem>
                        ))}
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={resetColumnVisibility}>
                    Reset column visibility
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    ) : null;

    const generatedToolbarEnd =
        visibleActions.length || columnSettingsAction || resolvedPrimaryAction ? (
            <>
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
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className={getColumnClassName(
                                            header.column.columnDef,
                                        )}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext(),
                                            )}
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
                            value={table.getState().pagination.pageSize}
                            onChange={(event) =>
                                table.setPageSize(Number(event.target.value))
                            }
                            className="h-8 rounded-md border border-input bg-background px-2 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                            {pageSizeOptions.map((pageSize) => (
                                <option key={pageSize} value={pageSize}>
                                    {pageSize}
                                </option>
                            ))}
                        </select>
                    </div>

                    <p>
                        Showing {table.getRowModel().rows.length} of{" "}
                        {table.getFilteredRowModel().rows.length} row(s).
                    </p>
                </div>

                <div className="flex items-center justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeft className="size-4" />
                        Previous
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                        <ChevronRight className="size-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
