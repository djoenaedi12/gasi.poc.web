import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, Download, Eye, FileUp, History, MoreHorizontal, RefreshCw, Send, Upload } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { QueryKey } from "@tanstack/react-query";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
    Card,
    CardContent,
    CardFooter,
} from "../ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ServerDataTable } from "../datatable/DataTable";
import { PageHeader } from "../molecules/PageHeader";
import { Stepper } from "../molecules/Stepper";
import { UploadRowStatusFilter } from "../molecules/UploadRowStatusFilter";
import {
    dataUploadQueryKeys,
    useCommitDataUpload,
    useDataUpload,
    useDataUploadDetail,
    useDataUploadRowDetail,
    useDataUploadRowsPage,
    useDownloadDataUploadTemplate,
    useValidateDataUpload,
} from "../../hooks/useDataUpload";
import { useQueryClient } from "@tanstack/react-query";
import type { SearchRequest } from "../../types/api.types";
import type {
    DataUploadDetail,
    DataUploadRowSummary,
    UploadRowStatus,
} from "../../types/dataUpload.types";
import { buildRowStatusFilter, formatUploadRows, uploadRowStatusVariant, uploadStatusVariant } from "../../lib/dataUploadUtils";

type DataUploadPageProps = {
    resource: string;
    title?: string;
    description?: string;
    accept?: string;
    templateFileName?: string;
    templateUrl?: string;
    onBack: () => void;
    initialUploadId?: string;
    historyLabel?: string;
    onHistory?: () => void;
    onViewRow?: (uploadId: string, rowId: string) => void;
    invalidateQueryKey?: QueryKey;
    storageKey?: string;
};

const steps = [
    { id: "input", title: "Input", description: "Pilih sumber data", icon: FileUp },
    { id: "process", title: "Process", description: "Upload, validate, commit", icon: RefreshCw },
    { id: "result", title: "Result", description: "Status dan ringkasan", icon: CheckCircle2 },
];


export function DataUploadPage({
    resource,
    title = "Data Upload",
    description = "Upload file, validate data, commit data valid, lalu lihat ringkasan hasil proses.",
    accept = ".csv,.xlsx,.xls",
    templateFileName = `${resource}-template.csv`,
    templateUrl,
    onBack,
    initialUploadId,
    historyLabel = "Upload History",
    onHistory,
    onViewRow,
    invalidateQueryKey,
    storageKey = `${resource}:last-upload-id`,
}: DataUploadPageProps) {
    const queryClient = useQueryClient();
    const [uploadId, setUploadId] = useState<string | undefined>(initialUploadId);
    const [currentStep, setCurrentStep] = useState(initialUploadId ? 1 : 0);
    const [file, setFile] = useState<File | null>(null);
    const [rowStatusFilter, setRowStatusFilter] = useState<UploadRowStatus | "ALL">("ALL");
    const [selectedRowId, setSelectedRowId] = useState<string | undefined>();

    const uploadMutation = useDataUpload(resource);
    const validateMutation = useValidateDataUpload(resource);
    const commitMutation = useCommitDataUpload(resource);
    const downloadTemplateMutation = useDownloadDataUploadTemplate(resource);
    const detailQuery = useDataUploadDetail(resource, uploadId);
    const selectedRowQuery = useDataUploadRowDetail(resource, uploadId, selectedRowId);

    const upload = detailQuery.data ?? uploadMutation.data;
    const isBusy = uploadMutation.isPending || validateMutation.isPending || commitMutation.isPending;
    const isUploadProcessing = uploadMutation.isPending || upload?.uploadStatus === "UPLOADING";
    const isValidateProcessing = validateMutation.isPending || upload?.uploadStatus === "VALIDATING";
    const isCommitProcessing = commitMutation.isPending || upload?.uploadStatus === "COMMITTING";
    const error = uploadMutation.error ?? validateMutation.error ?? commitMutation.error;

    useEffect(() => {
        if (!initialUploadId) {
            return;
        }

        setUploadId(initialUploadId);
        setCurrentStep(1);
        setFile(null);
        setSelectedRowId(undefined);
    }, [initialUploadId]);

    const summary = useMemo(() => {
        const totalRows = upload?.totalRows ?? 0;
        const validRows = upload?.validRows ?? 0;
        const invalidRows = upload?.invalidRows ?? 0;
        const committedRows = upload?.uploadStatus === "COMMITTED" ? validRows : 0;

        return [
            { label: "Total rows", value: totalRows },
            { label: "Berhasil", value: committedRows },
            { label: "Valid", value: validRows },
            { label: "Invalid", value: invalidRows },
        ];
    }, [upload]);

    const rowsPageQuery = useCallback(
        (request: SearchRequest) => useDataUploadRowsPage(resource, upload?.id, request),
        [resource, upload?.id],
    );

    const rowStatusAdvancedFilter = useMemo(() => buildRowStatusFilter(rowStatusFilter), [rowStatusFilter]);

    const handleViewRow = useCallback((rowId: string) => {
        if (upload?.id && onViewRow) {
            onViewRow(upload.id, rowId);
            return;
        }

        setSelectedRowId(rowId);
    }, [onViewRow, upload?.id]);

    const rowColumns = useMemo<ColumnDef<DataUploadRowSummary>[]>(() => [
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
            header: "",
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
                                <DropdownMenuItem onClick={() => handleViewRow(row.original.id)}>
                                    <Eye className="size-4" />
                                    View detail
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
        },
    ], [handleViewRow]);

    useEffect(() => {
        if (
            currentStep > 0 &&
            (upload?.uploadStatus === "COMMITTED" ||
                upload?.uploadStatus === "PENDING_APPROVAL" ||
                upload?.uploadStatus === "REJECTED")
        ) {
            setCurrentStep(2);
        }
    }, [currentStep, upload?.uploadStatus]);

    async function refreshUpload(id: string) {
        await queryClient.invalidateQueries({ queryKey: dataUploadQueryKeys.all(resource) });
        await queryClient.refetchQueries({ queryKey: dataUploadQueryKeys.detail(resource, id) });
    }

    function handleFileChange(nextFile: File | null) {
        setFile(nextFile);
        setUploadId(undefined);
        setSelectedRowId(undefined);
        localStorage.removeItem(storageKey);
    }

    async function handleDownloadTemplate() {
        const template = await downloadTemplateMutation.mutateAsync({ templateUrl });
        const url = URL.createObjectURL(template);
        const link = document.createElement("a");

        link.href = url;
        link.download = templateFileName;
        link.click();
        URL.revokeObjectURL(url);
    }

    async function handleUpload() {
        if (!file) return;

        setCurrentStep(1);
        const result = await uploadMutation.mutateAsync({ file });
        setUploadId(result.id);
        localStorage.setItem(storageKey, result.id);
        await refreshUpload(result.id);
    }

    async function handleValidate() {
        if (!upload?.id) return;

        await validateMutation.mutateAsync({ id: upload.id });
        await refreshUpload(upload.id);
    }

    async function handleCommit() {
        if (!upload?.id) return;

        setCurrentStep(2);
        await commitMutation.mutateAsync({ id: upload.id });
        await refreshUpload(upload.id);

        if (invalidateQueryKey) {
            await queryClient.invalidateQueries({ queryKey: invalidateQueryKey });
        }
    }

    function handleFinish() {
        localStorage.removeItem(storageKey);
        onBack();
    }

    const canValidate = upload?.uploadStatus === "UPLOADED";
    const canCommit = upload?.uploadStatus === "VALIDATED" && upload.invalidRows === 0;

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title={title}
                description={description}
                actions={
                    onHistory ? (
                        <Button type="button" variant="outline" onClick={onHistory}>
                            <History className="size-4" />
                            {historyLabel}
                        </Button>
                    ) : null
                }
            />

            <Stepper steps={steps} currentStep={currentStep} />

            <Card>
                <CardContent className="space-y-5">
                    {currentStep === 0 ? (
                        <div className="space-y-4">
                            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                                <div className="max-w-xl flex-1 space-y-2">
                                    <Label htmlFor={`${resource}-upload-file`}>File</Label>
                                    <Input
                                        id={`${resource}-upload-file`}
                                        type="file"
                                        accept={accept}
                                        onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
                                        disabled={isBusy}
                                    />
                                </div>

                                <Button type="button" variant="outline" onClick={handleDownloadTemplate}>
                                    <Download className="size-4" />
                                    {downloadTemplateMutation.isPending ? "Downloading..." : "Download Template"}
                                </Button>
                            </div>

                            {file ? (
                                <div className="text-sm text-muted-foreground">
                                    Selected: <span className="font-medium text-foreground">{file.name}</span>
                                </div>
                            ) : null}

                        </div>
                    ) : null}

                    {currentStep > 0 && upload ? (
                        <div className="grid gap-4 rounded-md border p-4 md:grid-cols-4">
                            <div>
                                <div className="text-sm text-muted-foreground">File</div>
                                <div className="mt-1 font-medium">{upload.fileName}</div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Status</div>
                                <Badge className="mt-1" variant={uploadStatusVariant(upload.uploadStatus)}>
                                    {upload.uploadStatus}
                                </Badge>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Rows</div>
                                <div className="mt-1 font-medium">{formatUploadRows(upload)}</div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Upload ID</div>
                                <div className="mt-1 truncate font-medium">{upload.id}</div>
                            </div>
                        </div>
                    ) : null}

                    {currentStep === 1 && isUploadProcessing ? (
                        <div className="rounded-md bg-muted/40 p-4 text-sm text-muted-foreground">
                            Upload sedang diproses. Halaman ini bisa ditinggalkan, lalu dibuka lagi untuk melihat status upload terakhir.
                        </div>
                    ) : null}

                    {currentStep === 1 && upload && !isUploadProcessing ? (
                        <div className="rounded-md bg-muted/40 p-4 text-sm text-muted-foreground">
                            {isValidateProcessing
                                ? "Validasi sedang berjalan. Jumlah valid dan invalid akan diperbarui setelah selesai."
                                : upload.uploadStatus === "VALIDATED"
                                    ? upload.invalidRows > 0
                                        ? "Validasi selesai, tapi masih ada row invalid. Perbaiki data sebelum commit."
                                        : "Validasi selesai. Data sudah siap di-commit."
                                    : "Jalankan validate dulu sebelum commit."}
                        </div>
                    ) : null}

                    {currentStep === 1 && upload ? (
                        <div className="space-y-3">
                            <ServerDataTable
                                columns={rowColumns}
                                pageQuery={rowsPageQuery}
                                searchFields={["lookupValue1", "lookupValue2", "lookupValue3"]}
                                searchPlaceholder="Search data..."
                                loadingTitle="Loading upload rows..."
                                emptyTitle="No rows found"
                                defaultPageSize={10}
                                pageSizeOptions={[10, 20, 50, 100]}
                                enableColumnSettings
                                enableCsvExport
                                csvFileName={`${resource}-upload-rows-${upload.id}.csv`}
                                columnPreferenceKey={`${resource}-upload-row-page-table`}
                                defaultVisibleColumns={["rowNumber", "rowStatus", "identifier", "searchString", "actions"]}
                                advancedFilter={rowStatusAdvancedFilter}
                                moreFilter={
                                    <UploadRowStatusFilter
                                        value={rowStatusFilter}
                                        onChange={setRowStatusFilter}
                                    />
                                }
                            />
                        </div>
                    ) : null}

                    {currentStep === 2 ? (
                        <>
                            {isCommitProcessing ? (
                                <div className="rounded-md bg-muted/40 p-4 text-sm text-muted-foreground">
                                    Commit sedang berjalan. Ringkasan akan tampil setelah proses selesai.
                                </div>
                            ) : null}

                            {upload?.uploadStatus === "PENDING_APPROVAL" ? (
                                <div className="rounded-md bg-muted/40 p-4 text-sm text-muted-foreground">
                                    Commit menunggu approval. Proses approval berjalan di luar upload flow.
                                </div>
                            ) : null}

                            {upload?.uploadStatus === "REJECTED" ? (
                                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                                    Approval ditolak. Data belum masuk ke master.
                                </div>
                            ) : null}

                            <div className="grid gap-4 md:grid-cols-4">
                                {summary.map((item) => (
                                    <div key={item.label} className="rounded-md border p-4">
                                        <div className="text-sm text-muted-foreground">{item.label}</div>
                                        <div className="mt-2 text-2xl font-semibold">{item.value}</div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : null}

                    {error ? (
                        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            {(error as Error).message || "Upload process failed."}
                        </div>
                    ) : null}
                </CardContent>

                <CardFooter className="justify-end gap-3">
                    {currentStep === 0 ? (
                        <Button type="button" onClick={handleUpload} disabled={!file || isBusy}>
                            <Upload className="size-4" />
                            {uploadMutation.isPending ? "Uploading..." : "Upload"}
                        </Button>
                    ) : null}

                    {currentStep === 1 ? (
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleValidate}
                                disabled={!canValidate || isBusy}
                            >
                                <RefreshCw className="size-4" />
                                {validateMutation.isPending ? "Validating..." : "Validate"}
                            </Button>
                            <Button type="button" onClick={handleCommit} disabled={!canCommit || isBusy}>
                                <Send className="size-4" />
                                Commit
                            </Button>
                        </div>
                    ) : null}

                    {currentStep === 2 ? (
                        <Button type="button" onClick={handleFinish} disabled={isCommitProcessing}>
                            <CheckCircle2 className="size-4" />
                            Finish
                        </Button>
                    ) : null}
                </CardFooter>
            </Card>

            <Dialog open={Boolean(selectedRowId)} onOpenChange={(open) => !open && setSelectedRowId(undefined)}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Row Detail</DialogTitle>
                        <DialogDescription>
                            Detail data baris upload yang dipilih.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRowQuery.data ? (
                        <div className="space-y-4 text-sm">
                            <div className="grid gap-3 rounded-md border p-4 md:grid-cols-3">
                                <div>
                                    <div className="text-muted-foreground">Row No</div>
                                    <div className="font-medium">{selectedRowQuery.data.rowNumber}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Status</div>
                                    <Badge variant={uploadRowStatusVariant(selectedRowQuery.data.rowStatus)}>
                                        {selectedRowQuery.data.rowStatus}
                                    </Badge>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Identifier</div>
                                    <div className="font-medium">{selectedRowQuery.data.identifier || "-"}</div>
                                </div>
                            </div>

                            <div className="grid gap-3 rounded-md border p-4 md:grid-cols-3">
                                <div>
                                    <div className="text-muted-foreground">Lookup Value 1</div>
                                    <div className="font-medium">{selectedRowQuery.data.lookupValue1 || "-"}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Lookup Value 2</div>
                                    <div className="font-medium">{selectedRowQuery.data.lookupValue2 || "-"}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Lookup Value 3</div>
                                    <div className="font-medium">{selectedRowQuery.data.lookupValue3 || "-"}</div>
                                </div>
                            </div>

                            {selectedRowQuery.data.errorMessage ? (
                                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-destructive">
                                    {selectedRowQuery.data.errorMessage}
                                </div>
                            ) : null}

                            <div className="space-y-2">
                                <div className="font-medium">Raw Data</div>
                                <pre className="max-h-72 overflow-auto rounded-md bg-muted p-4 text-xs text-muted-foreground">
                                    {selectedRowQuery.data.rowData || "-"}
                                </pre>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-md bg-muted/40 p-4 text-sm text-muted-foreground">
                            Loading row detail...
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
