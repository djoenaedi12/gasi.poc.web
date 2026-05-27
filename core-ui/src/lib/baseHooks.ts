import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PageResult, SearchRequest } from "../types/api.types";

type BaseService<TSummary, TDetail, TCreate, TUpdate> = {
    list: (request?: SearchRequest) => Promise<TSummary[]>;
    page: (request?: SearchRequest) => Promise<PageResult<TSummary> | undefined>;
    lookupPage?: (request?: SearchRequest) => Promise<PageResult<TSummary> | undefined>;
    detail: (id: string) => Promise<TDetail | undefined>;
    create: (data: TCreate) => Promise<TDetail | undefined>;
    update: (id: string, data: TUpdate) => Promise<TDetail | undefined>;
    delete: (id: string) => Promise<void | undefined>;
};

export function createBaseHooks<TSummary, TDetail, TCreate, TUpdate>(
    entityKey: string,
    service: BaseService<TSummary, TDetail, TCreate, TUpdate>
) {
    const queryKeys = {
        all: [entityKey] as const,
        list: (request?: SearchRequest) => [entityKey, "list", request ?? {}] as const,
        page: (request?: SearchRequest) => [entityKey, "page", request ?? {}] as const,
        lookupPage: (request?: SearchRequest) => [entityKey, "lookup", "page", request ?? {}] as const,
        detail: (id?: string) => [entityKey, "detail", id] as const,
    };

    function useList(request?: SearchRequest) {
        return useQuery({
            queryKey: queryKeys.list(request),
            queryFn: () => service.list(request),
        });
    }

    function usePage(request?: SearchRequest) {
        return useQuery({
            queryKey: queryKeys.page(request),
            queryFn: () => service.page(request),
        });
    }

    function useLookupPage(request?: SearchRequest) {
        return useQuery({
            queryKey: queryKeys.lookupPage(request),
            queryFn: () => (service.lookupPage ?? service.page)(request),
        });
    }

    function useDetail(id?: string) {
        return useQuery({
            queryKey: queryKeys.detail(id),
            queryFn: () => service.detail(id as string),
            enabled: Boolean(id),
        });
    }

    function useCreate() {
        const queryClient = useQueryClient();
        return useMutation({
            mutationFn: (data: TCreate) => service.create(data),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: queryKeys.all });
            },
        });
    }

    function useUpdate() {
        const queryClient = useQueryClient();
        return useMutation({
            mutationFn: ({ id, data }: { id: string; data: TUpdate }) =>
                service.update(id, data),
            onSuccess: (_result, variables) => {
                queryClient.invalidateQueries({ queryKey: queryKeys.all });
                queryClient.invalidateQueries({ queryKey: queryKeys.detail(variables.id) });
            },
        });
    }

    function useDelete() {
        const queryClient = useQueryClient();
        return useMutation({
            mutationFn: (id: string) => service.delete(id),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: queryKeys.all });
            },
        });
    }

    return { queryKeys, useList, usePage, useLookupPage, useDetail, useCreate, useUpdate, useDelete };
}
