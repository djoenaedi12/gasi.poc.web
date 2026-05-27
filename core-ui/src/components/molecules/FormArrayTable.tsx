import type { ReactNode } from "react";
import {
    Controller,
    type FieldArray,
    type FieldArrayPath,
    type FieldValues,
    type Path,
    type UseFormReturn,
    useFieldArray,
} from "react-hook-form";
import type { UseQueryResult } from "@tanstack/react-query";
import { Plus, Search, Trash2 } from "lucide-react";

import type { GenericFilter, PageResult, SearchRequest } from "../../types/api.types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { LookupPicker, type LookupDisplayColumn, type LookupOption, type LookupPreset } from "./LookupPicker";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table";
import { Switch } from "../ui/switch";

type FormArrayTableOption = {
    label: string;
    value: string;
};

type FormArrayTableColumn<TFieldValues extends FieldValues> = {
    name: string;
    header: ReactNode;
    type?: "text" | "number" | "email" | "date" | "datetime-local" | "switch" | "select" | "lookup";
    options?: FormArrayTableOption[];
    lookup?: LookupPreset<any>;
    selectedOptions?: LookupOption[];
    displayColumns?: LookupDisplayColumn[];
    pageQuery?: (
        request: SearchRequest,
    ) => UseQueryResult<PageResult<unknown> | undefined, unknown>;
    mapOption?: (item: unknown) => LookupOption;
    serverSide?: boolean;
    searchFields?: string[];
    buildFilter?: (search: string) => GenericFilter | undefined;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    className?: string;
    inputClassName?: string;
    renderCell?: (context: {
        form: UseFormReturn<TFieldValues>;
        index: number;
        fieldName: Path<TFieldValues>;
    }) => ReactNode;
};

type FormArrayTableProps<
    TFieldValues extends FieldValues,
    TName extends FieldArrayPath<TFieldValues>,
> = {
    form: UseFormReturn<TFieldValues>;
    name: TName;
    columns: FormArrayTableColumn<TFieldValues>[];
    createRow: () => FieldArray<TFieldValues, TName>;
    title?: ReactNode;
    description?: ReactNode;
    addLabel?: ReactNode;
    emptyText?: ReactNode;
    disabled?: boolean;
    className?: string;
};

export function FormArrayTable<
    TFieldValues extends FieldValues,
    TName extends FieldArrayPath<TFieldValues>,
>({
    form,
    name,
    columns,
    createRow,
    title,
    description,
    addLabel = "Add row",
    emptyText = "No rows added.",
    disabled,
    className,
}: FormArrayTableProps<TFieldValues, TName>) {
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name,
    });

    return (
        <div className={className}>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                {title || description ? (
                    <div className="space-y-1">
                        {title ? (
                            <h2 className="text-base font-semibold">{title}</h2>
                        ) : null}
                        {description ? (
                            <p className="text-sm text-muted-foreground">
                                {description}
                            </p>
                        ) : null}
                    </div>
                ) : null}

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={disabled}
                    onClick={() => append(createRow())}
                >
                    <Plus className="size-4" />
                    {addLabel}
                </Button>
            </div>

            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((column) => (
                                <TableHead
                                    key={column.name}
                                    className={column.className}
                                >
                                    {column.header}
                                </TableHead>
                            ))}
                            <TableHead className="w-12" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fields.length ? (
                            fields.map((field, index) => (
                                <TableRow key={field.id}>
                                    {columns.map((column) => {
                                        const fieldName =
                                            `${name}.${index}.${column.name}` as Path<TFieldValues>;

                                        return (
                                            <TableCell key={column.name}>
                                                {column.renderCell ? (
                                                    column.renderCell({
                                                        form,
                                                        index,
                                                        fieldName,
                                                    })
                                                ) : (
                                                    <DefaultCellInput
                                                        form={form}
                                                        name={fieldName}
                                                        column={column}
                                                        disabled={disabled}
                                                    />
                                                )}
                                            </TableCell>
                                        );
                                    })}
                                    <TableCell className="text-right">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            disabled={disabled}
                                            onClick={() => remove(index)}
                                            aria-label={`Remove row ${index + 1}`}
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length + 1}
                                    className="h-24 text-center text-sm text-muted-foreground"
                                >
                                    {emptyText}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

function DefaultCellInput<TFieldValues extends FieldValues>({
    form,
    name,
    column,
    disabled,
}: {
    form: UseFormReturn<TFieldValues>;
    name: Path<TFieldValues>;
    column: FormArrayTableColumn<TFieldValues>;
    disabled?: boolean;
}) {
    if (column.type === "select") {
        return (
            <Controller
                control={form.control}
                name={name}
                render={({ field }) => (
                    <Select
                        value={(field.value as string) ?? ""}
                        onValueChange={field.onChange}
                        disabled={disabled}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={column.placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                            {(column.options ?? []).map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            />
        );
    }

    if (column.type === "lookup") {
        return (
            <Controller
                control={form.control}
                name={name}
                render={({ field }) => (
                    <LookupPicker
                        title={String(column.header)}
                        lookup={column.lookup}
                        options={column.options}
                        selectedOptions={column.selectedOptions}
                        displayColumns={column.displayColumns}
                        pageQuery={column.pageQuery}
                        mapOption={column.mapOption}
                        serverSide={column.serverSide}
                        searchFields={column.searchFields}
                        buildFilter={column.buildFilter}
                        value={(field.value as string) ?? undefined}
                        onChange={(value) => field.onChange(value)}
                        onClear={() => field.onChange(undefined)}
                        placeholder={column.placeholder}
                        searchPlaceholder={column.searchPlaceholder}
                        emptyMessage={column.emptyMessage}
                        disabled={disabled}
                        icon={<Search className="size-4 text-muted-foreground" />}
                    />
                )}
            />
        );
    }

    if (column.type === "switch") {
        return (
            <Controller
                control={form.control}
                name={name}
                render={({ field }) => (
                    <Switch
                        size="sm"
                        checked={Boolean(field.value)}
                        onCheckedChange={(checked) =>
                            field.onChange(Boolean(checked))
                        }
                        disabled={disabled}
                        aria-label={String(column.header)}
                    />
                )}
            />
        );
    }

    return (
        <Input
            type={column.type ?? "text"}
            placeholder={column.placeholder}
            className={column.inputClassName}
            disabled={disabled}
            {...form.register(name)}
        />
    );
}
