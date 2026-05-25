import type { ReactNode } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { Card, CardContent } from "../ui/card";
import { PageHeader } from "../molecules/PageHeader";
import { ServerDataTable, type ServerDataTableProps } from "../datatable/DataTable";

type BreadcrumbItem = {
    label: string;
    href?: string;
};

export type ResourceListPageProps<TData, TValue> = {
    title: string;
    description?: string;
    breadcrumbs?: BreadcrumbItem[];
    breadcrumbLabels?: Record<string, string>;
    icon?: ReactNode;
    actions?: ReactNode;
    className?: string;
    tableClassName?: string;
    columns: ColumnDef<TData, TValue>[];
    table: Omit<ServerDataTableProps<TData, TValue>, "columns">;
};

export function ResourceListPage<TData, TValue>({
    title,
    description,
    breadcrumbs,
    breadcrumbLabels,
    icon,
    actions,
    className = "flex flex-col gap-6",
    tableClassName = "rounded-xl border-border/80 shadow-sm",
    columns,
    table,
}: ResourceListPageProps<TData, TValue>) {
    return (
        <div className={className}>
            <PageHeader
                title={title}
                description={description}
                breadcrumbs={breadcrumbs}
                breadcrumbLabels={breadcrumbLabels}
                icon={icon}
                actions={actions}
            />

            <Card className={tableClassName}>
                <CardContent className="space-y-4">
                    <ServerDataTable columns={columns} {...table} />
                </CardContent>
            </Card>
        </div>
    );
}
