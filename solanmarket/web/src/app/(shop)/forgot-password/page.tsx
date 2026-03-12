"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);

    const { mutate, isPending, isError } = useMutation({
        mutationFn: async () => {
            await api.post("/auth/forgot-password", { email });
        },
        onSuccess: () => setSent(true),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
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
                    <h1 className="font-cormorant text-3xl font-semibold mt-4 mb-1" style={{ color: "var(--dark)" }}>
                        Reset password
                    </h1>
                    <p className="text-sm" style={{ color: "var(--muted)" }}>
                        We'll send a reset link to your email.
                    </p>
                </div>

                {sent ? (
                    <div className="text-center space-y-4">
                        <div
                            className="w-14 h-14 rounded-full mx-auto flex items-center justify-center"
                            style={{ background: "var(--sage)" }}
                        >
                            <svg className="w-7 h-7" style={{ color: "var(--dark)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-sm" style={{ color: "var(--dark)" }}>
                            Check your inbox — we sent a link to <strong>{email}</strong>
                        </p>
                        <Link href="/login" className="block text-sm font-medium" style={{ color: "var(--accent)" }}>
                            Back to Sign In
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted)" }}>Email address</label>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                                style={{ background: "rgba(247,243,238,0.8)", border: "1px solid rgba(200,192,185,0.5)", color: "var(--dark)" }}
                                placeholder="you@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {isError && (
                            <p className="text-sm text-red-500 text-center">Something went wrong. Please try again.</p>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full py-3.5 rounded-xl text-white font-semibold disabled:opacity-60"
                            style={{ background: "var(--dark)" }}
                        >
                            {isPending ? "Sending…" : "Send Reset Link"}
                        </button>

                        <p className="text-center text-sm" style={{ color: "var(--muted)" }}>
                            Remember it?{" "}
                            <Link href="/login" className="font-medium" style={{ color: "var(--accent)" }}>
                                Sign In
                            </Link>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}
