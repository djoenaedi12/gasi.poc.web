import { api } from "@/lib/axios";
import type { ApiResponse, PageResult, SearchRequest } from "@/types/api.types";

export function createBaseService<TSummary, TDetail, TCreate, TUpdate>(basePath: string) {
    return {
        list: (request: SearchRequest = {}) =>
            api
                .post<ApiResponse<TSummary[]>>(`${basePath}/search/list`, request)
                .then((r) => r.data.data ?? []),

        page: (request: SearchRequest = {}) =>
            api
                .post<ApiResponse<PageResult<TSummary>>>(`${basePath}/search/page`, request)
                .then((r) => r.data.data),

        detail: (id: string) =>
            api
                .get<ApiResponse<TDetail>>(`${basePath}/${id}`)
                .then((r) => r.data.data),

        create: (data: TCreate) =>
            api
                .post<ApiResponse<TDetail>>(basePath, data)
                .then((r) => r.data.data),

        update: (id: string, data: TUpdate) =>
            api
                .put<ApiResponse<TDetail>>(`${basePath}/${id}`, data)
                .then((r) => r.data.data),

        delete: (id: string) =>
            api
                .delete<ApiResponse<void>>(`${basePath}/${id}`)
                .then((r) => r.data.data),
    };
}
