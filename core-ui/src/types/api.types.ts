export type ApiResponse<T> = {
    success: boolean;
    code?: number;
    message: string;
    data: T;
    errors?: string[];
    timestamp?: string;
};

export type FilterOperator =
    | "EQUALS"
    | "NOT_EQUALS"
    | "GREATER_THAN"
    | "GREATER_THAN_OR_EQUALS"
    | "LESS_THAN"
    | "LESS_THAN_OR_EQUALS"
    | "LIKE"
    | "IN"
    | "IS_NULL"
    | "IS_NOT_NULL";

export type SimpleFilter = {
    type: "simple";
    field: string;
    operator: FilterOperator;
    value?: unknown;
};

export type AndFilter = {
    type: "and";
    filters: GenericFilter[];
};

export type OrFilter = {
    type: "or";
    filters: GenericFilter[];
};

export type GenericFilter = SimpleFilter | AndFilter | OrFilter;

export type SortOrder = {
    field: string;
    direction: "ASC" | "DESC";
};

export type SearchRequest = {
    filter?: GenericFilter;
    sorts?: SortOrder[];
    fields?: string[];
    page?: number;
    size?: number;
};

export type PageResult<T> = {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
};
