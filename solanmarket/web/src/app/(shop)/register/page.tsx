"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { AuthResponse } from "@/lib/api";

export default function RegisterPage() {
    const router = useRouter();
    const setAuth = useAuthStore((s) => s.setAuth);
    const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", confirm: "" });
    const [showPw, setShowPw] = useState(false);

    const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

    const { mutate, isPending, isError, error } = useMutation({
        mutationFn: async () => {
            const res = await api.post<AuthResponse>("/auth/register", {
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email,
                password: form.password,
            });
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
        if (form.password !== form.confirm) return;
        mutate();
    };

    const passwordMismatch = form.confirm && form.password !== form.confirm;

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-mesh">
            <div
                className="w-full max-w-sm p-8 rounded-3xl"
                style={{ background: "rgba(255,255,255,0.75)", border: "1px solid rgba(200,192,185,0.4)" }}
            >
                <div className="text-center mb-8">
                    <Link href="/" className="font-cormorant text-2xl font-semibold" style={{ color: "var(--dark)" }}>
                        Solanmarket
                    </Link>
                    <h1 className="font-cormorant text-3xl font-semibold mt-4 mb-1" style={{ color: "var(--dark)" }}>
                        Create account
                    </h1>
                    <p className="text-sm" style={{ color: "var(--muted)" }}>Join the community</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { key: "firstName", label: "First name", placeholder: "Jane" },
                            { key: "lastName", label: "Last name", placeholder: "Doe" },
                        ].map(({ key, label, placeholder }) => (
                            <div key={key}>
                                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted)" }}>{label}</label>
                                <input
                                    required
                                    className="w-full px-3 py-3 rounded-xl text-sm outline-none"
                                    style={{ background: "rgba(247,243,238,0.8)", border: "1px solid rgba(200,192,185,0.5)", color: "var(--dark)" }}
                                    placeholder={placeholder}
                                    value={(form as Record<string, string>)[key]}
                                    onChange={(e) => set(key, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>

                    <div>
                        <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted)" }}>Email</label>
                        <input
                            type="email"
                            autoComplete="email"
                            required
                            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                            style={{ background: "rgba(247,243,238,0.8)", border: "1px solid rgba(200,192,185,0.5)", color: "var(--dark)" }}
                            placeholder="you@email.com"
                            value={form.email}
                            onChange={(e) => set("email", e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted)" }}>Password</label>
                        <div className="relative">
                            <input
                                type={showPw ? "text" : "password"}
                                autoComplete="new-password"
                                required
                                minLength={8}
                                className="w-full px-4 py-3 rounded-xl text-sm outline-none pr-10"
                                style={{ background: "rgba(247,243,238,0.8)", border: "1px solid rgba(200,192,185,0.5)", color: "var(--dark)" }}
                                placeholder="Min 8 characters"
                                value={form.password}
                                onChange={(e) => set("password", e.target.value)}
                            />
                            <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-80">
                                <svg className="w-4 h-4" style={{ color: "var(--dark)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted)" }}>Confirm password</label>
                        <input
                            type={showPw ? "text" : "password"}
                            autoComplete="new-password"
                            required
                            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                            style={{
                                background: "rgba(247,243,238,0.8)",
                                border: `1px solid ${passwordMismatch ? "#ef4444" : "rgba(200,192,185,0.5)"}`,
                                color: "var(--dark)",
                            }}
                            placeholder="Repeat password"
                            value={form.confirm}
                            onChange={(e) => set("confirm", e.target.value)}
                        />
                        {passwordMismatch && <p className="text-xs mt-1 text-red-500">Passwords do not match</p>}
                    </div>

                    {isError && (
                        <p className="text-sm text-red-500 text-center">
                            {(error as AxiosError<string>)?.response?.data ?? (error as Error)?.message ?? "Registration failed. Please try again."}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isPending || !!passwordMismatch}
                        className="w-full py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90 disabled:opacity-60"
                        style={{ background: "var(--dark)" }}
                    >
                        {isPending ? "Creating account…" : "Create Account"}
                    </button>
                </form>

                <p className="text-center text-sm mt-6" style={{ color: "var(--muted)" }}>
                    Already have an account?{" "}
                    <Link href="/login" className="font-medium" style={{ color: "var(--accent)" }}>
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}
