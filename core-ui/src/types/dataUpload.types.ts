export type UploadStatus =
    | "UPLOADING"
    | "UPLOADED"
    | "VALIDATING"
    | "VALIDATED"
    | "COMMITTING"
    | "PENDING_APPROVAL"
    | "COMMITTED"
    | "REJECTED"
    | "FAILED";

export type UploadRowStatus = "RAW" | "VALID" | "INVALID" | "COMMITTED";

export type DataUploadSummary = {
    id: string;
    createdAt?: string;
    fileName: string;
    totalRows: number;
    validRows: number;
    invalidRows: number;
    uploadStatus: UploadStatus;
};

export type DataUploadDetail = DataUploadSummary & {
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
    version?: number;
};

export type DataUploadRowSummary = {
    id: string;
    createdAt?: string;
    rowNumber: number;
    rowStatus: UploadRowStatus;
    identifier?: string;
    lookupValue1?: string;
    lookupValue2?: string;
    lookupValue3?: string;
    errorMessage?: string;
};

export type DataUploadRowDetail = DataUploadRowSummary & {
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
    version?: number;
    rowData?: string;
};

export type DataUploadParameters = Record<string, string | number | boolean | null | undefined>;
