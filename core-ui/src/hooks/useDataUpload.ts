import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { createDataUploadService } from "../lib/dataUploadService";
import type { SearchRequest } from "../types/api.types";
import type { DataUploadParameters } from "../types/dataUpload.types";

export const dataUploadQueryKeys = {
    all: (resource: string) => ["data-upload", resource] as const,
    page: (resource: string, request?: SearchRequest) =>
        ["data-upload", resource, "page", request ?? {}] as const,
    detail: (resource: string, id?: string) =>
        ["data-upload", resource, "detail", id] as const,
    rowsPage: (resource: string, uploadId?: string, request?: SearchRequest) =>
        ["data-upload", resource, "rows", uploadId, request ?? {}] as const,
    rowDetail: (resource: string, uploadId?: string, rowId?: string) =>
        ["data-upload", resource, "rows", uploadId, "detail", rowId] as const,
};

function useDataUploadService(resource: string) {
    return useMemo(() => createDataUploadService(resource), [resource]);
}

export function useDataUploadsPage(resource: string, request?: SearchRequest) {
    const service = useDataUploadService(resource);

    return useQuery({
        queryKey: dataUploadQueryKeys.page(resource, request),
        queryFn: () => service.page(request),
    });
}

export function useDataUploadRowsPage(resource: string, uploadId?: string, request?: SearchRequest) {
    const service = useDataUploadService(resource);

    return useQuery({
        queryKey: dataUploadQueryKeys.rowsPage(resource, uploadId, request),
        queryFn: () => service.rowsPage(uploadId as string, request),
        enabled: Boolean(uploadId),
    });
}

export function useDataUploadRowDetail(resource: string, uploadId?: string, rowId?: string) {
    const service = useDataUploadService(resource);

    return useQuery({
        queryKey: dataUploadQueryKeys.rowDetail(resource, uploadId, rowId),
        queryFn: () => service.rowDetail(uploadId as string, rowId as string),
        enabled: Boolean(uploadId && rowId),
    });
}

export function useDataUploadDetail(resource: string, id?: string) {
    const service = useDataUploadService(resource);

    return useQuery({
        queryKey: dataUploadQueryKeys.detail(resource, id),
        queryFn: () => service.detail(id as string),
        enabled: Boolean(id),
    });
}

export function useDataUpload(resource: string) {
    const service = useDataUploadService(resource);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ file, parameters }: { file: File; parameters?: DataUploadParameters }) =>
            service.upload(file, parameters),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: dataUploadQueryKeys.all(resource) });
        },
    });
}

export function useValidateDataUpload(resource: string) {
    const service = useDataUploadService(resource);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, parameters }: { id: string; parameters?: DataUploadParameters }) =>
            service.validate(id, parameters),
        onSuccess: (_result, variables) => {
            queryClient.invalidateQueries({ queryKey: dataUploadQueryKeys.all(resource) });
            queryClient.invalidateQueries({
                queryKey: dataUploadQueryKeys.detail(resource, variables.id),
            });
        },
    });
}

export function useCommitDataUpload(resource: string) {
    const service = useDataUploadService(resource);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, parameters }: { id: string; parameters?: DataUploadParameters }) =>
            service.commit(id, parameters),
        onSuccess: (_result, variables) => {
            queryClient.invalidateQueries({ queryKey: dataUploadQueryKeys.all(resource) });
            queryClient.invalidateQueries({
                queryKey: dataUploadQueryKeys.detail(resource, variables.id),
            });
        },
    });
}

export function useDiscardDataUpload(resource: string) {
    const service = useDataUploadService(resource);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => service.discard(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: dataUploadQueryKeys.all(resource) });
        },
    });
}

export function useDownloadDataUploadTemplate(resource: string) {
    const service = useDataUploadService(resource);

    return useMutation({
        mutationFn: ({ templateUrl }: { templateUrl?: string } = {}) =>
            service.downloadTemplate(templateUrl),
    });
}
