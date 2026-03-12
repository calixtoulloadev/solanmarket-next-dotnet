import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserProfileDto } from "@/lib/api";

interface AuthStore {
    user: UserProfileDto | null;
    accessToken: string | null;
    refreshToken: string | null;
    setAuth: (user: UserProfileDto, accessToken: string, refreshToken: string) => void;
    clearAuth: () => void;
    isAuthenticated: () => boolean;
    isAdmin: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            refreshToken: null,

            setAuth: (user, accessToken, refreshToken) => {
                // Keep tokens in localStorage for the API interceptor
                if (typeof window !== "undefined") {
                    localStorage.setItem("accessToken", accessToken);
                    localStorage.setItem("refreshToken", refreshToken);
                }
                set({ user, accessToken, refreshToken });
            },

            clearAuth: () => {
                if (typeof window !== "undefined") {
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("refreshToken");
                }
                set({ user: null, accessToken: null, refreshToken: null });
            },

            isAuthenticated: () => !!get().accessToken,

            isAdmin: () => get().user?.role === "Admin",
        }),
        {
            name: "solanmarket-auth",
            // Don't persist tokens in storage (only keep user info)
            partialize: (state) => ({ user: state.user }),
        }
    )
);
