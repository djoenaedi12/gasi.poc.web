import { format } from "date-fns";
import { ArrowLeft, CalendarIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import {
    Controller,
    type FieldPath,
    type FieldValues,
    type UseFormReturn,
} from "react-hook-form";

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
import { ScrollArea } from "../ui/scroll-area";
import { generateTimeSlots, getCurrentTimeInRange } from "../../lib/time";

type FormDateTimePickerProps<TFieldValues extends FieldValues> = {
    form: UseFormReturn<TFieldValues>;
    name: FieldPath<TFieldValues>;
    label: string;
    description?: ReactNode;
    tooltip?: ReactNode;
    labelAction?: ReactNode;
    placeholder?: string;
    /** date-fns format string for display, default "PPP HH:mm" */
    displayFormat?: string;
    disabled?: boolean;
    required?: boolean;
    /** Disable specific dates */
    disabledDates?: (date: Date) => boolean;
    /** Time step in minutes, default 15 */
    minuteStep?: number;
    /** Minimum time, e.g. "08:00" */
    minTime?: string;
    /** Maximum time, e.g. "17:00" */
    maxTime?: string;
    className?: string;
};

export function FormDateTimePicker<TFieldValues extends FieldValues>({
    form,
    name,
    label,
    description,
    tooltip,
    labelAction,
    placeholder = "Pick date and time",
    displayFormat = "PPP HH:mm",
    disabled,
    required,
    disabledDates,
    minuteStep = 15,
    minTime,
    maxTime,
    className,
}: FormDateTimePickerProps<TFieldValues>) {
    const error = form.formState.errors[name];
    const timeSlots = generateTimeSlots(minuteStep, minTime, maxTime);
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<"date" | "time">("date");
    const [draftDate, setDraftDate] = useState<Date | undefined>();
    const [draftTime, setDraftTime] = useState<string>("");

    const resetDraft = () => {
        setStep("date");
        setDraftDate(undefined);
        setDraftTime("");
    };

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

                    const selectedTime = dateValue ? format(dateValue, "HH:mm") : "";
                    const currentDraftDate = draftDate ?? dateValue;
                    const currentDraftTime = draftTime || selectedTime;
                    const draftSummary =
                        currentDraftDate && currentDraftTime
                            ? `${format(currentDraftDate, "dd MMM yyyy")}, ${currentDraftTime}`
                            : "Select date and time";

                    const handleOpenChange = (nextOpen: boolean) => {
                        setOpen(nextOpen);

                        if (nextOpen) {
                            setStep("date");
                            setDraftDate(dateValue);
                            setDraftTime(selectedTime);
                            return;
                        }

                        resetDraft();
                    };

                    const handleSelectDate = (date?: Date) => {
                        if (!date) {
                            return;
                        }

                        setDraftDate(date);
                        setDraftTime((currentTime) =>
                            currentTime ||
                            selectedTime ||
                            getCurrentTimeInRange(minuteStep, minTime, maxTime),
                        );
                        setStep("time");
                    };

                    const handleUseNow = () => {
                        setDraftDate(new Date());
                        setDraftTime(
                            getCurrentTimeInRange(minuteStep, minTime, maxTime),
                        );
                        setStep("time");
                    };

                    const handleClear = () => {
                        field.onChange(undefined);
                        setOpen(false);
                        resetDraft();
                    };

                    const handleApply = () => {
                        if (!currentDraftDate || !currentDraftTime) {
                            return;
                        }

                        const [hours, minutes] = currentDraftTime
                            .split(":")
                            .map(Number);
                        const result = new Date(currentDraftDate);

                        result.setHours(hours, minutes, 0, 0);
                        field.onChange(result.toISOString());
                        setOpen(false);
                        resetDraft();
                    };

                    return (
                        <Popover
                            open={open}
                            onOpenChange={handleOpenChange}
                        >
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

                            <PopoverContent
                                className="w-[var(--popover-trigger-width)] min-w-fit gap-0 p-0"
                                align="start"
                            >
                                <div className="border-b px-3 py-2">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-medium">
                                                {step === "date"
                                                    ? "Select date"
                                                    : "Select time"}
                                            </p>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                {draftSummary}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <span
                                                data-active={step === "date"}
                                                className="rounded-full px-2 py-0.5 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                                            >
                                                Date
                                            </span>
                                            <span>/</span>
                                            <span
                                                data-active={step === "time"}
                                                className="rounded-full px-2 py-0.5 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                                            >
                                                Time
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {step === "date" ? (
                                    <div>
                                        <Calendar
                                            mode="single"
                                            selected={currentDraftDate}
                                            onSelect={handleSelectDate}
                                            disabled={disabledDates}
                                            defaultMonth={dateValue}
                                            captionLayout="dropdown"
                                        />

                                        <div className="flex items-center justify-between border-t p-2">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleUseNow}
                                            >
                                                Now
                                            </Button>

                                            <div className="flex items-center gap-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    disabled={!dateValue && !draftDate}
                                                    onClick={handleClear}
                                                >
                                                    Clear
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    disabled={
                                                        !currentDraftDate ||
                                                        !currentDraftTime
                                                    }
                                                    onClick={handleApply}
                                                >
                                                    Apply
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2 border-b px-3 py-2">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => setStep("date")}
                                            >
                                                <ArrowLeft className="size-4" />
                                            </Button>

                                            <span className="text-sm font-medium">
                                                {currentDraftDate
                                                    ? format(currentDraftDate, "dd MMM yyyy")
                                                    : "Select time"}
                                            </span>
                                        </div>

                                        <ScrollArea className="h-60">
                                            <div className="grid gap-0.5 p-1">
                                                {timeSlots.map((slot) => (
                                                    <Button
                                                        key={slot}
                                                        type="button"
                                                        variant={
                                                            currentDraftTime === slot
                                                                ? "default"
                                                                : "ghost"
                                                        }
                                                        size="sm"
                                                        className="w-full justify-start font-mono"
                                                        onClick={() => setDraftTime(slot)}
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
                                                onClick={handleUseNow}
                                            >
                                                Now
                                            </Button>

                                            <div className="flex items-center gap-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    disabled={!dateValue && !draftDate}
                                                    onClick={handleClear}
                                                >
                                                    Clear
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    disabled={
                                                        !currentDraftDate ||
                                                        !currentDraftTime
                                                    }
                                                    onClick={handleApply}
                                                >
                                                    Apply
                                                </Button>
                                            </div>
                                        </div>
                                    </>
                                )}
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
