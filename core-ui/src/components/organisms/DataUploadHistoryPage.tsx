import type { ColumnDef } from "@tanstack/react-table";
import { ArrowRight, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { useCallback, useMemo } from "react";

import { formatDateTime } from "../../lib/date";
import type { SearchRequest } from "../../types/api.types";
import type { DataUploadSummary, UploadStatus } from "../../types/dataUpload.types";
import { useDataUploadsPage, useDiscardDataUpload } from "../../hooks/useDataUpload";
import { formatUploadRows, uploadStatusVariant } from "../../lib/dataUploadUtils";
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

export function DataUploadHistoryPage({
    resource,
    title = "Upload History",
    description = "Lihat riwayat upload, lanjutkan proses yang belum selesai, atau buka detail baris data.",
    breadcrumbs,
    onViewUpload,
    onContinueUpload,
}: DataUploadHistoryPageProps) {
    const discardMutation = useDiscardDataUpload(resource);
    const pageQuery = useCallback(
        (request: SearchRequest) => useDataUploadsPage(resource, request),
        [resource],
    );

    const columns = useMemo<ColumnDef<DataUploadSummary>[]>(() => [
        {
            accessorKey: "id",
            header: "Upload ID",
        },
        {
            accessorKey: "createdAt",
            header: "Uploaded",
            cell: ({ row }) => row.original.createdAt ? formatDateTime(row.original.createdAt) : "-",
        },
        {
            accessorKey: "fileName",
            header: "File",
            cell: ({ row }) => <span className="font-medium">{row.original.fileName}</span>,
        },
        {
            accessorKey: "uploadStatus",
            header: "Status",
            cell: ({ row }) => (
                <Badge variant={uploadStatusVariant(row.original.uploadStatus)}>
                    {row.original.uploadStatus}
                </Badge>
            ),
        },
        {
            id: "rows",
            header: "Rows",
            cell: ({ row }) => formatUploadRows(row.original),
            enableSorting: false,
        },
        {
            id: "actions",
            header: () => <span className="sr-only">Actions</span>,
            enableSorting: false,
            enableHiding: false,
            cell: ({ row }) => (
                <div className="flex justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger render={<Button type="button" variant="ghost" size="icon-sm" />}>
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">Open row actions</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" sideOffset={6} className="w-40">
                            <DropdownMenuGroup>
                                {onContinueUpload && canContinue(row.original.uploadStatus) ? (
                                    <DropdownMenuItem onClick={() => onContinueUpload(row.original.id)}>
                                        <ArrowRight className="size-4" />
                                        Continue process
                                    </DropdownMenuItem>
                                ) : null}
                                <DropdownMenuItem onClick={() => onViewUpload(row.original.id)}>
                                    <Eye className="size-4" />
                                    View detail
                                </DropdownMenuItem>
                                {canDiscard(row.original.uploadStatus) ? (
                                    <ConfirmDialog
                                        destructive
                                        title="Discard upload?"
                                        description="Upload header and all staged rows will be permanently deleted."
                                        confirmLabel="Discard"
                                        trigger={
                                            <DropdownMenuItem variant="destructive">
                                                <Trash2 className="size-4" />
                                                Discard
                                            </DropdownMenuItem>
                                        }
                                        onConfirm={() => discardMutation.mutateAsync(row.original.id)}
                                    />
                                ) : null}
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
        },
    ], [onViewUpload, onContinueUpload, discardMutation.mutateAsync]);

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title={title}
                description={description}
                breadcrumbs={breadcrumbs}
            />

            <Card>
                <CardContent>
                    <ServerDataTable
                        columns={columns}
                        pageQuery={pageQuery}
                        searchFields={["fileName", "uploadStatus"]}
                        searchPlaceholder="Search upload history..."
                        loadingTitle="Loading upload history..."
                        emptyTitle="No upload history"
                        defaultPageSize={10}
                        pageSizeOptions={[10, 20, 50]}
                        enableColumnSettings
                        enableCsvExport
                        csvFileName={`${resource}-upload-history.csv`}
                        columnPreferenceKey={`${resource}-upload-history-table`}
                        defaultVisibleColumns={["fileName", "uploadStatus", "rows", "createdAt", "actions"]}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
