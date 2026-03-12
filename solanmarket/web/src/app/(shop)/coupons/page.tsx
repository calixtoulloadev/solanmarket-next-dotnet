"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface Coupon {
    id: string;
    code: string;
    description: string;
    discountType: "Percentage" | "Fixed";
    discountValue: number;
    minOrderAmount?: number;
    expiresAt?: string;
    isUsed: boolean;
}

export default function CouponsPage() {
    const qc = useQueryClient();
    const [code, setCode] = useState("");
    const [applied, setApplied] = useState<string | null>(null);

    const { data: coupons, isPending } = useQuery({
        queryKey: ["coupons"],
        queryFn: async () => {
            const res = await api.get<Coupon[]>("/coupons/user");
            return res.data;
        },
    });

    const { mutate: applyCode, isPending: applying, isError: applyError } = useMutation({
        mutationFn: async () => {
            const res = await api.post<{ valid: boolean; coupon?: Coupon }>("/coupons/validate", { code });
            return res.data;
        },
        onSuccess: (data) => {
            if (data.valid) {
                setApplied(code);
                setCode("");
                qc.invalidateQueries({ queryKey: ["coupons"] });
            }
        },
    });

    return (
        <div className="max-w-xl mx-auto px-4 md:px-6 py-8">
            <h1 className="font-cormorant text-3xl font-semibold mb-6" style={{ color: "var(--dark)" }}>
                My Coupons
            </h1>

            {/* Enter code */}
            <div
                className="p-5 rounded-2xl mb-6"
                style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(200,192,185,0.3)" }}
            >
                <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--dark)" }}>Have a coupon code?</h2>
                <div className="flex gap-2">
                    <input
                        className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none uppercase tracking-widest"
                        style={{ background: "rgba(247,243,238,0.8)", border: "1px solid rgba(200,192,185,0.5)", color: "var(--dark)" }}
                        placeholder="ENTER CODE"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                    />
                    <button
                        onClick={() => applyCode()}
                        disabled={!code || applying}
                        className="px-4 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50"
                        style={{ background: "var(--accent)" }}
                    >
                        {applying ? "…" : "Apply"}
                    </button>
                </div>
                {applyError && <p className="text-xs mt-2 text-red-500">Invalid or expired code</p>}
                {applied && <p className="text-xs mt-2" style={{ color: "green" }}>✓ Code "{applied}" applied!</p>}
            </div>

            {/* Coupons list */}
            {isPending ? (
                <div className="space-y-3 animate-pulse">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-20 rounded-2xl bg-[rgba(200,192,185,0.3)]" />
                    ))}
                </div>
            ) : !coupons?.length ? (
                <div className="text-center py-12" style={{ color: "var(--muted)" }}>
                    <svg className="w-10 h-10 mx-auto mb-3 opacity-25" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <p className="text-sm">No coupons available</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {coupons.map((coupon) => (
                        <div
                            key={coupon.id}
                            className="flex items-center gap-4 p-4 rounded-2xl"
                            style={{
                                background: coupon.isUsed ? "rgba(200,192,185,0.15)" : "rgba(255,255,255,0.65)",
                                border: "1px solid rgba(200,192,185,0.3)",
                                opacity: coupon.isUsed ? 0.6 : 1,
                            }}
                        >
                            <div
                                className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center"
                                style={{ background: coupon.isUsed ? "rgba(200,192,185,0.3)" : "var(--accent)" }}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="white" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-sm font-mono font-bold" style={{ color: "var(--dark)" }}>{coupon.code}</span>
                                    {coupon.isUsed && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(200,192,185,0.3)]" style={{ color: "var(--muted)" }}>Used</span>}
                                </div>
                                <p className="text-xs" style={{ color: "var(--muted)" }}>{coupon.description}</p>
                                {coupon.expiresAt && (
                                    <p className="text-[10px] mt-0.5" style={{ color: "var(--muted)" }}>
                                        Expires {new Date(coupon.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                    </p>
                                )}
                            </div>
                            <div className="shrink-0 text-right">
                                <span className="text-lg font-bold" style={{ color: "var(--accent)" }}>
                                    {coupon.discountType === "Percentage" ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
                                </span>
                                <p className="text-[10px]" style={{ color: "var(--muted)" }}>off</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
