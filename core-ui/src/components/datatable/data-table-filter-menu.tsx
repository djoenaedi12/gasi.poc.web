import { Filter, X } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
    Popover,
    PopoverContent,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from "../ui/popover";

type DataTableFilterMenuProps = {
    children: ReactNode;
    activeCount?: number;
    label?: string;
    title?: string;
    onReset?: () => void;
};

export function DataTableFilterMenu({
    children,
    activeCount = 0,
    label = "More filters",
    title = "Filters",
    onReset,
}: DataTableFilterMenuProps) {
    return (
        <Popover>
            <PopoverTrigger
                render={
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        title={label}
                        aria-label={label}
                        className="relative"
                    />
                }
            >
                <Filter className="size-4" />
                {activeCount > 0 ? (
                    <Badge
                        variant="secondary"
                        className="absolute -right-2 -top-2 h-5 min-w-5 px-1 text-xs"
                    >
                        {activeCount}
                    </Badge>
                ) : null}
            </PopoverTrigger>

            <PopoverContent align="start" className="w-84 gap-5">
                <PopoverHeader className="flex-row items-center justify-between border-b pb-3">
                    <PopoverTitle>{title}</PopoverTitle>
                    {activeCount > 0 && onReset ? (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onReset}
                        >
                            <X className="size-4" />
                            Reset
                        </Button>
                    ) : null}
                </PopoverHeader>

                <div className="flex flex-col gap-5">{children}</div>
            </PopoverContent>
        </Popover>
    );
}
