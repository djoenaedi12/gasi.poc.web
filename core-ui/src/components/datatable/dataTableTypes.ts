import type { ReactNode } from "react";
import type { FilterOperator } from "../../types/api.types";

export type DataTableAction = {
    label: string;
    icon?: ReactNode;
    onClick?: () => void | Promise<void>;
    variant?: "default" | "outline" | "secondary" | "destructive" | "ghost";
    hidden?: boolean;
    disabled?: boolean;
    items?: DataTableAction[];
};

export type DataTableFilterField = {
    id: string;
    label: string;
    field?: string;
    operator?: FilterOperator;
    value?: string;
    placeholder?: string;
    type?: "text" | "select" | "multi-select" | "date" | "date-range";
    options?: { label: string; value: string }[];
    chipLabel?: string;
    placement?: "popover" | "toolbar";
    range?: {
        from: {
            field: string;
            operator: FilterOperator;
            transformValue?: (value: string) => unknown;
        };
        to: {
            field: string;
            operator: FilterOperator;
            transformValue?: (value: string) => unknown;
        };
    };
    requestFilter?: boolean;
    transformValue?: (value: string) => unknown;
};

export type DataTableFilterChip = {
    id: string;
    label: string;
    onRemove?: () => void;
};

export type DataTableFilterControl = DataTableFilterField & {
    value: string;
    onChange: (value: string) => void;
};

export type DataTableEmptyState = {
    icon?: ReactNode;
    title?: string;
    description?: ReactNode;
    actions?: ReactNode;
};
