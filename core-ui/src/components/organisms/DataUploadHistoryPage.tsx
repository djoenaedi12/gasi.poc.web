import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Eye, FileClock, MoreHorizontal, SearchX, Trash2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { formatDateTime } from "../../lib/date";
import { useI18n } from "../../lib/i18n";
import type { SearchRequest } from "../../types/api.types";
import type { DataUploadSummary, UploadStatus } from "../../types/dataUpload.types";
import { useDataUploadsPage, useDiscardDataUpload } from "../../hooks/useDataUpload";
import { formatUploadStatus, uploadStatusVariant } from "../../lib/dataUploadUtils";
import { appToast } from "../../lib/toast";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ServerDataTable } from "../datatable/DataTable";
import { PageHeader } from "../molecules/PageHeader";
import { ConfirmDialog } from "../molecules/ConfirmDialog";

type DataUploadHistoryPageProps = {
    resource: string;
    title?: string;
    description?: string;
    breadcrumbs?: Array<{ label: string; href?: string }>;
    onViewUpload: (uploadId: string) => void;
    onContinueUpload?: (uploadId: string) => void;
};


function canContinue(status?: UploadStatus) {
    return status === "UPLOADED" || status === "VALIDATED";
}

function canDiscard(status?: UploadStatus) {
    return status === "UPLOADED" || status === "VALIDATED" || status === "FAILED" || status === "REJECTED";
}

function toStartOfDayIso(value: string) {
    return `${value}T00:00:00.000Z`;
}

function toEndOfDayIso(value: string) {
    return `${value}T23:59:59.999Z`;
}

type DataUploadHistoryRowActionsProps = {
    upload: DataUploadSummary;
    onViewUpload: (uploadId: string) => void;
    onContinueUpload?: (uploadId: string) => void;
    onDiscard: (uploadId: string) => void | Promise<void>;
};

function DataUploadHistoryRowActions({
    upload,
    onViewUpload,
    onContinueUpload,
    onDiscard,
}: DataUploadHistoryRowActionsProps) {
    const { t } = useI18n();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const canEdit = Boolean(onContinueUpload) && canContinue(upload.uploadStatus);
    const canDelete = canDiscard(upload.uploadStatus);

    return (
        <>
            <div className="flex items-center justify-end gap-1.5">
                <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label={t("dataUpload.actions.viewDetail")}
                    title={t("dataUpload.actions.viewDetail")}
                    onClick={() => onViewUpload(upload.id)}
                >
                    <Eye className="size-4" />
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label={t("common.actions.edit")}
                    title={t("common.actions.edit")}
                    disabled={!canEdit}
                    onClick={() => {
                        if (canEdit) {
                            onContinueUpload?.(upload.id);
                        }
                    }}
                >
                    <Edit className="size-4" />
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger render={<Button type="button" variant="outline" size="icon-sm" aria-label={t("dataUpload.actions.more")} title={t("dataUpload.actions.more")} />}>
                        <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" sideOffset={6} className="w-40">
                        <DropdownMenuGroup>
                            <DropdownMenuItem
                                variant="destructive"
                                disabled={!canDelete}
                                title={!canDelete ? t("dataUpload.messages.deleteUnavailable") : undefined}
                                onClick={() => {
                                    if (canDelete) {
                                        setDeleteDialogOpen(true);
                                    }
                                }}
                            >
                                <Trash2 className="size-4" />
                                {t("dataUpload.actions.delete")}
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <ConfirmDialog
                destructive
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title={t("dataUpload.confirm.deleteTitle")}
                description={t("dataUpload.confirm.deleteDescription")}
                confirmLabel={t("dataUpload.actions.delete")}
                onConfirm={() => onDiscard(upload.id)}
            />
        </>
    );
}

export function DataUploadHistoryPage({
    resource,
    title,
    description,
    breadcrumbs,
    onViewUpload,
    onContinueUpload,
}: DataUploadHistoryPageProps) {
    const { t } = useI18n();
    const discardMutation = useDiscardDataUpload(resource);
    const handleDiscard = useCallback(async (id: string) => {
        try {
            await discardMutation.mutateAsync(id);
            appToast.success(t("dataUpload.messages.deleteSuccess"));
        } catch (error) {
            appToast.error(error, t("dataUpload.messages.deleteError"));
            throw error;
        }
    }, [discardMutation, t]);
    const pageQuery = useCallback(
        (request: SearchRequest) => useDataUploadsPage(resource, request),
        [resource],
    );
    const historyFilters = useMemo(() => [
        {
            id: "createdAtRange",
            label: t("dataUpload.fields.uploaded"),
            chipLabel: t("dataUpload.fields.uploaded"),
            type: "date-range" as const,
            placement: "toolbar" as const,
            placeholder: t("dataUpload.filters.uploadedRange"),
            value: "",
            range: {
                from: {
                    field: "createdAt",
                    operator: "GREATER_THAN_OR_EQUALS" as const,
                    transformValue: toStartOfDayIso,
                },
                to: {
                    field: "createdAt",
                    operator: "LESS_THAN_OR_EQUALS" as const,
                    transformValue: toEndOfDayIso,
                },
            },
        },
        {
            id: "uploadStatus",
            label: t("dataUpload.fields.uploadStatus"),
            chipLabel: t("dataUpload.fields.status"),
            field: "uploadStatus",
            operator: "IN" as const,
            type: "multi-select" as const,
            placement: "toolbar" as const,
            value: "",
            placeholder: t("dataUpload.filters.allStatuses"),
            transformValue: (value: string) => value.split(",").filter(Boolean),
            options: [
                { label: t("dataUpload.status.uploaded"), value: "UPLOADED" },
                { label: t("dataUpload.status.validated"), value: "VALIDATED" },
                { label: t("dataUpload.status.committed"), value: "COMMITTED" },
                { label: t("dataUpload.status.failed"), value: "FAILED" },
                { label: t("dataUpload.status.pendingApproval"), value: "PENDING_APPROVAL" },
                { label: t("dataUpload.status.rejected"), value: "REJECTED" },
            ],
        },
    ], [t]);

    const columns = useMemo<ColumnDef<DataUploadSummary>[]>(() => [
        {
            accessorKey: "instructionNo",
            header: t("dataUpload.fields.instructionNo"),
            cell: ({ row }) => row.original.instructionNo ?? "-",
        },
        {
            accessorKey: "createdAt",
            header: t("dataUpload.fields.uploaded"),
            cell: ({ row }) => row.original.createdAt ? formatDateTime(row.original.createdAt) : "-",
        },
        {
            accessorKey: "fileName",
            header: t("dataUpload.fields.file"),
            cell: ({ row }) => <span className="font-medium">{row.original.fileName}</span>,
        },
        {
            accessorKey: "totalRows",
            header: t("dataUpload.fields.total"),
            cell: ({ row }) => row.original.totalRows,
        },
        {
            accessorKey: "validRows",
            header: t("dataUpload.fields.valid"),
            cell: ({ row }) => {
                const val = row.original.validRows;
                return val > 0
                    ? <Badge variant="outline" className="border-success/30 bg-success/10 text-success">{val}</Badge>
                    : val;
            },
        },
        {
            accessorKey: "invalidRows",
            header: t("dataUpload.fields.invalid"),
            cell: ({ row }) => {
                const val = row.original.invalidRows;
                return val > 0
                    ? <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive">{val}</Badge>
                    : val;
            },
        },
        {
            id: "committedRows",
            accessorKey: "validRows",
            header: t("dataUpload.fields.committed"),
            cell: ({ row }) => {
                if (row.original.uploadStatus !== "COMMITTED") return "-";
                const val = row.original.validRows;
                return val > 0
                    ? <Badge variant="outline" className="border-success/30 bg-success/10 text-success">{val}</Badge>
                    : val;
            },
        },
        {
            accessorKey: "uploadStatus",
            header: t("dataUpload.fields.status"),
            cell: ({ row }) => (
                <Badge variant={uploadStatusVariant(row.original.uploadStatus)}>
                    {formatUploadStatus(row.original.uploadStatus, t)}
                </Badge>
            ),
        },
        {
            id: "actions",
            header: () => <span className="sr-only">{t("dataUpload.fields.actions")}</span>,
            enableSorting: false,
            enableHiding: false,
            cell: ({ row }) => (
                <DataUploadHistoryRowActions
                    upload={row.original}
                    onViewUpload={onViewUpload}
                    onContinueUpload={onContinueUpload}
                    onDiscard={handleDiscard}
                />
            ),
        },
    ], [onViewUpload, onContinueUpload, handleDiscard, t]);

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title={title ?? t("dataUpload.titles.history")}
                description={description ?? t("dataUpload.descriptions.history")}
                breadcrumbs={breadcrumbs}
                icon={<FileClock className="size-5" />}
            />

            <Card className="rounded-xl border-border/80 shadow-sm">
                <CardContent>
                    <ServerDataTable
                        columns={columns}
                        pageQuery={pageQuery}
                        searchFields={["fileName", "instructionNo"]}
                        searchPlaceholder={t("dataUpload.search.history")}
                        filters={historyFilters}
                        filterTitle={t("common.filters.title", { entity: t("dataUpload.titles.history") })}
                        loadingTitle={t("dataUpload.loading.history")}
                        emptyTitle={t("dataUpload.empty.historyTitle")}
                        defaultPageSize={10}
                        pageSizeOptions={[10, 20, 50]}
                        enableColumnSettings
                        enableCsvExport
                        csvFileName={`${resource}-upload-history.csv`}
                        columnPreferenceKey={`${resource}-upload-history-table`}
                        defaultVisibleColumns={["instructionNo", "createdAt", "fileName", "totalRows", "validRows", "invalidRows", "committedRows", "uploadStatus", "actions"]}
                        entityLabel={t("dataUpload.routes.upload")}
                        emptyState={{
                            icon: <FileClock className="size-9" />,
                            title: t("dataUpload.empty.historyTitle"),
                            description: t("dataUpload.empty.historyDescription"),
                        }}
                        filteredEmptyState={{
                            icon: <SearchX className="size-9" />,
                            title: t("dataUpload.empty.historyFilteredTitle"),
                            description: t("dataUpload.empty.historyFilteredDescription"),
                        }}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
