"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

interface LoyaltyData {
    points: number;
    tier: string;
    nextTierPoints: number;
    history: Array<{ id: string; description: string; points: number; createdAt: string }>;
}

const TIERS = [
    { name: "Bronze", min: 0, color: "#CD7F32" },
    { name: "Silver", min: 500, color: "#A8A9AD" },
    { name: "Gold", min: 1500, color: "#FFD700" },
    { name: "Platinum", min: 5000, color: "#E5E4E2" },
];

export default function LoyaltyPage() {
    const { user } = useAuthStore();

    const { data, isPending } = useQuery({
        queryKey: ["loyalty"],
        queryFn: async () => {
            const res = await api.get<LoyaltyData>("/loyalty");
            return res.data;
        },
        enabled: !!user,
    });

    const tier = data ? TIERS.find((t) => t.name === data.tier) ?? TIERS[0] : TIERS[0];
    const nextTier = data ? TIERS[TIERS.indexOf(tier) + 1] : null;
    const progress = data && nextTier ? Math.min((data.points / nextTier.min) * 100, 100) : 100;

    return (
        <div className="max-w-xl mx-auto px-4 md:px-6 py-8">
            <h1 className="font-cormorant text-3xl font-semibold mb-6" style={{ color: "var(--dark)" }}>
                Loyalty Program
            </h1>

            {/* Points card */}
            <div
                className="p-6 rounded-3xl mb-6 text-center"
                style={{
                    background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-l) 100%)",
                }}
            >
                {isPending ? (
                    <div className="space-y-3 animate-pulse">
                        <div className="h-10 w-24 mx-auto rounded bg-white/20" />
                        <div className="h-4 w-16 mx-auto rounded bg-white/20" />
                    </div>
                ) : (
                    <>
                        <p className="text-white/70 text-xs uppercase tracking-widest mb-1">Total Points</p>
                        <p className="text-white font-cormorant text-5xl font-semibold mb-1">{data?.points ?? 0}</p>
                        <p
                            className="inline-block px-3 py-0.5 rounded-full text-xs font-bold mb-4"
                            style={{ background: tier.color, color: "#2A2430" }}
                        >
                            {data?.tier ?? "Bronze"} Member
                        </p>
                        {nextTier && (
                            <div>
                                <div className="h-2 rounded-full bg-white/20 overflow-hidden mb-1">
                                    <div
                                        className="h-full rounded-full transition-all"
                                        style={{ width: `${progress}%`, background: "white" }}
                                    />
                                </div>
                                <p className="text-white/70 text-xs">
                                    {data?.nextTierPoints ?? 0} more points to {nextTier.name}
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Tiers info */}
            <div
                className="p-5 rounded-2xl mb-6"
                style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(200,192,185,0.3)" }}
            >
                <h2 className="font-cormorant text-xl font-semibold mb-4" style={{ color: "var(--dark)" }}>Membership Tiers</h2>
                <div className="space-y-3">
                    {TIERS.map((t) => (
                        <div key={t.name} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center" style={{ background: t.color }}>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="#2A2430" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium" style={{ color: "var(--dark)" }}>{t.name}</p>
                                <p className="text-xs" style={{ color: "var(--muted)" }}>{t.min}+ points</p>
                            </div>
                            {data?.tier === t.name && (
                                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--sage)", color: "var(--dark)" }}>
                                    Current
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* History */}
            <div
                className="p-5 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(200,192,185,0.3)" }}
            >
                <h2 className="font-cormorant text-xl font-semibold mb-4" style={{ color: "var(--dark)" }}>Points History</h2>
                {isPending ? (
                    <div className="space-y-3 animate-pulse">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-10 rounded-xl bg-[rgba(200,192,185,0.3)]" />
                        ))}
                    </div>
                ) : !data?.history?.length ? (
                    <p className="text-sm text-center py-4" style={{ color: "var(--muted)" }}>No points activity yet</p>
                ) : (
                    <div className="space-y-2.5">
                        {data.history.map((h) => (
                            <div key={h.id} className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm" style={{ color: "var(--dark)" }}>{h.description}</p>
                                    <p className="text-xs" style={{ color: "var(--muted)" }}>
                                        {new Date(h.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                    </p>
                                </div>
                                <span
                                    className="text-sm font-semibold"
                                    style={{ color: h.points >= 0 ? "green" : "red" }}
                                >
                                    {h.points >= 0 ? "+" : ""}{h.points} pts
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
