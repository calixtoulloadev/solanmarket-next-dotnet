"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

function ResetForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token") ?? "";
    const email = searchParams.get("email") ?? "";
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [done, setDone] = useState(false);
    const [showPw, setShowPw] = useState(false);

    const { mutate, isPending, isError } = useMutation({
        mutationFn: async () => {
            await api.post("/auth/reset-password", { email, token, newPassword: password });
        },
        onSuccess: () => setDone(true),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirm || password.length < 8) return;
        mutate();
    };

    const mismatch = confirm && password !== confirm;

    if (done) {
        return (
            <div className="text-center space-y-4">
                <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center" style={{ background: "var(--sage)" }}>
                    <svg className="w-7 h-7" style={{ color: "var(--dark)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <p className="text-sm" style={{ color: "var(--dark)" }}>Your password has been reset.</p>
                <Link href="/login" className="block w-full py-3.5 rounded-xl text-white font-semibold text-center" style={{ background: "var(--dark)" }}>
                    Sign In
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted)" }}>New password</label>
                <div className="relative">
                    <input
                        type={showPw ? "text" : "password"}
                        required
                        minLength={8}
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none pr-10"
                        style={{ background: "rgba(247,243,238,0.8)", border: "1px solid rgba(200,192,185,0.5)", color: "var(--dark)" }}
                        placeholder="Min 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-80">
                        <svg className="w-4 h-4" style={{ color: "var(--dark)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </button>
                </div>
            </div>
            <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted)" }}>Confirm new password</label>
                <input
                    type={showPw ? "text" : "password"}
                    required
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{ background: "rgba(247,243,238,0.8)", border: `1px solid ${mismatch ? "#ef4444" : "rgba(200,192,185,0.5)"}`, color: "var(--dark)" }}
                    placeholder="Repeat password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                />
                {mismatch && <p className="text-xs mt-1 text-red-500">Passwords do not match</p>}
            </div>

            {isError && <p className="text-sm text-red-500 text-center">Invalid or expired reset link.</p>}

            <button
                type="submit"
                disabled={isPending || !!mismatch}
                className="w-full py-3.5 rounded-xl text-white font-semibold disabled:opacity-60"
                style={{ background: "var(--dark)" }}
            >
                {isPending ? "Resetting…" : "Reset Password"}
            </button>
        </form>
    );
}

export default function ResetPasswordPage() {
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
                    <h1 className="font-cormorant text-3xl font-semibold mt-4 mb-1" style={{ color: "var(--dark)" }}>New password</h1>
                    <p className="text-sm" style={{ color: "var(--muted)" }}>Enter your new password below.</p>
                </div>
                <Suspense fallback={null}>
                    <ResetForm />
                </Suspense>
            </div>
        </div>
    );
}
