import type { ColumnDef } from "@tanstack/react-table";
import { AlertCircle, Check, CheckCircle2, Clock3, Eye, FileText, FileUp, History, Info, RefreshCw, SearchX, Upload } from "lucide-react";
import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import type { QueryKey } from "@tanstack/react-query";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
    Card,
    CardContent,
    CardFooter,
} from "../ui/card";
import { ServerDataTable } from "../datatable/DataTable";
import { DataUploadInputPanel, type DataUploadSource } from "../molecules/DataUploadInputPanel";
import { PageHeader } from "../molecules/PageHeader";
import { Stepper } from "../molecules/Stepper";
import {
    dataUploadQueryKeys,
    useCommitDataUpload,
    useDataUpload,
    useDataUploadDetail,
    useDataUploadRowsPage,
    useDownloadDataUploadTemplate,
    useValidateDataUpload,
} from "../../hooks/useDataUpload";
import { useQueryClient } from "@tanstack/react-query";
import type { SearchRequest } from "../../types/api.types";
import type {
    DataUploadRowSummary,
    DataUploadSummary,
} from "../../types/dataUpload.types";
import { formatUploadRowStatus, formatUploadRows, formatUploadStatus, uploadStatusVariant } from "../../lib/dataUploadUtils";
import { useI18n, type Translate } from "../../lib/i18n";
import { appToast } from "../../lib/toast";

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

export function DataUploadPage({
    resource,
    title,
    description,
    accept = ".csv,.xlsx,.xls",
    templateFileName = `${resource}-template.csv`,
    templateUrl,
    initialUploadId,
    historyLabel,
    onHistory,
    onViewRow,
    invalidateQueryKey,
    storageKey = `${resource}:last-upload-id`,
}: DataUploadPageProps) {
    const { t } = useI18n();
    const queryClient = useQueryClient();
    const [uploadId, setUploadId] = useState<string | undefined>(initialUploadId);
    const [currentStep, setCurrentStep] = useState(initialUploadId ? 1 : 0);
    const [file, setFile] = useState<File | null>(null);
    const [source, setSource] = useState<DataUploadSource>("FILE");
    const [mapperId, setMapperId] = useState("");
    const [deleteExisting, setDeleteExisting] = useState(false);
    const [existingInstructionNo, setExistingInstructionNo] = useState("");
    const uploadMutation = useDataUpload(resource);
    const validateMutation = useValidateDataUpload(resource);
    const commitMutation = useCommitDataUpload(resource);
    const downloadTemplateMutation = useDownloadDataUploadTemplate(resource);
    const detailQuery = useDataUploadDetail(resource, uploadId);

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
    }, [initialUploadId]);


    const rowsPageQuery = useCallback(
        (request: SearchRequest) => useDataUploadRowsPage(resource, upload?.id, request),
        [resource, upload?.id],
    );

    const uploadRowFilters = useMemo(() => [
        {
            id: "rowStatus",
            label: t("dataUpload.fields.rowStatus"),
            chipLabel: t("dataUpload.fields.status"),
            field: "rowStatus",
            operator: "EQUALS" as const,
            type: "select" as const,
            value: "",
            options: [
                { label: t("dataUpload.filters.allStatuses"), value: "" },
                { label: t("dataUpload.status.valid"), value: "VALID" },
                { label: t("dataUpload.status.invalid"), value: "INVALID" },
                { label: t("dataUpload.status.raw"), value: "RAW" },
            ],
        },
    ], [t]);

    const handleViewRow = useCallback((rowId: string) => {
        if (upload?.id && onViewRow) {
            onViewRow(upload.id, rowId);
            return;
        }

    }, [onViewRow, upload?.id]);

    const rowColumns = useMemo<ColumnDef<DataUploadRowSummary>[]>(() => [
        {
            accessorKey: "rowNumber",
            header: t("dataUpload.fields.rowNumber"),
            cell: ({ row }) => <span className="font-medium">{row.original.rowNumber}</span>,
        },
        {
            accessorKey: "rowStatus",
            header: t("dataUpload.fields.status"),
            cell: ({ row }) => {
                const { label, className } = getRowStatusDisplay(row.original.rowStatus, t);
                return (
                    <Badge variant="outline" className={className || undefined}>
                        {label}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "identifier",
            header: t("dataUpload.fields.identifier"),
            cell: ({ row }) => row.original.identifier || "-",
        },
        {
            id: "actions",
            header: "",
            enableSorting: false,
            enableHiding: false,
            cell: ({ row }) => (
                <div className="flex justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        onClick={() => handleViewRow(row.original.id)}
                    >
                        <Eye className="size-4" />
                        <span className="sr-only">{t("dataUpload.actions.viewRowDetail")}</span>
                    </Button>
                </div>
            ),
        },
    ], [handleViewRow, t]);

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
        localStorage.removeItem(storageKey);
    }

    function handleSourceChange(nextSource: DataUploadSource) {
        setSource(nextSource);
        setMapperId("");

        if (nextSource === "THIRD_PARTY_API") {
            setFile(null);
        }
    }

    async function handleDownloadTemplate() {
        try {
            const template = await downloadTemplateMutation.mutateAsync({ templateUrl });
            const url = URL.createObjectURL(template);
            const link = document.createElement("a");

            link.href = url;
            link.download = templateFileName;
            link.click();
            URL.revokeObjectURL(url);
            appToast.success(t("dataUpload.messages.downloadTemplateSuccess"), {
                description: t("dataUpload.messages.downloadTemplateSuccessDescription"),
            });
        } catch (error) {
            appToast.error(error, t("dataUpload.messages.downloadTemplateError"));
        }
    }

    async function handleUpload() {
        if (source === "THIRD_PARTY_API") {
            appToast.info(t("dataUpload.messages.apiPreviewOnly"), {
                description: t("dataUpload.messages.apiPreviewOnlyDescription"),
            });
            return;
        }

        if (!file) return;

        try {
            setCurrentStep(1);
            const result = await uploadMutation.mutateAsync({ file });

            if (result?.id) {
                setUploadId(result.id);
                localStorage.setItem(storageKey, result.id);
                await refreshUpload(result.id);
            }

            appToast.success(t("dataUpload.messages.uploadSuccess"), {
                description: t("dataUpload.messages.uploadSuccessDescription"),
            });
        } catch (error) {
            appToast.error(error, t("dataUpload.messages.uploadError"));
        }
    }

    async function handleValidate() {
        if (!upload?.id) return;

        try {
            await validateMutation.mutateAsync({ id: upload.id });
            await refreshUpload(upload.id);
            appToast.success(t("dataUpload.messages.validateSuccess"), {
                description: t("dataUpload.messages.validateSuccessDescription"),
            });
        } catch (error) {
            appToast.error(error, t("dataUpload.messages.validateError"));
        }
    }

    async function handleCommit() {
        if (!upload?.id) return;

        try {
            setCurrentStep(2);
            await commitMutation.mutateAsync({ id: upload.id });
            await refreshUpload(upload.id);

            if (invalidateQueryKey) {
                await queryClient.invalidateQueries({ queryKey: invalidateQueryKey });
            }

            appToast.success(t("dataUpload.messages.commitSuccess"), {
                description: t("dataUpload.messages.commitSuccessDescription"),
            });
        } catch (error) {
            appToast.error(error, t("dataUpload.messages.commitError"));
        }
    }

    function handleUploadNewFile() {
        setCurrentStep(0);
        setUploadId(undefined);
        setFile(null);
        localStorage.removeItem(storageKey);
    }

    const canValidate = upload?.uploadStatus === "UPLOADED";
    const canCommit = upload?.uploadStatus === "VALIDATED" && upload.validRows > 0;
    const resultState = getUploadResultState(upload?.uploadStatus, t);
    const processingPanel = currentStep === 1
        ? getProcessingPanelConfig(upload, isUploadProcessing, isValidateProcessing, file, t)
        : null;
    const steps = useMemo(() => [
        { id: "input", title: t("dataUpload.steps.input.title"), description: t("dataUpload.input.title"), icon: FileUp },
        { id: "process", title: t("dataUpload.steps.process.title"), description: t("dataUpload.steps.process.description"), icon: RefreshCw },
        { id: "commit", title: t("dataUpload.steps.commit.title"), description: t("dataUpload.steps.commit.description"), icon: Upload },
    ], [t]);

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title={title ?? t("dataUpload.titles.main")}
                description={description ?? t("dataUpload.descriptions.main")}
                icon={<FileUp className="size-5" />}
                actions={
                    onHistory ? (
                        <Button type="button" variant="outline" onClick={onHistory}>
                            <History className="size-4" />
                            {historyLabel ?? t("dataUpload.titles.history")}
                        </Button>
                    ) : null
                }
            />

            <Stepper steps={steps} currentStep={currentStep} />

            {currentStep === 0 ? (
                <>
                    <DataUploadInputPanel
                        file={file}
                        source={source}
                        mapperId={mapperId}
                        deleteExisting={deleteExisting}
                        existingInstructionNo={existingInstructionNo}
                        accept={accept}
                        disabled={isBusy}
                        onFileChange={handleFileChange}
                        onSourceChange={handleSourceChange}
                        onMapperChange={setMapperId}
                        onDeleteExistingChange={setDeleteExisting}
                        onExistingInstructionNoChange={setExistingInstructionNo}
                        onDownloadTemplate={handleDownloadTemplate}
                        onUpload={handleUpload}
                        isDownloadingTemplate={downloadTemplateMutation.isPending}
                        isUploading={uploadMutation.isPending}
                    />

                    {error ? (
                        <DataUploadErrorNotice
                            title={t("dataUpload.error.processFailed")}
                            message={getErrorMessage(error, t("dataUpload.error.checkFileAndRetry"))}
                        />
                    ) : null}
                </>
            ) : null}

            {currentStep > 0 ? (
                <Card className="rounded-xl border-border/80 shadow-sm">
                    <CardContent className="space-y-5">
                        {processingPanel ? (
                            <DataUploadProcessingPanel {...processingPanel} />
                        ) : null}

                        {currentStep === 1 && upload && !processingPanel ? (
                            <div className="grid gap-4 rounded-lg border border-primary/15 bg-primary/5 p-4 md:grid-cols-4">
                                <div>
                                    <div className="text-sm text-muted-foreground">{t("dataUpload.fields.file")}</div>
                                    <div className="mt-1 font-medium">{upload.fileName}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">{t("dataUpload.fields.status")}</div>
                                    <Badge className="mt-1" variant={uploadStatusVariant(upload.uploadStatus)}>
                                        {formatUploadStatus(upload.uploadStatus, t)}
                                    </Badge>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">{t("dataUpload.titles.rows")}</div>
                                    <div className="mt-1 font-medium">{formatUploadRows(upload, t)}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">{t("dataUpload.fields.instructionNo")}</div>
                                    <div className="mt-1 truncate font-medium">{upload.instructionNo ?? "-"}</div>
                                </div>
                            </div>
                        ) : null}

                        {currentStep === 1 && upload && !processingPanel ? (
                            <div className="rounded-md bg-muted/40 p-4 text-sm text-muted-foreground">
                                {t("dataUpload.info.validateBeforeCommit")}
                            </div>
                        ) : null}

                        {currentStep === 1 && upload && !isUploadProcessing ? (
                            <div className="space-y-3">
                                <ServerDataTable
                                    columns={rowColumns}
                                    pageQuery={rowsPageQuery}
                                    searchFields={["lookupValue1", "lookupValue2", "lookupValue3"]}
                                    searchPlaceholder={t("dataUpload.search.lookupValue")}
                                    loadingTitle={t("dataUpload.loading.rows")}
                                    emptyTitle={t("dataUpload.empty.rowsTitle")}
                                    defaultPageSize={10}
                                    pageSizeOptions={[10, 20, 50, 100]}
                                    enableColumnSettings
                                    enableCsvExport
                                    csvFileName={`${resource}-upload-rows-${upload.id}.csv`}
                                    columnPreferenceKey={`${resource}-upload-row-page-table`}
                                    defaultVisibleColumns={["rowNumber", "rowStatus", "identifier", "searchString", "actions"]}
                                    filters={uploadRowFilters}
                                    filterTitle={t("common.filters.title", { entity: t("dataUpload.titles.rows") })}
                                    entityLabel={t("dataUpload.titles.rows")}
                                    emptyState={{
                                        icon: <FileUp className="size-9" />,
                                        title: t("dataUpload.empty.rowsTitle"),
                                        description: t("dataUpload.empty.noDataDescription"),
                                    }}
                                    filteredEmptyState={{
                                        icon: <SearchX className="size-9" />,
                                        title: t("dataUpload.empty.rowsFilteredTitle"),
                                        description: t("dataUpload.empty.rowsFilteredDescription"),
                                    }}
                                />
                            </div>
                        ) : null}

                        {currentStep === 2 ? (
                            isCommitProcessing && upload ? (
                                <DataUploadProcessingPanel
                                    icon={<Upload className="size-9" />}
                                    fileName={upload.fileName}
                                    instructionNo={upload.instructionNo}
                                    uploadedAt={upload.createdAt ? formatDate(upload.createdAt) : undefined}
                                    title={t("dataUpload.panel.commit.title")}
                                    description={t("dataUpload.panel.commit.description")}
                                    progress={70}
                                    stats={[
                                        { label: t("dataUpload.fields.totalRows"), value: upload.totalRows },
                                        { label: t("dataUpload.fields.validRows"), value: upload.validRows, valueClassName: "text-success" },
                                        { label: t("dataUpload.fields.invalidRows"), value: upload.invalidRows, valueClassName: upload.invalidRows > 0 ? "text-destructive" : undefined },
                                        { label: t("dataUpload.fields.status"), value: t("dataUpload.status.committing"), status: "info" },
                                    ]}
                                    info={t("dataUpload.info.commitBackground")}
                                />
                            ) : upload ? (
                                <DataUploadProcessingPanel
                                    tone={resultState.tone}
                                    icon={<resultState.icon className="size-9" />}
                                    fileName={upload.fileName}
                                    instructionNo={upload.instructionNo}
                                    uploadedAt={upload.createdAt ? formatDate(upload.createdAt) : undefined}
                                    title={resultState.title}
                                    description={resultState.description}
                                    progress={100}
                                    stats={[
                                        { label: t("dataUpload.fields.totalRows"), value: upload.totalRows },
                                        { label: t("dataUpload.fields.committedRows"), value: upload.validRows, valueClassName: "text-success" },
                                        { label: t("dataUpload.fields.invalidRows"), value: upload.invalidRows, valueClassName: upload.invalidRows > 0 ? "text-destructive" : undefined },
                                        { label: t("dataUpload.fields.status"), value: resultState.statusLabel, status: resultState.tone },
                                    ]}
                                    info={resultState.description}
                                />
                            ) : null
                        ) : null}

                        {error ? (
                            <DataUploadErrorNotice
                                title={t("dataUpload.error.processFailed")}
                                message={getErrorMessage(error, t("dataUpload.error.checkFileAndRetry"))}
                            />
                        ) : null}
                    </CardContent>

                    <CardFooter className="justify-end gap-3">
                        {currentStep === 1 ? (
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant={canValidate ? "default" : "outline"}
                                    onClick={handleValidate}
                                    disabled={!canValidate || isBusy}
                                >
                                    <RefreshCw className="size-4" />
                                    {validateMutation.isPending ? t("dataUpload.actions.validating") : t("dataUpload.actions.validateData")}
                                </Button>
                                <Button type="button" onClick={handleCommit} disabled={!canCommit || isBusy}>
                                    <Check className="size-4" />
                                    {t("dataUpload.actions.commitData")}
                                </Button>
                            </div>
                        ) : null}

                        {currentStep === 2 ? (
                            <Button type="button" onClick={handleUploadNewFile} disabled={isCommitProcessing}>
                                <Upload className="size-4" />
                                {t("dataUpload.actions.uploadNewFile")}
                            </Button>
                        ) : null}
                    </CardFooter>
                </Card>
            ) : null}

        </div>
    );
}

function getErrorMessage(error: unknown, fallback: string) {
    return error instanceof Error && error.message ? error.message : fallback;
}

function DataUploadErrorNotice({
    title,
    message,
}: {
    title: string;
    message: string;
}) {
    return (
        <div className="flex gap-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <div className="space-y-1">
                <div className="font-semibold">{title}</div>
                <div className="leading-relaxed">{message}</div>
            </div>
        </div>
    );
}

function getUploadResultState(status: string | undefined, t: Translate) {
    if (status === "COMMITTED") {
        return {
            tone: "success" as const,
            icon: CheckCircle2,
            title: t("dataUpload.panel.committed.title"),
            description: t("dataUpload.panel.committed.description"),
            statusLabel: t("dataUpload.status.committed"),
        };
    }

    if (status === "PENDING_APPROVAL") {
        return {
            tone: "warning" as const,
            icon: Clock3,
            title: t("dataUpload.panel.waitingApproval.title"),
            description: t("dataUpload.panel.waitingApproval.description"),
            statusLabel: t("dataUpload.status.pendingApproval"),
        };
    }

    if (status === "REJECTED") {
        return {
            tone: "destructive" as const,
            icon: AlertCircle,
            title: t("dataUpload.panel.rejected.title"),
            description: t("dataUpload.panel.rejected.description"),
            statusLabel: t("dataUpload.status.rejected"),
        };
    }

    if (status === "FAILED") {
        return {
            tone: "destructive" as const,
            icon: AlertCircle,
            title: t("dataUpload.panel.failed.title"),
            description: t("dataUpload.panel.failed.description"),
            statusLabel: t("dataUpload.status.failed"),
        };
    }

    return {
        tone: "info" as const,
        icon: Upload,
        title: t("dataUpload.panel.commit.title"),
        description: t("dataUpload.panel.commit.description"),
        statusLabel: status === "COMMITTING" ? t("dataUpload.status.committing") : t("dataUpload.status.processing"),
    };
}

type DataUploadProcessingPanelProps = {
    tone?: "info" | "success" | "warning" | "destructive";
    icon?: ReactNode;
    fileName: string;
    fileMeta?: string;
    instructionNo?: string;
    uploadedAt?: string;
    title: string;
    description?: string;
    progress: number;
    stats: Array<{
        label: string;
        value: string | number;
        status?: "info" | "success" | "warning" | "destructive";
        valueClassName?: string;
    }>;
    info: string;
    placeholder?: string;
};

function DataUploadProcessingPanel({
    tone = "info",
    icon,
    fileName,
    fileMeta,
    instructionNo,
    uploadedAt,
    title,
    description,
    progress,
    stats,
    info,
    placeholder,
}: DataUploadProcessingPanelProps) {
    const { t } = useI18n();
    const clampedProgress = Math.max(0, Math.min(100, progress));

    return (
        <div className="space-y-4">
            <div className="grid gap-4 rounded-lg border border-border bg-background/60 p-4 text-sm md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-success/15 text-success">
                        <FileText className="size-5" />
                    </div>
                    <div className="min-w-0">
                        <div className="truncate font-semibold text-foreground">{fileName}</div>
                        {fileMeta ? <div className="text-xs text-muted-foreground">{fileMeta}</div> : null}
                    </div>
                </div>

                <div className="text-xs text-muted-foreground">
                    {t("dataUpload.fields.instructionNo")}:{" "}
                    <span className="font-medium text-foreground">{instructionNo ?? "-"}</span>
                </div>

                <div className="text-xs text-muted-foreground">
                    {t("dataUpload.fields.uploadedAt")}:{" "}
                    <span className="font-medium text-foreground">{uploadedAt ?? "-"}</span>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.45fr)]">
                <div
                    className={[
                        "flex min-h-32 items-center gap-5 rounded-lg border p-6",
                        tone === "success"
                            ? "border-success/25 bg-success/10"
                            : tone === "warning"
                                ? "border-warning/30 bg-warning/10"
                                : tone === "destructive"
                                    ? "border-destructive/25 bg-destructive/10"
                                    : "border-primary/15 bg-primary/[0.03]",
                    ].join(" ")}
                >
                    <div
                        className={[
                            "flex size-16 shrink-0 items-center justify-center rounded-full border bg-card",
                            tone === "success"
                                ? "border-success/40 text-success"
                                : tone === "warning"
                                    ? "border-warning/50 text-warning"
                                    : tone === "destructive"
                                        ? "border-destructive/40 text-destructive"
                                        : "border-primary/25 text-primary",
                        ].join(" ")}
                    >
                        {icon ?? <Upload className="size-7" />}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="font-semibold text-foreground">{title}</div>
                        {description ? (
                            <div className="mt-1 text-sm text-muted-foreground">{description}</div>
                        ) : null}
                        <div className="mt-4 flex items-center gap-3">
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                                <div
                                    className={[
                                        "h-full rounded-full transition-all",
                                        tone === "success" ? "bg-success" : "bg-primary",
                                    ].join(" ")}
                                    style={{ width: `${clampedProgress}%` }}
                                />
                            </div>
                            <span
                                className={[
                                    "w-12 text-right text-sm font-semibold",
                                    tone === "success" ? "text-success" : "text-primary",
                                ].join(" ")}
                            >
                                {clampedProgress}%
                            </span>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border p-5">
                    <div className="space-y-4">
                        {stats.map((item) => (
                            <div key={item.label} className="flex items-center justify-between gap-4 text-sm">
                                <span className="text-muted-foreground">{item.label}</span>
                                <span className={["flex items-center gap-2 font-semibold", item.valueClassName ?? "text-foreground"].join(" ")}>
                                    {item.status ? (
                                        <span className={getStatusDotClassName(item.status)} />
                                    ) : null}
                                    {item.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-primary">
                <Info className="mt-0.5 size-4 shrink-0" />
                <span>{info}</span>
            </div>

            {placeholder ? (
                <div className="flex min-h-44 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-background/40 p-8 text-center text-sm text-muted-foreground">
                    <FileText className="mb-4 size-10 text-muted-foreground/50" />
                    {placeholder}
                </div>
            ) : null}
        </div>
    );
}

function getStatusDotClassName(status: "info" | "success" | "warning" | "destructive") {
    const colorClassName = {
        info: "bg-primary",
        success: "bg-success",
        warning: "bg-warning",
        destructive: "bg-destructive",
    }[status];

    return `size-2 rounded-full ${colorClassName}`;
}

function formatFileSize(size: number) {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(isoString: string) {
    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).format(new Date(isoString));
}

function getRowStatusDisplay(status: string, t: Translate): { label: string; className: string } {
    switch (status) {
        case "VALID":
            return { label: t("dataUpload.status.valid"), className: "border-success/30 bg-success/10 text-success" };
        case "INVALID":
            return { label: t("dataUpload.status.invalid"), className: "border-destructive/30 bg-destructive/10 text-destructive" };
        case "RAW":
            return { label: t("dataUpload.status.raw"), className: "" };
        default:
            return { label: formatUploadRowStatus(status as never, t), className: "border-border" };
    }
}


function getProcessingPanelConfig(
    upload: DataUploadSummary | undefined,
    isUploadProcessing: boolean,
    isValidateProcessing: boolean,
    file: File | null,
    t: Translate,
): DataUploadProcessingPanelProps | null {
    if (isUploadProcessing) {
        return {
            fileName: upload?.fileName ?? file?.name ?? t("dataUpload.input.emptyFile"),
            fileMeta: upload?.totalRows
                ? t("dataUpload.rows.count", { count: upload.totalRows })
                : file?.size
                    ? formatFileSize(file.size)
                    : t("dataUpload.panel.preparingUpload"),
            instructionNo: upload?.instructionNo,
            title: t("dataUpload.panel.uploading.title"),
            progress: 45,
            stats: [
                { label: t("dataUpload.fields.totalRows"), value: upload?.totalRows ?? "-" },
                { label: t("dataUpload.fields.uploadProgress"), value: "45%" },
                { label: t("dataUpload.fields.status"), value: t("dataUpload.status.waiting"), status: "info" },
            ],
            info: t("dataUpload.info.uploadBackground"),
            placeholder: t("dataUpload.panel.placeholder.validationAfterUpload"),
        };
    }

    if (upload?.uploadStatus === "UPLOADED") {
        return {
            tone: "success",
            icon: <CheckCircle2 className="size-9" />,
            fileName: upload.fileName,
            instructionNo: upload.instructionNo,
            title: t("dataUpload.panel.uploaded.title"),
            description: t("dataUpload.panel.uploaded.description"),
            progress: 100,
            stats: [
                { label: t("dataUpload.fields.totalRows"), value: upload.totalRows },
                { label: t("dataUpload.fields.uploadProgress"), value: "100%", valueClassName: "text-success" },
                { label: t("dataUpload.fields.status"), value: t("dataUpload.status.uploaded"), status: "info" },
            ],
            info: t("dataUpload.info.uploadComplete"),
        };
    }

    if (isValidateProcessing && upload) {
        return {
            icon: <RefreshCw className="size-9 animate-spin" />,
            fileName: upload.fileName,
            instructionNo: upload.instructionNo,
            title: t("dataUpload.panel.validating.title"),
            progress: 65,
            stats: [
                { label: t("dataUpload.fields.totalRows"), value: upload.totalRows },
                { label: t("dataUpload.fields.validRows"), value: upload.validRows, valueClassName: "text-success" },
                { label: t("dataUpload.fields.invalidRows"), value: upload.invalidRows, valueClassName: upload.invalidRows > 0 ? "text-destructive" : undefined },
                { label: t("dataUpload.fields.status"), value: t("dataUpload.status.validating"), status: "info" },
            ],
            info: t("dataUpload.info.validationBackground"),
        };
    }

    if (upload?.uploadStatus === "VALIDATED") {
        return {
            tone: "success",
            icon: <CheckCircle2 className="size-9" />,
            fileName: upload.fileName,
            instructionNo: upload.instructionNo,
            uploadedAt: upload.createdAt ? formatDate(upload.createdAt) : undefined,
            title: t("dataUpload.panel.validated.title"),
            description: upload.invalidRows > 0
                ? t("dataUpload.info.validationCompleteInvalid")
                : t("dataUpload.info.validationCompleteValid"),
            progress: 100,
            stats: [
                { label: t("dataUpload.fields.totalRows"), value: upload.totalRows },
                { label: t("dataUpload.fields.validRows"), value: upload.validRows, valueClassName: "text-success" },
                { label: t("dataUpload.fields.invalidRows"), value: upload.invalidRows, valueClassName: upload.invalidRows > 0 ? "text-destructive" : undefined },
                { label: t("dataUpload.fields.status"), value: t("dataUpload.status.validated"), status: "success" },
            ],
            info: upload.invalidRows > 0
                ? t("dataUpload.info.validationCompleteInvalid")
                : t("dataUpload.info.validationCompleteValid"),
        };
    }

    return null;
}
