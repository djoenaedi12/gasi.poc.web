import { create } from "zustand";

interface User {
    name: string;
    email: string;
    role: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    setUser: (user: User) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    setUser: (user) => set({ user, isAuthenticated: true }),
    logout: () => {
        localStorage.removeItem("accessToken");
        set({ user: null, isAuthenticated: false });
    },
}));