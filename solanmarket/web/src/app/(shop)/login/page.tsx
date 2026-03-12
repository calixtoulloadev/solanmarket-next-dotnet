"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { AuthResponse } from "@/lib/api";

export default function LoginPage() {
    const router = useRouter();
    const setAuth = useAuthStore((s) => s.setAuth);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);

    const { mutate, isPending, isError, error } = useMutation({
        mutationFn: async () => {
            const res = await api.post<AuthResponse>("/auth/login", { email, password });
            return res.data;
        },
        onSuccess: (data) => {
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);
            setAuth(data.user, data.accessToken, data.refreshToken);
            router.push("/");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;
        mutate();
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-mesh">
            <div
                className="w-full max-w-sm p-8 rounded-3xl"
                style={{ background: "rgba(255,255,255,0.75)", border: "1px solid rgba(200,192,185,0.4)" }}
            >
                <div className="text-center mb-8">
                    <Link href="/" className="font-cormorant text-2xl font-semibold" style={{ color: "var(--dark)" }}>
                        Solanmarket
                    </Link>
                    <h1 className="font-cormorant text-3xl font-semibold mt-4 mb-1" style={{ color: "var(--dark)" }}>Welcome back</h1>
                    <p className="text-sm" style={{ color: "var(--muted)" }}>Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted)" }}>Email</label>
                        <input
                            type="email"
                            autoComplete="email"
                            required
                            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                            style={{ background: "rgba(247,243,238,0.8)", border: "1px solid rgba(200,192,185,0.5)", color: "var(--dark)" }}
                            placeholder="you@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted)" }}>Password</label>
                        <div className="relative">
                            <input
                                type={showPw ? "text" : "password"}
                                autoComplete="current-password"
                                required
                                className="w-full px-4 py-3 rounded-xl text-sm outline-none pr-10"
                                style={{ background: "rgba(247,243,238,0.8)", border: "1px solid rgba(200,192,185,0.5)", color: "var(--dark)" }}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPw((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-80"
                            >
                                <svg className="w-4 h-4" style={{ color: "var(--dark)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {showPw ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    )}
                                </svg>
                            </button>
                        </div>
                        <div className="text-right mt-1.5">
                            <Link href="/forgot-password" className="text-xs" style={{ color: "var(--accent)" }}>
                                Forgot password?
                            </Link>
                        </div>
                    </div>

                    {isError && (
                        <p className="text-sm text-red-500 text-center">
                            {(error as AxiosError<string>)?.response?.data ?? (error as Error)?.message ?? "Invalid email or password"}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90 disabled:opacity-60"
                        style={{ background: "var(--dark)" }}
                    >
                        {isPending ? "Signing in…" : "Sign In"}
                    </button>
                </form>

                <p className="text-center text-sm mt-6" style={{ color: "var(--muted)" }}>
                    New here?{" "}
                    <Link href="/register" className="font-medium" style={{ color: "var(--accent)" }}>
                        Create an account
                    </Link>
                </p>
            </div>
        </div>
    );
}
