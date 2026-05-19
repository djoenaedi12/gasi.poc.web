import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";

type DataTableSortableColumn = {
    getIsSorted: () => false | "asc" | "desc";
    toggleSorting: () => void;
};

type DataTableSortableHeaderProps = {
    label: string;
    column: DataTableSortableColumn;
};

export function DataTableSortableHeader({
    label,
    column,
}: DataTableSortableHeaderProps) {
    const sorted = column.getIsSorted();
    const Icon =
        sorted === "asc"
            ? ChevronUp
            : sorted === "desc"
                ? ChevronDown
                : ChevronsUpDown;

    return (
        <button
            type="button"
            onClick={() => column.toggleSorting()}
            className="flex items-center gap-1 hover:text-foreground"
        >
            {label}
            <Icon className="size-3" />
        </button>
    );
}
