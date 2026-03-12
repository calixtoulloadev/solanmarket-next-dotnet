"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/api";
import { OrderSummary } from "@/types";

const STATUS_OPTIONS = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Refunded"];

const STATUS_COLORS: Record<string, string> = {
    Pending: "rgba(251,191,36,0.2)",
    Processing: "rgba(96,165,250,0.2)",
    Shipped: "rgba(167,139,250,0.2)",
    Delivered: "rgba(134,239,172,0.2)",
    Cancelled: "rgba(252,165,165,0.2)",
    Refunded: "rgba(200,192,185,0.3)",
};

interface PagedResult<T> { items: T[]; totalCount: number; totalPages: number; pageIndex: number; }

export default function AdminOrdersPage() {
    const qc = useQueryClient();
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState("All");
    const [search, setSearch] = useState("");

    const { data, isPending } = useQuery({
        queryKey: ["admin", "orders", page, status, search],
        queryFn: async () => {
            const res = await api.get<PagedResult<OrderSummary>>("/admin/orders", {
                params: { pageIndex: page, pageSize: 20, status: status !== "All" ? status : undefined, search: search || undefined },
            });
            return res.data;
        },
    });

    const { mutate: updateStatus } = useMutation({
        mutationFn: async ({ id, newStatus }: { id: string; newStatus: string }) => {
            await api.patch(`/admin/orders/${id}/status`, { status: newStatus });
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "orders"] }),
    });

    return (
        <div className="px-4 md:px-8 py-8">
            <h1 className="font-cormorant text-3xl font-semibold mb-6" style={{ color: "var(--dark)" }}>Orders</h1>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(200,192,185,0.5)" }}>
                    <svg className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input className="bg-transparent text-sm outline-none w-44" placeholder="Search by order # or customer…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ color: "var(--dark)" }} />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                    {STATUS_OPTIONS.map((s) => (
                        <button key={s} onClick={() => { setStatus(s); setPage(1); }} className="px-3 py-1.5 rounded-full text-xs font-medium transition-all" style={{ background: status === s ? "var(--dark)" : "rgba(255,255,255,0.7)", color: status === s ? "white" : "var(--muted)", border: "1px solid rgba(200,192,185,0.4)" }}>
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(200,192,185,0.3)" }}>
                <table className="w-full text-sm">
                    <thead>
                        <tr style={{ borderBottom: "1px solid rgba(200,192,185,0.3)" }}>
                            {["Order #", "Customer", "Items", "Total", "Status", "Date", ""].map((h) => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: "var(--muted)" }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {isPending
                            ? Array.from({ length: 8 }).map((_, i) => (
                                <tr key={i}>{Array.from({ length: 7 }).map((__, j) => <td key={j} className="px-4 py-3"><div className="h-4 rounded animate-pulse" style={{ background: "rgba(200,192,185,0.3)" }} /></td>)}</tr>
                            ))
                            : data?.items.map((order) => (
                                <tr key={order.id} className="hover:bg-white/40 transition-all" style={{ borderBottom: "1px solid rgba(200,192,185,0.15)" }}>
                                    <td className="px-4 py-3 font-medium text-xs" style={{ color: "var(--dark)" }}>#{order.orderNumber}</td>
                                    <td className="px-4 py-3 text-xs" style={{ color: "var(--muted)" }}>{order.userEmail ?? "—"}</td>
                                    <td className="px-4 py-3 text-xs text-center" style={{ color: "var(--muted)" }}>{order.itemCount}</td>
                                    <td className="px-4 py-3 font-medium" style={{ color: "var(--dark)" }}>${order.total.toFixed(2)}</td>
                                    <td className="px-4 py-3">
                                        <select
                                            defaultValue={order.status}
                                            onChange={(e) => updateStatus({ id: order.id, newStatus: e.target.value })}
                                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full outline-none cursor-pointer"
                                            style={{ background: STATUS_COLORS[order.status] ?? "rgba(200,192,185,0.3)", color: "var(--dark)", border: "none" }}
                                        >
                                            {STATUS_OPTIONS.filter((s) => s !== "All").map((s) => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </td>
                                    <td className="px-4 py-3 text-xs" style={{ color: "var(--muted)" }}>
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Link href={`/orders/${order.id}`} className="text-xs font-medium" style={{ color: "var(--accent)" }}>View</Link>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>

                {data && data.totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: "rgba(200,192,185,0.3)" }}>
                        <p className="text-xs" style={{ color: "var(--muted)" }}>{data.totalCount} orders</p>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} className="px-3 py-1 rounded-lg text-xs disabled:opacity-40" style={{ background: "rgba(200,192,185,0.3)", color: "var(--dark)" }}>Prev</button>
                            <span className="text-xs" style={{ color: "var(--muted)" }}>{page} / {data.totalPages}</span>
                            <button onClick={() => setPage((p) => p + 1)} disabled={page === data.totalPages} className="px-3 py-1 rounded-lg text-xs disabled:opacity-40" style={{ background: "rgba(200,192,185,0.3)", color: "var(--dark)" }}>Next</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
