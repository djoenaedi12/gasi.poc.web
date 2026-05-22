import type { GenericFilter } from "../types/api.types";
import type { DataUploadSummary, UploadRowStatus, UploadStatus } from "../types/dataUpload.types";

export function formatUploadRows(upload?: Pick<DataUploadSummary, "totalRows" | "validRows" | "invalidRows">) {
    if (!upload) return "-";
    return `${upload.totalRows} total / ${upload.validRows} valid / ${upload.invalidRows} invalid`;
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

export function buildRowStatusFilter(status: UploadRowStatus | "ALL"): GenericFilter | undefined {
    if (status === "ALL") return undefined;
    return {
        type: "simple",
        field: "rowStatus",
        operator: "EQUALS",
        value: status,
    };
}
