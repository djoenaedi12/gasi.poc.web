import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { CalendarIcon, X } from "lucide-react";
import type { MouseEvent } from "react";

import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "../../lib/utils";

type DateRangePickerProps = {
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
};

function parseDate(value?: string) {
    if (!value) return undefined;

    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? undefined : date;
}

function formatDateValue(date?: Date) {
    return date ? format(date, "yyyy-MM-dd") : "";
}

function parseRange(value?: string): DateRange | undefined {
    const [from, to] = (value ?? "").split("..");
    const parsedFrom = parseDate(from);
    const parsedTo = parseDate(to);

    if (!parsedFrom && !parsedTo) return undefined;

    return {
        from: parsedFrom,
        to: parsedTo,
    };
}

function serializeRange(range?: DateRange) {
    const from = formatDateValue(range?.from);
    const to = formatDateValue(range?.to);

    return from || to ? `${from}..${to}` : "";
}

function formatRangeLabel(range?: DateRange, placeholder = "Pick date range") {
    if (range?.from && range?.to) {
        return `${format(range.from, "dd MMM yyyy")} - ${format(range.to, "dd MMM yyyy")}`;
    }

    if (range?.from) {
        return `${format(range.from, "dd MMM yyyy")} - ...`;
    }

    if (range?.to) {
        return `... - ${format(range.to, "dd MMM yyyy")}`;
    }

    return placeholder;
}

export function DateRangePicker({
    value,
    onChange,
    placeholder,
    className,
}: DateRangePickerProps) {
    const range = parseRange(value);
    const hasValue = Boolean(range?.from || range?.to);
    const handleClear = (event: MouseEvent<HTMLSpanElement>) => {
        event.preventDefault();
        event.stopPropagation();
        onChange("");
    };

    return (
        <div className={cn("flex min-w-0 items-center", className)}>
            <Popover>
                <PopoverTrigger
                    render={
                        <Button
                            type="button"
                            variant="outline"
                            className="h-[var(--control-height)] w-full min-w-0 justify-start truncate font-normal"
                        />
                    }
                >
                    <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
                    <span className={cn("min-w-0 flex-1 truncate text-left", !hasValue && "text-muted-foreground")}>
                        {formatRangeLabel(range, placeholder)}
                    </span>
                    {hasValue ? (
                        <span
                            role="button"
                            tabIndex={0}
                            aria-label="Clear date range"
                            className="ml-auto inline-flex size-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
                            onClick={handleClear}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                    handleClear(event as unknown as MouseEvent<HTMLSpanElement>);
                                }
                            }}
                        >
                            <X className="size-3.5" />
                        </span>
                    ) : null}
                </PopoverTrigger>

                <PopoverContent align="start" sideOffset={8} className="w-auto p-0">
                    <Calendar
                        mode="range"
                        selected={range}
                        onSelect={(nextRange) => onChange(serializeRange(nextRange))}
                        numberOfMonths={2}
                        captionLayout="dropdown"
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
