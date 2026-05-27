import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
    Controller,
    type FieldPath,
    type FieldValues,
    type UseFormReturn,
} from "react-hook-form";
import type { ReactNode } from "react";

import { FormFieldLabel } from "./FormFieldLabel";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import {
    Field,
    FieldDescription,
} from "../ui/field";
import { FormFieldError } from "./FormFieldError";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../ui/popover";

type FormDatePickerProps<TFieldValues extends FieldValues> = {
    form: UseFormReturn<TFieldValues>;
    name: FieldPath<TFieldValues>;
    label: string;
    description?: ReactNode;
    tooltip?: ReactNode;
    labelAction?: ReactNode;
    placeholder?: string;
    /** date-fns format string, default "PPP" (e.g. "June 15, 2025") */
    displayFormat?: string;
    disabled?: boolean;
    required?: boolean;
    /** Disable specific dates, e.g. (date) => date > new Date() */
    disabledDates?: (date: Date) => boolean;
    className?: string;
};

export function FormDatePicker<TFieldValues extends FieldValues>({
    form,
    name,
    label,
    description,
    tooltip,
    labelAction,
    placeholder = "Pick a date",
    displayFormat = "PPP",
    disabled,
    required,
    disabledDates,
    className,
}: FormDatePickerProps<TFieldValues>) {
    const error = form.formState.errors[name];

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
                    const dateValue = field.value
                        ? new Date(field.value as string | Date)
                        : undefined;

                    return (
                        <Popover>
                            <PopoverTrigger
                                render={
                                    <Button
                                        id={name}
                                        type="button"
                                        variant="outline"
                                        disabled={disabled}
                                        data-empty={!dateValue}
                                        aria-invalid={Boolean(error)}
                                        className="h-[var(--control-height)] w-full min-w-0 justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
                                    />
                                }
                            >
                                <CalendarIcon className="size-4" />
                                {dateValue
                                    ? format(dateValue, displayFormat)
                                    : placeholder}
                            </PopoverTrigger>

                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={dateValue}
                                    onSelect={(date) => {
                                        field.onChange(
                                            date
                                                ? format(date, "yyyy-MM-dd")
                                                : undefined,
                                        );
                                    }}
                                    disabled={disabledDates}
                                    defaultMonth={dateValue}
                                    captionLayout="dropdown"
                                />

                                <div className="flex items-center justify-between border-t p-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            field.onChange(
                                                format(new Date(), "yyyy-MM-dd"),
                                            );
                                        }}
                                    >
                                        Today
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        disabled={!dateValue}
                                        onClick={() => {
                                            field.onChange(undefined);
                                        }}
                                    >
                                        Clear
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    );
                }}
            />

            {description && !error ? (
                <FieldDescription>{description}</FieldDescription>
            ) : null}

            {error ? <FormFieldError error={error} /> : null}
        </Field>
    );
}
