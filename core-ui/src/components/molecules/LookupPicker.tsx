import type { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import { Search, X } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import type { UseQueryResult } from "@tanstack/react-query";

import { DataTable, ServerDataTable } from "../datatable/DataTable";
import { Button } from "../ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { cn } from "../../lib/utils";
import type { GenericFilter, PageResult, SearchRequest } from "../../types/api.types";

export type LookupOption = {
    label: string;
    value: string;
    description?: string;
    meta?: Record<string, unknown>;
};

export type LookupDisplayColumn = {
    key: string;
    header: ReactNode;
};

export type LookupPreset<TLookupData = LookupOption> = {
    options?: LookupOption[];
    selectedOptions?: LookupOption[];
    displayColumns?: LookupDisplayColumn[];
    pageQuery?: (
        request: SearchRequest,
    ) => UseQueryResult<PageResult<TLookupData> | undefined, unknown>;
    mapOption?: (item: TLookupData) => LookupOption;
    serverSide?: boolean;
    searchFields?: string[];
    buildFilter?: (search: string) => GenericFilter | undefined;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
};

type LookupPickerBaseProps<TLookupData = LookupOption> = {
    title: string;
    lookup?: LookupPreset<TLookupData>;
    options?: LookupOption[];
    selectedOptions?: LookupOption[];
    displayColumns?: LookupDisplayColumn[];
    pageQuery?: (
        request: SearchRequest,
    ) => UseQueryResult<PageResult<TLookupData> | undefined, unknown>;
    mapOption?: (item: TLookupData) => LookupOption;
    serverSide?: boolean;
    searchFields?: string[];
    buildFilter?: (search: string) => GenericFilter | undefined;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    /** Optional icon rendered at the start of the trigger button */
    icon?: ReactNode;
    disabled?: boolean;
    className?: string;
    "aria-invalid"?: boolean;
};

type SingleLookupPickerProps<TLookupData = LookupOption> = LookupPickerBaseProps<TLookupData> & {
    multiple?: false;
    value?: string;
    onChange: (value: string) => void;
    onClear?: () => void;
};

type MultipleLookupPickerProps<TLookupData = LookupOption> = LookupPickerBaseProps<TLookupData> & {
    multiple: true;
    value?: string[];
    onChange: (value: string[]) => void;
    onClear?: () => void;
};

type LookupPickerProps<TLookupData = LookupOption> =
    | SingleLookupPickerProps<TLookupData>
    | MultipleLookupPickerProps<TLookupData>;

export function LookupPicker<TLookupData = LookupOption>(
    props: LookupPickerProps<TLookupData>,
) {
    const lookup = props.lookup ?? {};
    const {
        options = lookup.options ?? [],
        selectedOptions: controlledSelectedOptions = lookup.selectedOptions ?? [],
        displayColumns = lookup.displayColumns ?? [],
        pageQuery = lookup.pageQuery,
        mapOption = lookup.mapOption,
        serverSide = lookup.serverSide ?? true,
        searchFields = lookup.searchFields ?? ["label"],
        buildFilter = lookup.buildFilter,
        title,
        placeholder = lookup.placeholder ?? "Select item",
        searchPlaceholder = lookup.searchPlaceholder ?? "Search...",
        emptyMessage = lookup.emptyMessage ?? "No data found.",
        icon,
        disabled,
        className,
    } = props;
    const [open, setOpen] = useState(false);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [localSelectedOptions, setLocalSelectedOptions] = useState<LookupOption[]>([]);

    const selectedValues = props.multiple
        ? props.value ?? []
        : props.value
            ? [props.value]
            : [];

    const lookupOptions = useMemo(
        () => [...controlledSelectedOptions, ...localSelectedOptions, ...options],
        [controlledSelectedOptions, localSelectedOptions, options],
    );

    const selectedOptions = lookupOptions.filter((option, index) =>
        selectedValues.includes(option.value) &&
        lookupOptions.findIndex((item) => item.value === option.value) === index,
    );

    const getSelectedRowSelection = () =>
        Object.fromEntries(selectedValues.map((value) => [value, true]));

    const handleOpenChange = (nextOpen: boolean) => {
        if (nextOpen) {
            setRowSelection(getSelectedRowSelection());
        }

        setOpen(nextOpen);
    };

    const triggerLabel = props.multiple
        ? selectedOptions.length === 0
            ? placeholder
            : selectedOptions.length === 1
                ? selectedOptions[0].label
                : `${selectedOptions.length} selected`
        : selectedOptions[0]?.label ?? placeholder;

    const columns = useMemo<ColumnDef<LookupOption>[]>(
        () => {
            if (displayColumns.length) {
                return displayColumns.map((column) => ({
                    id: column.key,
                    accessorFn: (option) => String(option.meta?.[column.key] ?? ""),
                    header: () => <>{column.header}</>,
                    cell: ({ row }) => (
                        <span className="block max-w-64 truncate">
                            {String(row.original.meta?.[column.key] ?? "")}
                        </span>
                    ),
                }));
            }

            return [
                {
                    accessorKey: "label",
                    header: "Name",
                    cell: ({ row }) => (
                        <div className="min-w-0">
                            <p className="truncate font-medium">{row.original.label}</p>
                            {row.original.description ? (
                                <p className="mt-1 truncate text-sm text-muted-foreground">
                                    {row.original.description}
                                </p>
                            ) : null}
                        </div>
                    ),
                },
            ];
        },
        [displayColumns],
    );

    const handleRowSelectionChange = (selection: RowSelectionState) => {
        if (props.multiple) {
            setRowSelection(selection);
            return;
        }

        const selectedKeys = Object.keys(selection).filter(
            (key) => selection[key],
        );
        const latestSelectedKey =
            selectedKeys.find((key) => !rowSelection[key]) ??
            selectedKeys[selectedKeys.length - 1];

        setRowSelection(
            latestSelectedKey ? { [latestSelectedKey]: true } : {},
        );
    };

    const handleClear = () => {
        props.onClear?.();
        setLocalSelectedOptions([]);
        setRowSelection({});
    };

    const rememberSelectedOptions = (selectedRows: LookupOption[]) => {
        setLocalSelectedOptions((current) => {
            const next = [...selectedRows, ...current];
            return next.filter((option, index) =>
                next.findIndex((item) => item.value === option.value) === index,
            );
        });
    };

    const handleUseSelected = (selectedRows: LookupOption[]) => (
        <Button
            type="button"
            size="sm"
            onClick={() => {
                rememberSelectedOptions(selectedRows);

                if (props.multiple) {
                    props.onChange(selectedRows.map((row) => row.value));
                } else if (selectedRows[0]) {
                    props.onChange(selectedRows[0].value);
                }

                setOpen(false);
            }}
        >
            Use selected
        </Button>
    );

    const tableProps = {
        columns,
        searchPlaceholder,
        emptyTitle: emptyMessage,
        defaultPageSize: 10,
        pageSizeOptions: [10, 20, 50, 100],
        enableRowSelection: true,
        rowSelectionMode: props.multiple ? "multiple" as const : "single" as const,
        getRowId: (option: LookupOption) => option.value,
        rowSelection,
        onRowSelectionChange: handleRowSelectionChange,
        renderSelectedActions: handleUseSelected,
    };

    const lookupPageQuery = pageQuery
        ? (request: SearchRequest) => {
            const query = pageQuery(request);
            const toOption =
                mapOption ?? ((item: TLookupData) => item as LookupOption);

            return {
                ...query,
                data: query.data
                    ? {
                        ...query.data,
                        content: query.data.content.map(toOption),
                    }
                    : undefined,
            } as UseQueryResult<PageResult<LookupOption> | undefined, unknown>;
        }
        : undefined;
    const shouldUseServerSide = serverSide && lookupPageQuery;

    return (
        <>
            <div className={cn("flex items-center", className)}>
                <Button
                    type="button"
                    variant="outline"
                    disabled={disabled}
                    aria-invalid={props["aria-invalid"]}
                    className="h-10 w-full justify-start bg-background shadow-xs"
                    onClick={() => handleOpenChange(true)}
                >
                    {icon}
                    <span className="min-w-0 flex-1 truncate text-left">
                        {triggerLabel}
                    </span>
                    {selectedOptions.length > 0 && props.onClear ? (
                        <span
                            role="button"
                            tabIndex={0}
                            className="ml-auto shrink-0 rounded-sm p-0.5 hover:bg-accent"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClear();
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleClear();
                                }
                            }}
                        >
                            <X className="size-4" />
                            <span className="sr-only">Clear {title}</span>
                        </span>
                    ) : null}
                </Button>
            </div>

            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="gap-5 sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl">{title}</DialogTitle>
                        <DialogDescription className="text-sm">
                            Search and choose from the lookup table.
                        </DialogDescription>
                    </DialogHeader>

                    {shouldUseServerSide ? (
                        <ServerDataTable
                            {...tableProps}
                            pageQuery={lookupPageQuery}
                            searchFields={searchFields}
                            buildFilter={buildFilter}
                            loadingTitle={`Loading ${title}...`}
                            entityLabel="items"
                            emptyState={{
                                icon: <Search className="size-9" />,
                                title: emptyMessage,
                                description: "There are no lookup options available yet.",
                            }}
                            filteredEmptyState={{
                                icon: <Search className="size-9" />,
                                title: "No matching options found",
                                description: "Try another keyword or clear the active filters.",
                            }}
                        />
                    ) : (
                        <DataTable
                            {...tableProps}
                            data={options}
                            searchKey="label"
                            entityLabel="items"
                            emptyState={{
                                icon: <Search className="size-9" />,
                                title: emptyMessage,
                                description: "There are no lookup options available yet.",
                            }}
                            filteredEmptyState={{
                                icon: <Search className="size-9" />,
                                title: "No matching options found",
                                description: "Try another keyword or clear the active filters.",
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
