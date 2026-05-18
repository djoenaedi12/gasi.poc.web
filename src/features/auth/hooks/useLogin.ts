import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { authService } from "../services/authService";
import { useAuthStore } from "@/stores/useAuthStore";
import type { LoginRequest } from "../types/auth.types";

export function useLogin() {
    const navigate = useNavigate();
    const setUser = useAuthStore((s) => s.setUser);

    return useMutation({
        mutationFn: (data: LoginRequest) =>
            authService.login(data).then((r) => r.data),
        onSuccess: (data) => {
            localStorage.setItem("accessToken", data.accessToken);
            setUser(data.user);
            navigate("/");
        },
    });
}