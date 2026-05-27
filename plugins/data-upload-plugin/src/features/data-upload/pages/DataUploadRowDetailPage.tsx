import { useMemo } from "react";
import { AlertTriangle, LayoutList } from "lucide-react";

import { useDataUploadDetail, useDataUploadRowDetail } from "../hooks/useDataUpload";
import { formatUploadRowStatus, uploadRowStatusVariant } from "../lib/dataUploadUtils";
import { useI18n } from "@gasi/core-ui";
import { Badge } from "@gasi/core-ui";
import { Card } from "@gasi/core-ui";
import { CardTabs, CardTabsContent, CardTabsList, CardTabsTrigger } from "@gasi/core-ui";
import { PageHeader } from "@gasi/core-ui";

type DataUploadRowDetailPageProps = {
    resource: string;
    uploadId: string;
    rowId: string;
    title?: string;
    description?: string;
    breadcrumbs?: Array<{ label: string; href?: string }>;
};


function parseErrorMessages(errorMessage?: string): string[] {
    if (!errorMessage) return [];
    try {
        const parsed = JSON.parse(errorMessage) as unknown;
        if (Array.isArray(parsed)) return parsed.filter((m): m is string => typeof m === "string");
    } catch {
        // fallback: treat as single message
        return [errorMessage];
    }
    return [];
}

function parseRowData(rowData?: string) {
    if (!rowData) {
        return null;
    }

    try {
        const parsed = JSON.parse(rowData) as unknown;

        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
            return null;
        }

        return Object.entries(parsed as Record<string, unknown>);
    } catch {
        return null;
    }
}

function formatValue(value: unknown) {
    if (value === null || value === undefined || value === "") {
        return "-";
    }

    if (typeof value === "object") {
        return JSON.stringify(value);
    }

    return String(value);
}

export function DataUploadRowDetailPage({
    resource,
    uploadId,
    rowId,
    title,
    description,
    breadcrumbs,
}: DataUploadRowDetailPageProps) {
    const { t } = useI18n();
    const uploadQuery = useDataUploadDetail(resource, uploadId);
    const rowQuery = useDataUploadRowDetail(resource, uploadId, rowId);
    const row = rowQuery.data;
    const upload = uploadQuery.data;
    const parsedRowData = useMemo(() => parseRowData(row?.rowData), [row?.rowData]);
    const parsedErrorMessages = useMemo(() => parseErrorMessages(row?.errorMessage), [row?.errorMessage]);
    const resolvedBreadcrumbs = useMemo(() => {
        if (!breadcrumbs || !upload?.instructionNo) {
            return breadcrumbs;
        }

        return breadcrumbs.map((item) =>
            item.label === uploadId
                ? { ...item, label: upload.instructionNo ?? item.label }
                : item,
        );
    }, [breadcrumbs, upload?.instructionNo, uploadId]);

    const resolvedTitle = useMemo(() => {
        if (!row) {
            return title ?? t("dataUpload.titles.rowDetail");
        }

        return `${title ?? t("dataUpload.titles.rowDetail")}: ${t("dataUpload.fields.rowNo")} ${row.rowNumber}`;
    }, [row, title, t]);

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title={resolvedTitle}
                description={upload
                    ? `${description ?? t("dataUpload.descriptions.rowDetail")} ${t("dataUpload.fields.file")}: ${upload.fileName}`
                    : description ?? t("dataUpload.descriptions.rowDetail")}
                breadcrumbs={resolvedBreadcrumbs}
            />

            <CardTabs defaultValue="general" className="w-full max-w-3xl">
                <CardTabsList>
                    <CardTabsTrigger value="general">{t("common.tabs.general")}</CardTabsTrigger>
                </CardTabsList>
                <Card>
                    <CardTabsContent value="general" className="px-6 pb-6">
                            {row ? (
                                <div className="space-y-5">
                                    <div className="grid gap-3 rounded-md border p-4 md:grid-cols-3">
                                        <div>
                                            <div className="text-sm text-muted-foreground">{t("dataUpload.fields.rowNo")}</div>
                                            <div className="mt-1 text-sm font-medium">{row.rowNumber}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-muted-foreground">{t("dataUpload.fields.status")}</div>
                                            <Badge className="mt-1" variant={uploadRowStatusVariant(row.rowStatus)}>
                                                {formatUploadRowStatus(row.rowStatus, t)}
                                            </Badge>
                                        </div>
                                        <div>
                                            <div className="text-sm text-muted-foreground">{t("dataUpload.fields.identifier")}</div>
                                            <div className="mt-1 text-sm font-medium">{row.identifier || "-"}</div>
                                        </div>
                                    </div>

                                    {parsedErrorMessages.length > 0 ? (
                                        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4">
                                            <div className="flex items-center gap-2 font-semibold text-destructive">
                                                <AlertTriangle className="size-4 shrink-0" />
                                                {t("dataUpload.fields.errorMessages")}
                                            </div>
                                            <ul className="mt-2 max-h-48 list-disc space-y-1 overflow-y-auto pl-6 text-sm text-destructive">
                                                {parsedErrorMessages.map((msg, i) => (
                                                    <li key={i}>{msg}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : null}

                                    <div>
                                        <div className="mb-3 flex items-center gap-2">
                                            <LayoutList className="size-5 text-primary" />
                                            <h3 className="font-semibold">{t("dataUpload.fields.rowData")}</h3>
                                        </div>
                                        <dl className="grid gap-5">
                                            {parsedRowData ? (
                                                parsedRowData.map(([key, value]) => (
                                                    <div key={key}>
                                                        <dt className="text-sm text-muted-foreground">{key}</dt>
                                                        <dd className="mt-1 text-sm font-medium">{formatValue(value)}</dd>
                                                    </div>
                                                ))
                                            ) : (
                                                <div>
                                                    <dt className="text-sm text-muted-foreground">{t("dataUpload.fields.raw")}</dt>
                                                    <dd className="mt-1">
                                                        <pre className="max-h-[60vh] overflow-auto rounded-md bg-muted p-4 text-xs text-muted-foreground">
                                                            {row.rowData || "-"}
                                                        </pre>
                                                    </dd>
                                                </div>
                                            )}
                                        </dl>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-md bg-muted/40 p-4 text-sm text-muted-foreground">
                                    {t("dataUpload.loading.rowDetail")}
                                </div>
                            )}
                    </CardTabsContent>
                    </Card>
            </CardTabs>
        </div>
    );
}
