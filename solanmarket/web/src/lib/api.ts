/**
 * Solanmarket API client
 * All requests go through this module so auth headers are always included.
 */
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5055/api";

export const api = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
    withCredentials: false,
});

// ── Request interceptor: attach JWT ──────────────────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.set("Authorization", `Bearer ${token}`);
        }
    }
    return config;
});

// ── Response interceptor: handle 401 → refresh ───────────────────────────────
api.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
        const original = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        if (error.response?.status === 401 && !original._retry) {
            original._retry = true;
            const refreshToken = localStorage.getItem("refreshToken");

            if (refreshToken) {
                try {
                    const { data } = await api.post<AuthResponse>("/auth/refresh", {
                        refreshToken,
                    });
                    localStorage.setItem("accessToken", data.accessToken);
                    localStorage.setItem("refreshToken", data.refreshToken);
                    original.headers.set("Authorization", `Bearer ${data.accessToken}`);
                    return api(original);
                } catch {
                    // Refresh failed – clear tokens and redirect to login
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("refreshToken");
                    window.location.href = "/login";
                }
            }
        }

        return Promise.reject(error);
    }
);

// ── Type imports (keep types co-located with client) ─────────────────────────
export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: UserProfileDto;
}

export interface UserProfileDto {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
    role: string;
    tier: string;
    loyaltyPoints: number;
    referralCode?: string;
}

export interface PagedResult<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
