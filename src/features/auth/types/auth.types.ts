export type { ApiResponse } from "@/types/api.types";

export interface User {
    name: string;
    email: string;
    role: string;
}

export interface LoginRequest {
    grantType: string;
    provider?: string;
    username: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    scope?: string;
    deviceId?: string;
}
