import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthUser } from "@/types";

interface AuthState {
    user: AuthUser | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (user: AuthUser, token: string) => void;
    logout: () => void;
    setUser: (user: AuthUser) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            login: (user, token) => {
                if (typeof window !== "undefined") {
                    localStorage.setItem("token", token);
                }
                set({ user, token, isAuthenticated: true });
            },

            logout: () => {
                if (typeof window !== "undefined") {
                    localStorage.removeItem("token");
                }
                set({ user: null, token: null, isAuthenticated: false });
            },

            setUser: (user) => set({ user }),
        }),
        {
            name: "appna-auth",
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
