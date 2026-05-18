export interface User {
    name: string;
    email: string;
    role: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    user: User;
}