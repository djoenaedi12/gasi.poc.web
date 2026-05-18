import { Clock } from "lucide-react";
import {
    Controller,
    type FieldPath,
    type FieldValues,
    type UseFormReturn,
} from "react-hook-form";
import type { ReactNode } from "react";

import { FormFieldLabel } from "@/components/molecules/form-field-label";
import { Button } from "@/components/ui/button";
import {
    Field,
    FieldDescription,
    FieldError,
} from "@/components/ui/field";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { generateTimeSlots, getCurrentTimeInRange } from "@/lib/time";

type FormTimePickerProps<TFieldValues extends FieldValues> = {
    form: UseFormReturn<TFieldValues>;
    name: FieldPath<TFieldValues>;
    label: string;
    description?: ReactNode;
    tooltip?: ReactNode;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    /** Time step in minutes, default 15 */
    minuteStep?: number;
    /** Minimum time, e.g. "08:00" */
    minTime?: string;
    /** Maximum time, e.g. "17:00" */
    maxTime?: string;
    className?: string;
};

export function FormTimePicker<TFieldValues extends FieldValues>({
    form,
    name,
    label,
    description,
    tooltip,
    placeholder = "Pick a time",
    disabled,
    required,
    minuteStep = 15,
    minTime,
    maxTime,
    className,
}: FormTimePickerProps<TFieldValues>) {
    const error = form.formState.errors[name];
    const timeSlots = generateTimeSlots(minuteStep, minTime, maxTime);

    return (
        <Field className={className}>
            <FormFieldLabel
                htmlFor={name}
                label={label}
                required={required}
                tooltip={tooltip}
            />

            <Controller
                control={form.control}
                name={name}
                render={({ field }) => {
                    const selectedTime = (field.value as string) ?? "";

                    return (
                        <Popover>
                            <PopoverTrigger
                                render={
                                    <Button
                                        id={name}
                                        type="button"
                                        variant="outline"
                                        disabled={disabled}
                                        data-empty={!selectedTime}
                                        aria-invalid={Boolean(error)}
                                        className="w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
                                    />
                                }
                            >
                                <Clock className="size-4" />
                                {selectedTime || placeholder}
                            </PopoverTrigger>

                            <PopoverContent
                                className="w-[var(--popover-trigger-width)] p-0"
                                align="start"
                            >
                                <ScrollArea className="h-60 p-1">
                                    <div className="grid gap-0.5">
                                        {timeSlots.map((slot) => (
                                            <Button
                                                key={slot}
                                                type="button"
                                                variant={
                                                    selectedTime === slot
                                                        ? "default"
                                                        : "ghost"
                                                }
                                                size="sm"
                                                className="w-full justify-start font-mono"
                                                onClick={() => {
                                                    field.onChange(slot);
                                                }}
                                            >
                                                {slot}
                                            </Button>
                                        ))}
                                    </div>
                                </ScrollArea>

                                <div className="flex items-center justify-between border-t p-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            field.onChange(
                                                getCurrentTimeInRange(
                                                    minuteStep,
                                                    minTime,
                                                    maxTime,
                                                ),
                                            );
                                        }}
                                    >
                                        Now
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        disabled={!selectedTime}
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

            {error ? <FieldError>{error.message as string}</FieldError> : null}
        </Field>
    );
}
