"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface AdminUser { id: string; firstName: string; lastName: string; email: string; role: string; createdAt: string; orderCount?: number; totalSpent?: number; }
interface PagedResult<T> { items: T[]; totalCount: number; totalPages: number; pageIndex: number; }

const ROLE_COLORS: Record<string, string> = {
    Admin: "var(--lavender)",
    Customer: "var(--sage)",
};

export default function AdminUsersPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [role, setRole] = useState("All");

    const { data, isPending } = useQuery({
        queryKey: ["admin", "users", page, search, role],
        queryFn: async () => {
            const res = await api.get<PagedResult<AdminUser>>("/admin/users", {
                params: { pageIndex: page, pageSize: 25, search: search || undefined, role: role !== "All" ? role : undefined },
            });
            return res.data;
        },
    });

    return (
        <div className="px-4 md:px-8 py-8">
            <h1 className="font-cormorant text-3xl font-semibold mb-6" style={{ color: "var(--dark)" }}>Users</h1>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(200,192,185,0.5)" }}>
                    <svg className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input className="bg-transparent text-sm outline-none w-48" placeholder="Search by name or email…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ color: "var(--dark)" }} />
                </div>
                {["All", "Customer", "Admin"].map((r) => (
                    <button key={r} onClick={() => { setRole(r); setPage(1); }} className="px-3 py-1.5 rounded-full text-xs font-medium transition-all" style={{ background: role === r ? "var(--dark)" : "rgba(255,255,255,0.7)", color: role === r ? "white" : "var(--muted)", border: "1px solid rgba(200,192,185,0.4)" }}>
                        {r}
                    </button>
                ))}
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(200,192,185,0.3)" }}>
                <table className="w-full text-sm">
                    <thead>
                        <tr style={{ borderBottom: "1px solid rgba(200,192,185,0.3)" }}>
                            {["User", "Email", "Role", "Orders", "Total Spent", "Joined"].map((h) => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: "var(--muted)" }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {isPending
                            ? Array.from({ length: 8 }).map((_, i) => (
                                <tr key={i}>{Array.from({ length: 6 }).map((__, j) => <td key={j} className="px-4 py-3"><div className="h-4 rounded animate-pulse" style={{ background: "rgba(200,192,185,0.3)" }} /></td>)}</tr>
                            ))
                            : data?.items.map((user) => (
                                <tr key={user.id} className="hover:bg-white/40 transition-all" style={{ borderBottom: "1px solid rgba(200,192,185,0.15)" }}>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shrink-0" style={{ background: "var(--accent)" }}>
                                                {(user.firstName?.[0] ?? "") + (user.lastName?.[0] ?? "")}
                                            </div>
                                            <span className="font-medium text-sm" style={{ color: "var(--dark)" }}>{user.firstName} {user.lastName}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-xs" style={{ color: "var(--muted)" }}>{user.email}</td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: ROLE_COLORS[user.role] ?? "rgba(200,192,185,0.3)", color: "var(--dark)" }}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-center" style={{ color: "var(--muted)" }}>{user.orderCount ?? 0}</td>
                                    <td className="px-4 py-3 text-xs font-medium" style={{ color: "var(--dark)" }}>${(user.totalSpent ?? 0).toFixed(2)}</td>
                                    <td className="px-4 py-3 text-xs" style={{ color: "var(--muted)" }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                    </tbody>
                </table>

                {data && data.totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: "rgba(200,192,185,0.3)" }}>
                        <p className="text-xs" style={{ color: "var(--muted)" }}>{data.totalCount} users</p>
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
