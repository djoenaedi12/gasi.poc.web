import type { ReactNode } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import type { FilterOperator } from "../../types/api.types";
import type { GenericFilter, PageResult, SearchRequest } from "../../types/api.types";
import type { LookupDisplayColumn, LookupOption, LookupPreset } from "../molecules/LookupPicker";

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
    type?: "text" | "select" | "multi-select" | "date" | "date-range" | "lookup" | "boolean" | "toggle";
    options?: { label: string; value: string }[];
    lookup?: LookupPreset<any>;
    lookupTitle?: string;
    selectedOptions?: LookupOption[];
    displayColumns?: LookupDisplayColumn[];
    pageQuery?: (
        request: SearchRequest,
    ) => UseQueryResult<PageResult<unknown> | undefined, unknown>;
    mapOption?: (item: unknown) => LookupOption;
    serverSide?: boolean;
    searchFields?: string[];
    buildFilter?: (search: string) => GenericFilter | undefined;
    searchPlaceholder?: string;
    emptyMessage?: string;
    chipLabel?: string;
    placement?: "inline" | "toolbar";
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
    renderControl?: (filter: DataTableFilterControl) => ReactNode;
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
