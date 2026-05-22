import type { ColumnDef } from "@tanstack/react-table";
import { Eye, MoreHorizontal } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import type { SearchRequest } from "../../types/api.types";
import type { DataUploadRowSummary, UploadRowStatus } from "../../types/dataUpload.types";
import {
    useDataUploadDetail,
    useDataUploadRowsPage,
} from "../../hooks/useDataUpload";
import { buildRowStatusFilter, uploadRowStatusVariant } from "../../lib/dataUploadUtils";
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
import { UploadRowStatusFilter } from "../molecules/UploadRowStatusFilter";

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
    title = "Upload Rows",
    description = "Lihat hasil pembacaan data per baris, filter status, export, atau buka detail row.",
    breadcrumbs,
    onViewRow,
}: DataUploadRowsPageProps) {
    const [rowStatusFilter, setRowStatusFilter] = useState<UploadRowStatus | "ALL">("ALL");
    const uploadQuery = useDataUploadDetail(resource, uploadId);

    const pageQuery = useCallback(
        (request: SearchRequest) => useDataUploadRowsPage(resource, uploadId, request),
        [resource, uploadId],
    );

    const rowStatusAdvancedFilter = useMemo(() => buildRowStatusFilter(rowStatusFilter), [rowStatusFilter]);

    const columns = useMemo<ColumnDef<DataUploadRowSummary>[]>(() => [
        {
            accessorKey: "rowNumber",
            header: "No",
            cell: ({ row }) => <span className="font-medium">{row.original.rowNumber}</span>,
        },
        {
            accessorKey: "rowStatus",
            header: "Status",
            cell: ({ row }) => (
                <Badge variant={uploadRowStatusVariant(row.original.rowStatus)}>
                    {row.original.rowStatus}
                </Badge>
            ),
        },
        {
            accessorKey: "identifier",
            header: "Identifier",
            cell: ({ row }) => row.original.identifier || "-",
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
                                <DropdownMenuItem onClick={() => onViewRow(row.original.id)}>
                                    <Eye className="size-4" />
                                    View detail
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
        },
    ], [onViewRow]);

    const upload = uploadQuery.data;
    const resolvedTitle = upload ? `${title}: ${upload.fileName}` : title;

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title={resolvedTitle}
                description={description}
                breadcrumbs={breadcrumbs}
            />

            <Card>
                <CardContent>
                    <ServerDataTable
                        columns={columns}
                        pageQuery={pageQuery}
                        searchFields={["lookupValue1", "lookupValue2", "lookupValue3"]}
                        searchPlaceholder="Search lookup value..."
                        loadingTitle="Loading upload rows..."
                        emptyTitle="No rows found"
                        defaultPageSize={10}
                        pageSizeOptions={[10, 20, 50, 100]}
                        enableColumnSettings
                        enableCsvExport
                        csvFileName={`${resource}-upload-rows-${uploadId}.csv`}
                        columnPreferenceKey={`${resource}-upload-row-history-table`}
                        defaultVisibleColumns={["rowNumber", "rowStatus", "identifier", "searchString", "actions"]}
                        advancedFilter={rowStatusAdvancedFilter}
                        moreFilter={
                            <UploadRowStatusFilter
                                value={rowStatusFilter}
                                onChange={setRowStatusFilter}
                            />
                        }
                    />
                </CardContent>
            </Card>

        </div>
    );
}
