import { translate, type GenericFilter, type Translate } from "@gasi/core-ui";
import type { DataUploadSummary, UploadRowStatus, UploadStatus } from "../types/dataUpload.types";

export function formatUploadRows(upload?: Pick<DataUploadSummary, "totalRows" | "validRows" | "invalidRows">, t: Translate = translate) {
    if (!upload) return "-";
    return `${upload.totalRows} ${t("dataUpload.fields.total").toLowerCase()} / ${upload.validRows} ${t("dataUpload.fields.valid").toLowerCase()} / ${upload.invalidRows} ${t("dataUpload.fields.invalid").toLowerCase()}`;
}

export function uploadStatusVariant(status?: UploadStatus) {
    if (status === "FAILED" || status === "REJECTED") return "destructive" as const;
    if (status === "COMMITTED") return "default" as const;
    if (status === "VALIDATED" || status === "PENDING_APPROVAL") return "secondary" as const;
    return "outline" as const;
}

export function uploadRowStatusVariant(status?: UploadRowStatus) {
    if (status === "INVALID") return "destructive" as const;
    if (status === "COMMITTED") return "default" as const;
    if (status === "VALID") return "secondary" as const;
    return "outline" as const;
}

export function formatUploadStatus(status?: UploadStatus, t: Translate = translate): string {
    const labels: Record<UploadStatus, string> = {
        UPLOADING: t("dataUpload.status.uploading"),
        UPLOADED: t("dataUpload.status.uploaded"),
        VALIDATING: t("dataUpload.status.validating"),
        VALIDATED: t("dataUpload.status.validated"),
        COMMITTING: t("dataUpload.status.committing"),
        COMMITTED: t("dataUpload.status.committed"),
        PENDING_APPROVAL: t("dataUpload.status.pendingApproval"),
        REJECTED: t("dataUpload.status.rejected"),
        FAILED: t("dataUpload.status.failed"),
    };
    return status ? (labels[status] ?? status) : "-";
}

export function formatUploadRowStatus(status?: UploadRowStatus, t: Translate = translate): string {
    const labels: Record<UploadRowStatus, string> = {
        RAW: t("dataUpload.status.raw"),
        VALID: t("dataUpload.status.valid"),
        INVALID: t("dataUpload.status.invalid"),
        COMMITTED: t("dataUpload.status.committed"),
    };
    return status ? (labels[status] ?? status) : "-";
}

export function buildRowStatusFilter(status: UploadRowStatus | "ALL"): GenericFilter | undefined {
    if (status === "ALL") return undefined;
    return {
        type: "simple",
        field: "rowStatus",
        operator: "EQUALS",
        value: status,
    };
}
