import { api } from "./axios";
import type { ApiResponse, PageResult, SearchRequest } from "../types/api.types";
import type {
    DataUploadDetail,
    DataUploadParameters,
    DataUploadRowDetail,
    DataUploadRowSummary,
    DataUploadSummary,
} from "../types/dataUpload.types";

function appendParameters(formData: FormData, parameters?: DataUploadParameters) {
    Object.entries(parameters ?? {}).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            formData.append(key, String(value));
        }
    });
}

export function createDataUploadService(resource: string) {
    const basePath = `/api/v1/${resource}/upl`;

    return {
        upload: (file: File, parameters?: DataUploadParameters) => {
            const formData = new FormData();
            formData.append("file", file);
            appendParameters(formData, parameters);

            return api
                .post<ApiResponse<DataUploadDetail>>(basePath, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                })
                .then((r) => r.data.data);
        },

        page: (request: SearchRequest = {}) =>
            api
                .post<ApiResponse<PageResult<DataUploadSummary>>>(`${basePath}/search/page`, request)
                .then((r) => r.data.data),

        detail: (id: string) =>
            api
                .get<ApiResponse<DataUploadDetail>>(`${basePath}/${id}`)
                .then((r) => r.data.data),

        validate: (id: string, parameters?: DataUploadParameters) =>
            api
                .post<ApiResponse<void>>(`${basePath}/${id}/validate`, undefined, { params: parameters })
                .then((r) => r.data.data),

        commit: (id: string, parameters?: DataUploadParameters) =>
            api
                .post<ApiResponse<void>>(`${basePath}/${id}/commit`, undefined, { params: parameters })
                .then((r) => r.data.data),

        discard: (id: string) =>
            api
                .delete<ApiResponse<void>>(`${basePath}/${id}`)
                .then((r) => r.data.data),

        downloadTemplate: (templateUrl?: string) =>
            api
                .get<Blob>(templateUrl ?? `${basePath}/template`, { responseType: "blob" })
                .then((r) => r.data),

        rowDetail: (uploadId: string, rowId: string) =>
            api
                .get<ApiResponse<DataUploadRowDetail>>(`${basePath}/${uploadId}/rows/${rowId}`)
                .then((r) => r.data.data),

        rowsPage: (uploadId: string, request: SearchRequest = {}) =>
            api
                .post<ApiResponse<PageResult<DataUploadRowSummary>>>(
                    `${basePath}/${uploadId}/rows/search/page`,
                    request,
                )
                .then((r) => r.data.data),
    };
}
