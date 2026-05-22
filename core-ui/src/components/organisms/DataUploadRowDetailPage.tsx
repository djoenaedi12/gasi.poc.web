import { useMemo } from "react";

import { useDataUploadDetail, useDataUploadRowDetail } from "../../hooks/useDataUpload";
import { uploadRowStatusVariant } from "../../lib/dataUploadUtils";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { PageHeader } from "../molecules/PageHeader";

type DataUploadRowDetailPageProps = {
    resource: string;
    uploadId: string;
    rowId: string;
    title?: string;
    description?: string;
    breadcrumbs?: Array<{ label: string; href?: string }>;
};


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
    title = "Upload Row Detail",
    description = "Lihat metadata row, pesan error, dan data asli dari file upload.",
    breadcrumbs,
}: DataUploadRowDetailPageProps) {
    const uploadQuery = useDataUploadDetail(resource, uploadId);
    const rowQuery = useDataUploadRowDetail(resource, uploadId, rowId);
    const row = rowQuery.data;
    const parsedRowData = useMemo(() => parseRowData(row?.rowData), [row?.rowData]);

    const resolvedTitle = useMemo(() => {
        if (!row) {
            return title;
        }

        return `${title}: Row ${row.rowNumber}`;
    }, [row, title]);

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title={resolvedTitle}
                description={uploadQuery.data ? `${description} File: ${uploadQuery.data.fileName}` : description}
                breadcrumbs={breadcrumbs}
            />

            <Tabs defaultValue="general">
                <TabsList>
                    <TabsTrigger value="general">General</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="max-w-3xl">
                    <Card>
                        <CardContent>
                            {row ? (
                                <div className="space-y-5">
                                    <div className="grid gap-3 rounded-md border p-4 md:grid-cols-3">
                                        <div>
                                            <div className="text-sm text-muted-foreground">Row No</div>
                                            <div className="mt-1 text-sm font-medium">{row.rowNumber}</div>
                                        </div>

                                        <div>
                                            <div className="text-sm text-muted-foreground">Status</div>
                                            <Badge className="mt-1" variant={uploadRowStatusVariant(row.rowStatus)}>
                                                {row.rowStatus}
                                            </Badge>
                                        </div>

                                        <div>
                                            <div className="text-sm text-muted-foreground">Identifier</div>
                                            <div className="mt-1 text-sm font-medium">{row.identifier || "-"}</div>
                                        </div>
                                    </div>

                                    {row.errorMessage ? (
                                        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                                            {row.errorMessage}
                                        </div>
                                    ) : null}

                                    <dl className="grid gap-5">
                                        {parsedRowData ? (
                                            parsedRowData.map(([key, value]) => (
                                                <div key={key}>
                                                    <dt className="text-sm font-medium text-muted-foreground">{key}</dt>
                                                    <dd className="mt-1 text-sm">{formatValue(value)}</dd>
                                                </div>
                                            ))
                                        ) : (
                                            <div>
                                                <dt className="text-sm font-medium text-muted-foreground">Row Data</dt>
                                                <dd className="mt-1">
                                                    <pre className="max-h-[60vh] overflow-auto rounded-md bg-muted p-4 text-xs text-muted-foreground">
                                                        {row.rowData || "-"}
                                                    </pre>
                                                </dd>
                                            </div>
                                        )}
                                    </dl>
                                </div>
                            ) : (
                                <div className="rounded-md bg-muted/40 p-4 text-sm text-muted-foreground">
                                    Loading row detail...
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
