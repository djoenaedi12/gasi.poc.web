import { api } from "@/lib/axios";
import type { ApiResponse, LoginRequest, LoginResponse } from "../types/auth.types";

export const authService = {
    login: (data: LoginRequest) =>
        api
            .post<ApiResponse<LoginResponse>>("/auth/login", data)
            .then((response) => response.data.data),

    forgotPassword: (email: string) =>
        api.post("/auth/forgot-password", { email }),

    resetPassword: (token: string, password: string) =>
        api.post("/auth/reset-password", { token, password }),
};
