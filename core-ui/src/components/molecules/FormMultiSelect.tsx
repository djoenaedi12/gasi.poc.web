import { Check, ChevronDown, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import {
    Controller,
    type FieldPath,
    type FieldValues,
    type UseFormReturn,
} from "react-hook-form";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { FormFieldLabel } from "./FormFieldLabel";
import {
    Field,
    FieldDescription,
    FieldError,
} from "../ui/field";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../ui/popover";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "../../lib/utils";

type SelectOption = {
    label: string;
    value: string;
};

type FormMultiSelectProps<TFieldValues extends FieldValues> = {
    form: UseFormReturn<TFieldValues>;
    name: FieldPath<TFieldValues>;
    label: string;
    options: SelectOption[];
    placeholder?: string;
    description?: ReactNode;
    tooltip?: ReactNode;
    labelAction?: ReactNode;
    required?: boolean;
    disabled?: boolean;
    /** Maximum number of items that can be selected */
    maxSelected?: number;
    className?: string;
};

export function FormMultiSelect<TFieldValues extends FieldValues>({
    form,
    name,
    label,
    options,
    placeholder = "Select items",
    description,
    tooltip,
    labelAction,
    required,
    disabled,
    maxSelected,
    className,
}: FormMultiSelectProps<TFieldValues>) {
    const error = form.formState.errors[name];
    const [open, setOpen] = useState(false);

    return (
        <Field className={className}>
            <FormFieldLabel
                htmlFor={name}
                label={label}
                required={required}
                tooltip={tooltip}
                labelAction={labelAction}
            />

            <Controller
                control={form.control}
                name={name}
                render={({ field }) => {
                    const selectedValues = (field.value as string[]) ?? [];

                    const toggleValue = (value: string) => {
                        const newValues = selectedValues.includes(value)
                            ? selectedValues.filter((v) => v !== value)
                            : maxSelected && selectedValues.length >= maxSelected
                                ? selectedValues
                                : [...selectedValues, value];

                        field.onChange(newValues);
                    };

                    const clearAll = () => {
                        field.onChange([]);
                    };

                    const selectedLabels = options.filter((opt) =>
                        selectedValues.includes(opt.value),
                    );

                    return (
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger
                                render={
                                    <Button
                                        id={name}
                                        type="button"
                                        variant="outline"
                                        disabled={disabled}
                                        data-empty={selectedValues.length === 0}
                                        aria-invalid={Boolean(error)}
                                        className="h-auto min-h-9 w-full justify-between font-normal data-[empty=true]:text-muted-foreground"
                                    />
                                }
                            >
                                <div className="flex min-w-0 flex-1 flex-wrap gap-1">
                                    {selectedLabels.length === 0 ? (
                                        <span>{placeholder}</span>
                                    ) : (
                                        selectedLabels.map((opt) => (
                                            <Badge
                                                key={opt.value}
                                                variant="secondary"
                                                className="gap-1"
                                            >
                                                {opt.label}

                                                <span
                                                    role="button"
                                                    tabIndex={0}
                                                    className="cursor-pointer"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        toggleValue(opt.value);
                                                    }}
                                                    onKeyDown={(event) => {
                                                        if (
                                                            event.key === "Enter" ||
                                                            event.key === " "
                                                        ) {
                                                            event.preventDefault();
                                                            event.stopPropagation();
                                                            toggleValue(opt.value);
                                                        }
                                                    }}
                                                >
                                                    <X className="size-3" />
                                                </span>
                                            </Badge>
                                        ))
                                    )}
                                </div>

                                <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                            </PopoverTrigger>

                            <PopoverContent
                                className="w-[var(--popover-trigger-width)] p-0"
                                align="start"
                            >
                                <ScrollArea className="max-h-60">
                                    <div className="p-1">
                                        {options.map((option) => {
                                            const isSelected =
                                                selectedValues.includes(
                                                    option.value,
                                                );

                                            const isDisabled =
                                                !isSelected &&
                                                maxSelected !== undefined &&
                                                selectedValues.length >= maxSelected;

                                            return (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    disabled={isDisabled}
                                                    className={cn(
                                                        "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                                        isDisabled &&
                                                        "cursor-not-allowed opacity-50",
                                                    )}
                                                    onClick={() =>
                                                        toggleValue(option.value)
                                                    }
                                                >
                                                    <span
                                                        className={cn(
                                                            "flex size-4 shrink-0 items-center justify-center rounded-sm border",
                                                            isSelected
                                                                ? "border-primary bg-primary text-primary-foreground"
                                                                : "border-input",
                                                        )}
                                                    >
                                                        {isSelected ? (
                                                            <Check className="size-3" />
                                                        ) : null}
                                                    </span>

                                                    {option.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </ScrollArea>

                                {selectedValues.length > 0 ? (
                                    <div className="border-t p-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="w-full"
                                            onClick={clearAll}
                                        >
                                            Clear all
                                        </Button>
                                    </div>
                                ) : null}
                            </PopoverContent>
                        </Popover>
                    );
                }}
            />

            {description && !error ? (
                <FieldDescription>{description}</FieldDescription>
            ) : null}

            {error ? <FieldError>{error.message as string}</FieldError> : null}
        </Field>
    );
}
