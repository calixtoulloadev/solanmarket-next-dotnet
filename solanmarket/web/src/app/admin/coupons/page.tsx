"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface Coupon {
    id: string; code: string; description: string; discountType: "Percentage" | "Fixed";
    discountValue: number; minOrderAmount: number; maxUses: number | null; usedCount: number;
    expiresAt: string | null; isActive: boolean;
}

interface CouponForm {
    code: string; description: string; discountType: "Percentage" | "Fixed";
    discountValue: string; minOrderAmount: string; maxUses: string; expiresAt: string;
}

const EMPTY_FORM: CouponForm = { code: "", description: "", discountType: "Percentage", discountValue: "", minOrderAmount: "0", maxUses: "", expiresAt: "" };

export default function AdminCouponsPage() {
    const qc = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<CouponForm>(EMPTY_FORM);
    const [error, setError] = useState("");

    const { data: coupons, isPending } = useQuery<Coupon[]>({
        queryKey: ["admin", "coupons"],
        queryFn: async () => { const res = await api.get<Coupon[]>("/admin/coupons"); return res.data; },
    });

    const { mutate: create, isPending: creating } = useMutation({
        mutationFn: async (payload: object) => { await api.post("/admin/coupons", payload); },
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "coupons"] }); setForm(EMPTY_FORM); setShowForm(false); },
        onError: (e: Error) => setError(e.message),
    });

    const { mutate: toggle } = useMutation({
        mutationFn: async ({ id, active }: { id: string; active: boolean }) => { await api.patch(`/admin/coupons/${id}`, { isActive: active }); },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "coupons"] }),
    });

    const { mutate: remove } = useMutation({
        mutationFn: async (id: string) => { await api.delete(`/admin/coupons/${id}`); },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "coupons"] }),
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.code || !form.discountValue) { setError("Code and discount value are required."); return; }
        create({
            code: form.code.toUpperCase(),
            description: form.description,
            discountType: form.discountType,
            discountValue: parseFloat(form.discountValue),
            minOrderAmount: parseFloat(form.minOrderAmount) || 0,
            maxUses: form.maxUses ? parseInt(form.maxUses) : null,
            expiresAt: form.expiresAt || null,
        });
    }

    return (
        <div className="px-4 md:px-8 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="font-cormorant text-3xl font-semibold" style={{ color: "var(--dark)" }}>Coupons</h1>
                <button onClick={() => { setShowForm((s) => !s); setError(""); }} className="px-4 py-2 rounded-xl text-white text-sm font-medium flex items-center gap-2" style={{ background: "var(--dark)" }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    Create Coupon
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="rounded-2xl p-6 mb-6 space-y-4" style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(200,192,185,0.3)" }}>
                    <h2 className="font-semibold text-sm" style={{ color: "var(--dark)" }}>New Coupon</h2>
                    {error && <p className="text-xs text-red-500">{error}</p>}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs mb-1" style={{ color: "var(--muted)" }}>Code *</label>
                            <input className="w-full px-3 py-2 rounded-xl text-sm outline-none uppercase" style={{ background: "rgba(247,243,238,0.8)", border: "1px solid rgba(200,192,185,0.4)", color: "var(--dark)" }} value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="SUMMER20" />
                        </div>
                        <div>
                            <label className="block text-xs mb-1" style={{ color: "var(--muted)" }}>Description</label>
                            <input className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: "rgba(247,243,238,0.8)", border: "1px solid rgba(200,192,185,0.4)", color: "var(--dark)" }} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                        </div>
                        <div>
                            <label className="block text-xs mb-1" style={{ color: "var(--muted)" }}>Discount Type</label>
                            <select className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: "rgba(247,243,238,0.8)", border: "1px solid rgba(200,192,185,0.4)", color: "var(--dark)" }} value={form.discountType} onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value as "Percentage" | "Fixed" }))}>
                                <option value="Percentage">Percentage (%)</option>
                                <option value="Fixed">Fixed ($)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs mb-1" style={{ color: "var(--muted)" }}>Discount Value *</label>
                            <input type="number" min="0" step="0.01" className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: "rgba(247,243,238,0.8)", border: "1px solid rgba(200,192,185,0.4)", color: "var(--dark)" }} value={form.discountValue} onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))} />
                        </div>
                        <div>
                            <label className="block text-xs mb-1" style={{ color: "var(--muted)" }}>Min. Order Amount</label>
                            <input type="number" min="0" step="0.01" className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: "rgba(247,243,238,0.8)", border: "1px solid rgba(200,192,185,0.4)", color: "var(--dark)" }} value={form.minOrderAmount} onChange={(e) => setForm((f) => ({ ...f, minOrderAmount: e.target.value }))} />
                        </div>
                        <div>
                            <label className="block text-xs mb-1" style={{ color: "var(--muted)" }}>Max Uses (blank = unlimited)</label>
                            <input type="number" min="1" className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: "rgba(247,243,238,0.8)", border: "1px solid rgba(200,192,185,0.4)", color: "var(--dark)" }} value={form.maxUses} onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))} />
                        </div>
                        <div>
                            <label className="block text-xs mb-1" style={{ color: "var(--muted)" }}>Expires At</label>
                            <input type="date" className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: "rgba(247,243,238,0.8)", border: "1px solid rgba(200,192,185,0.4)", color: "var(--dark)" }} value={form.expiresAt} onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))} />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm" style={{ background: "rgba(200,192,185,0.25)", color: "var(--dark)" }}>Cancel</button>
                        <button type="submit" disabled={creating} className="px-4 py-2 rounded-xl text-sm text-white disabled:opacity-60" style={{ background: "var(--dark)" }}>{creating ? "Creating…" : "Create"}</button>
                    </div>
                </form>
            )}

            <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(200,192,185,0.3)" }}>
                <table className="w-full text-sm">
                    <thead>
                        <tr style={{ borderBottom: "1px solid rgba(200,192,185,0.3)" }}>
                            {["Code", "Type", "Value", "Min. Order", "Uses", "Expires", "Active", ""].map((h) => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: "var(--muted)" }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {isPending
                            ? Array.from({ length: 5 }).map((_, i) => <tr key={i}>{Array.from({ length: 8 }).map((__, j) => <td key={j} className="px-4 py-3"><div className="h-4 rounded animate-pulse" style={{ background: "rgba(200,192,185,0.3)" }} /></td>)}</tr>)
                            : coupons?.map((c) => (
                                <tr key={c.id} className="hover:bg-white/40 transition-all" style={{ borderBottom: "1px solid rgba(200,192,185,0.15)" }}>
                                    <td className="px-4 py-3 font-mono font-semibold text-xs" style={{ color: "var(--dark)" }}>{c.code}</td>
                                    <td className="px-4 py-3 text-xs" style={{ color: "var(--muted)" }}>{c.discountType}</td>
                                    <td className="px-4 py-3 font-medium" style={{ color: "var(--dark)" }}>{c.discountType === "Percentage" ? `${c.discountValue}%` : `$${c.discountValue.toFixed(2)}`}</td>
                                    <td className="px-4 py-3 text-xs" style={{ color: "var(--muted)" }}>${c.minOrderAmount.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-xs" style={{ color: "var(--muted)" }}>{c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ""}</td>
                                    <td className="px-4 py-3 text-xs" style={{ color: c.expiresAt && new Date(c.expiresAt) < new Date() ? "red" : "var(--muted)" }}>
                                        {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "—"}
                                    </td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => toggle({ id: c.id, active: !c.isActive })} className="w-9 h-5 rounded-full relative transition-all" style={{ background: c.isActive ? "var(--accent)" : "rgba(200,192,185,0.5)" }}>
                                            <div className="w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all" style={{ left: c.isActive ? "calc(100% - 18px)" : "2px" }} />
                                        </button>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => { if (confirm("Delete this coupon?")) remove(c.id); }} className="text-xs font-medium text-red-400 hover:text-red-600">Delete</button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
