import type { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import { X } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";

import { DataTable } from "@/components/datatable/data-table";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type LookupOption = {
    label: string;
    value: string;
    description?: string;
};

type LookupPickerBaseProps = {
    options: LookupOption[];
    title: string;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    /** Optional icon rendered at the start of the trigger button */
    icon?: ReactNode;
    disabled?: boolean;
    className?: string;
    "aria-invalid"?: boolean;
};

type SingleLookupPickerProps = LookupPickerBaseProps & {
    multiple?: false;
    value?: string;
    onChange: (value: string) => void;
    onClear?: () => void;
};

type MultipleLookupPickerProps = LookupPickerBaseProps & {
    multiple: true;
    value?: string[];
    onChange: (value: string[]) => void;
    onClear?: () => void;
};

type LookupPickerProps = SingleLookupPickerProps | MultipleLookupPickerProps;

export function LookupPicker(props: LookupPickerProps) {
    const {
        options,
        title,
        placeholder = "Select item",
        searchPlaceholder = "Search...",
        emptyMessage = "No data found.",
        icon,
        disabled,
        className,
    } = props;
    const [open, setOpen] = useState(false);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    const selectedValues = props.multiple
        ? props.value ?? []
        : props.value
            ? [props.value]
            : [];
    const selectedOptions = options.filter((option) =>
        selectedValues.includes(option.value),
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
        () => [
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
        ],
        [],
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
        setRowSelection({});
    };

    return (
        <>
            <div className={cn("flex items-center", className)}>
                <Button
                    type="button"
                    variant="outline"
                    disabled={disabled}
                    aria-invalid={props["aria-invalid"]}
                    className="w-full justify-start"
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
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>
                            Search and choose from the lookup table.
                        </DialogDescription>
                    </DialogHeader>

                    <DataTable
                        columns={columns}
                        data={options}
                        searchKey="label"
                        searchPlaceholder={searchPlaceholder}
                        emptyTitle={emptyMessage}
                        defaultPageSize={5}
                        pageSizeOptions={[5, 10, 20]}
                        enableRowSelection
                        rowSelectionMode={props.multiple ? "multiple" : "single"}
                        getRowId={(option) => option.value}
                        rowSelection={rowSelection}
                        onRowSelectionChange={handleRowSelectionChange}
                        renderSelectedActions={(selectedRows) => (
                            <Button
                                type="button"
                                size="sm"
                                onClick={() => {
                                    if (props.multiple) {
                                        props.onChange(
                                            selectedRows.map((row) => row.value),
                                        );
                                    } else if (selectedRows[0]) {
                                        props.onChange(selectedRows[0].value);
                                    }

                                    setOpen(false);
                                }}
                            >
                                Use selected
                            </Button>
                        )}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}
