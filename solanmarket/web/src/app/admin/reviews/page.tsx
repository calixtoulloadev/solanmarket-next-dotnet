"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface Review {
    id: string; productName: string; productId: string; userFirstName: string; userLastName: string;
    rating: number; title: string; body: string; status: "Pending" | "Approved" | "Rejected"; createdAt: string;
}
interface PagedResult<T> { items: T[]; totalCount: number; totalPages: number; }

const STATUS_COLORS: Record<string, string> = {
    Pending: "rgba(251,191,36,0.2)", Approved: "rgba(134,239,172,0.2)", Rejected: "rgba(252,165,165,0.2)",
};

export default function AdminReviewsPage() {
    const qc = useQueryClient();
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("Pending");

    const { data, isPending } = useQuery({
        queryKey: ["admin", "reviews", page, statusFilter],
        queryFn: async () => {
            const res = await api.get<PagedResult<Review>>("/admin/reviews", {
                params: { pageIndex: page, pageSize: 20, status: statusFilter !== "All" ? statusFilter : undefined },
            });
            return res.data;
        },
    });

    const { mutate: updateStatus } = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            await api.patch(`/admin/reviews/${id}/status`, { status });
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "reviews"] }),
    });

    return (
        <div className="px-4 md:px-8 py-8">
            <h1 className="font-cormorant text-3xl font-semibold mb-6" style={{ color: "var(--dark)" }}>Reviews</h1>

            {/* Status tabs */}
            <div className="flex gap-2 mb-6">
                {["Pending", "Approved", "Rejected", "All"].map((s) => (
                    <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} className="px-3 py-1.5 rounded-full text-xs font-medium transition-all" style={{ background: statusFilter === s ? "var(--dark)" : "rgba(255,255,255,0.7)", color: statusFilter === s ? "white" : "var(--muted)", border: "1px solid rgba(200,192,185,0.4)" }}>
                        {s}
                    </button>
                ))}
            </div>

            <div className="space-y-3">
                {isPending
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="rounded-2xl p-5 animate-pulse" style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(200,192,185,0.3)" }}>
                            <div className="h-4 rounded w-48 mb-3" style={{ background: "rgba(200,192,185,0.3)" }} />
                            <div className="h-3 rounded w-full mb-2" style={{ background: "rgba(200,192,185,0.2)" }} />
                            <div className="h-3 rounded w-3/4" style={{ background: "rgba(200,192,185,0.2)" }} />
                        </div>
                    ))
                    : data?.items.map((review) => (
                        <div key={review.id} className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(200,192,185,0.3)" }}>
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <span className="font-semibold text-sm" style={{ color: "var(--dark)" }}>{review.userFirstName} {review.userLastName}</span>
                                        <span className="text-xs" style={{ color: "var(--muted)" }}>on <span className="font-medium">{review.productName}</span></span>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: STATUS_COLORS[review.status] ?? "rgba(200,192,185,0.3)", color: "var(--dark)" }}>{review.status}</span>
                                    </div>
                                    <div className="flex gap-0.5 mb-2">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <svg key={i} className="w-3 h-3" fill={i < review.rating ? "#F59E0B" : "none"} stroke="#F59E0B" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                                        ))}
                                    </div>
                                    {review.title && <p className="text-sm font-medium mb-1" style={{ color: "var(--dark)" }}>{review.title}</p>}
                                    <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>{review.body}</p>
                                    <p className="text-[10px] mt-2" style={{ color: "var(--muted)" }}>{new Date(review.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="flex flex-col gap-2 shrink-0">
                                    {review.status !== "Approved" && (
                                        <button onClick={() => updateStatus({ id: review.id, status: "Approved" })} className="px-3 py-1 rounded-lg text-xs font-medium text-white" style={{ background: "var(--sage)", color: "var(--dark)" }}>Approve</button>
                                    )}
                                    {review.status !== "Rejected" && (
                                        <button onClick={() => updateStatus({ id: review.id, status: "Rejected" })} className="px-3 py-1 rounded-lg text-xs font-medium" style={{ background: "rgba(252,165,165,0.3)", color: "#dc2626" }}>Reject</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
            </div>

            {data && data.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                    <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} className="px-4 py-2 rounded-xl text-sm disabled:opacity-40" style={{ background: "rgba(200,192,185,0.3)", color: "var(--dark)" }}>Prev</button>
                    <span className="text-sm" style={{ color: "var(--muted)" }}>{page} / {data.totalPages}</span>
                    <button onClick={() => setPage((p) => p + 1)} disabled={page === data.totalPages} className="px-4 py-2 rounded-xl text-sm disabled:opacity-40" style={{ background: "rgba(200,192,185,0.3)", color: "var(--dark)" }}>Next</button>
                </div>
            )}
        </div>
    );
}
