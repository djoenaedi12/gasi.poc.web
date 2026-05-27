import type { ColumnDef } from "@tanstack/react-table";
import { Eye, FileText, SearchX } from "lucide-react";
import { useCallback, useMemo } from "react";

import { formatDateTime } from "@gasi/core-ui";
import { useI18n } from "@gasi/core-ui";
import type { SearchRequest } from "@gasi/core-ui";
import type { DataUploadRowSummary } from "../types/dataUpload.types";
import {
    useDataUploadDetail,
    useDataUploadRowsPage,
} from "../hooks/useDataUpload";
import { formatUploadRowStatus, formatUploadStatus, uploadRowStatusVariant, uploadStatusVariant } from "../lib/dataUploadUtils";
import { Badge } from "@gasi/core-ui";
import { Button } from "@gasi/core-ui";
import { Card, CardContent } from "@gasi/core-ui";
import { ServerDataTable } from "@gasi/core-ui";
import { PageHeader } from "@gasi/core-ui";

type DataUploadRowsPageProps = {
    resource: string;
    uploadId: string;
    title?: string;
    description?: string;
    breadcrumbs?: Array<{ label: string; href?: string }>;
    onViewRow: (rowId: string) => void;
};

export function DataUploadRowsPage({
    resource,
    uploadId,
    title,
    description,
    breadcrumbs,
    onViewRow,
}: DataUploadRowsPageProps) {
    const { t } = useI18n();
    const uploadQuery = useDataUploadDetail(resource, uploadId);

    const pageQuery = useCallback(
        (request: SearchRequest) => useDataUploadRowsPage(resource, uploadId, request),
        [resource, uploadId],
    );
    const rowStatusFilters = useMemo(() => [
        {
            id: "rowStatus",
            label: t("dataUpload.fields.rowStatus"),
            chipLabel: t("dataUpload.fields.status"),
            field: "rowStatus",
            operator: "IN" as const,
            type: "multi-select" as const,
            placement: "toolbar" as const,
            value: "",
            placeholder: t("dataUpload.filters.allStatuses"),
            transformValue: (value: string) => value.split(",").filter(Boolean),
            options: [
                { label: t("dataUpload.status.valid"), value: "VALID" },
                { label: t("dataUpload.status.invalid"), value: "INVALID" },
                { label: t("dataUpload.status.raw"), value: "RAW" },
            ],
        },
    ], [t]);

    const columns = useMemo<ColumnDef<DataUploadRowSummary>[]>(() => [
        {
            accessorKey: "rowNumber",
            header: t("dataUpload.fields.rowNumber"),
            cell: ({ row }) => <span className="font-medium">{row.original.rowNumber}</span>,
        },
        {
            accessorKey: "rowStatus",
            header: t("dataUpload.fields.status"),
            cell: ({ row }) => (
                <Badge variant={uploadRowStatusVariant(row.original.rowStatus)}>
                    {formatUploadRowStatus(row.original.rowStatus, t)}
                </Badge>
            ),
        },
        {
            accessorKey: "identifier",
            header: t("dataUpload.fields.identifier"),
            cell: ({ row }) => row.original.identifier || "-",
        },
        {
            id: "actions",
            header: () => <span className="sr-only">{t("dataUpload.fields.actions")}</span>,
            enableSorting: false,
            enableHiding: false,
            cell: ({ row }) => (
                <div className="flex justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label={t("dataUpload.actions.viewDetail")}
                        title={t("dataUpload.actions.viewDetail")}
                        onClick={() => onViewRow(row.original.id)}
                    >
                        <Eye className="size-4" />
                    </Button>
                </div>
            ),
        },
    ], [onViewRow, t]);

    const upload = uploadQuery.data;
    const pageTitle = title ?? t("dataUpload.titles.rows");
    const resolvedTitle = upload ? `${pageTitle}: ${upload.fileName}` : pageTitle;
    const resolvedBreadcrumbs = useMemo(() => {
        if (!breadcrumbs || !upload?.instructionNo) {
            return breadcrumbs;
        }

        return breadcrumbs.map((item, index) =>
            index === breadcrumbs.length - 1
                ? { ...item, label: upload.instructionNo ?? item.label }
                : item,
        );
    }, [breadcrumbs, upload?.instructionNo]);

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title={resolvedTitle}
                description={description ?? t("dataUpload.descriptions.rows")}
                breadcrumbs={resolvedBreadcrumbs}
            />

            {upload && (
                <div className="space-y-3">
                    <div className="grid gap-4 rounded-lg border border-border bg-background/60 p-4 text-sm md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-success/15 text-success">
                                <FileText className="size-5" />
                            </div>
                            <div className="min-w-0">
                                <div className="truncate font-semibold text-foreground">{upload.fileName}</div>
                            </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {t("dataUpload.fields.instructionNo")}: <span className="font-medium text-foreground">{upload.instructionNo ?? "-"}</span>
                        </div>
                        {upload.createdAt && (
                            <div className="text-xs text-muted-foreground">
                                {t("dataUpload.fields.uploadedAt")}: <span className="font-medium text-foreground">{formatDateTime(upload.createdAt)}</span>
                            </div>
                        )}
                    </div>

                    <div className="rounded-lg border p-4">
                        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground">{t("dataUpload.fields.status")}</span>
                                <Badge variant={uploadStatusVariant(upload.uploadStatus)} className="w-fit">
                                    {formatUploadStatus(upload.uploadStatus, t)}
                                </Badge>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground">{t("dataUpload.fields.totalRows")}</span>
                                <span className="font-semibold">{upload.totalRows}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground">{t("dataUpload.fields.validRows")}</span>
                                <span className={["font-semibold", upload.validRows > 0 ? "text-success" : ""].join(" ")}>
                                    {upload.validRows}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground">{t("dataUpload.fields.invalidRows")}</span>
                                <span className={["font-semibold", upload.invalidRows > 0 ? "text-destructive" : ""].join(" ")}>
                                    {upload.invalidRows}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Card>
                <CardContent>
                    <ServerDataTable
                        columns={columns}
                        pageQuery={pageQuery}
                        searchFields={["lookupValue1", "lookupValue2", "lookupValue3"]}
                        searchPlaceholder={t("dataUpload.search.lookupValue")}
                        loadingTitle={t("dataUpload.loading.rows")}
                        emptyTitle={t("dataUpload.empty.rowsTitle")}
                        defaultPageSize={10}
                        pageSizeOptions={[10, 20, 50, 100]}
                        enableColumnSettings
                        enableCsvExport
                        csvFileName={`${resource}-upload-rows-${uploadId}.csv`}
                        columnPreferenceKey={`${resource}-upload-row-history-table`}
                        defaultVisibleColumns={["rowNumber", "rowStatus", "identifier", "searchString", "actions"]}
                        filters={rowStatusFilters}
                        filterTitle={t("common.filters.title", { entity: t("dataUpload.titles.rows") })}
                        entityLabel={t("dataUpload.titles.rows")}
                        emptyState={{
                            icon: <FileText className="size-9" />,
                            title: t("dataUpload.empty.noDataTitle"),
                            description: t("dataUpload.empty.noDataDescription"),
                        }}
                        filteredEmptyState={{
                            icon: <SearchX className="size-9" />,
                            title: t("dataUpload.empty.rowsFilteredTitle"),
                            description: t("dataUpload.empty.rowsFilteredDescription"),
                        }}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
