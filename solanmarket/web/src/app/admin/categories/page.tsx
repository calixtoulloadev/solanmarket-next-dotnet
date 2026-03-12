"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface Category { id: string; name: string; slug: string; description: string; productCount: number; }

export default function AdminCategoriesPage() {
    const qc = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState({ name: "", slug: "", description: "" });
    const [error, setError] = useState("");

    const { data: categories, isPending } = useQuery<Category[]>({
        queryKey: ["admin", "categories"],
        queryFn: async () => { const res = await api.get<Category[]>("/categories"); return res.data; },
    });

    const { mutate: save, isPending: saving } = useMutation({
        mutationFn: async (payload: object) => {
            if (editId) await api.put(`/admin/categories/${editId}`, payload);
            else await api.post("/admin/categories", payload);
        },
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "categories"] }); resetForm(); },
        onError: (e: Error) => setError(e.message),
    });

    const { mutate: remove } = useMutation({
        mutationFn: async (id: string) => { await api.delete(`/admin/categories/${id}`); },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "categories"] }),
    });

    function toSlug(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

    function startEdit(cat: Category) {
        setEditId(cat.id);
        setForm({ name: cat.name, slug: cat.slug, description: cat.description });
        setShowForm(true);
    }

    function resetForm() { setShowForm(false); setEditId(null); setForm({ name: "", slug: "", description: "" }); setError(""); }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.name) { setError("Name is required."); return; }
        save({ name: form.name, slug: form.slug || toSlug(form.name), description: form.description });
    }

    return (
        <div className="px-4 md:px-8 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="font-cormorant text-3xl font-semibold" style={{ color: "var(--dark)" }}>Categories</h1>
                <button onClick={() => { resetForm(); setShowForm(true); }} className="px-4 py-2 rounded-xl text-white text-sm font-medium flex items-center gap-2" style={{ background: "var(--dark)" }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    Add Category
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="rounded-2xl p-6 mb-6 space-y-4" style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(200,192,185,0.3)" }}>
                    <h2 className="font-semibold text-sm" style={{ color: "var(--dark)" }}>{editId ? "Edit Category" : "New Category"}</h2>
                    {error && <p className="text-xs text-red-500">{error}</p>}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs mb-1" style={{ color: "var(--muted)" }}>Name *</label>
                            <input className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: "rgba(247,243,238,0.8)", border: "1px solid rgba(200,192,185,0.4)", color: "var(--dark)" }} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: toSlug(e.target.value) }))} />
                        </div>
                        <div>
                            <label className="block text-xs mb-1" style={{ color: "var(--muted)" }}>Slug</label>
                            <input className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: "rgba(247,243,238,0.8)", border: "1px solid rgba(200,192,185,0.4)", color: "var(--dark)" }} value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs mb-1" style={{ color: "var(--muted)" }}>Description</label>
                        <input className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: "rgba(247,243,238,0.8)", border: "1px solid rgba(200,192,185,0.4)", color: "var(--dark)" }} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                    </div>
                    <div className="flex gap-3">
                        <button type="button" onClick={resetForm} className="px-4 py-2 rounded-xl text-sm" style={{ background: "rgba(200,192,185,0.25)", color: "var(--dark)" }}>Cancel</button>
                        <button type="submit" disabled={saving} className="px-4 py-2 rounded-xl text-sm text-white disabled:opacity-60" style={{ background: "var(--dark)" }}>{saving ? "Saving…" : editId ? "Save" : "Create"}</button>
                    </div>
                </form>
            )}

            <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(200,192,185,0.3)" }}>
                <table className="w-full text-sm">
                    <thead>
                        <tr style={{ borderBottom: "1px solid rgba(200,192,185,0.3)" }}>
                            {["Name", "Slug", "Description", "Products", ""].map((h) => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: "var(--muted)" }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {isPending
                            ? Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}>{Array.from({ length: 5 }).map((__, j) => <td key={j} className="px-4 py-3"><div className="h-4 rounded animate-pulse" style={{ background: "rgba(200,192,185,0.3)" }} /></td>)}</tr>
                            ))
                            : categories?.map((cat) => (
                                <tr key={cat.id} className="hover:bg-white/40 transition-all" style={{ borderBottom: "1px solid rgba(200,192,185,0.15)" }}>
                                    <td className="px-4 py-3 font-medium" style={{ color: "var(--dark)" }}>{cat.name}</td>
                                    <td className="px-4 py-3 text-xs" style={{ color: "var(--muted)" }}>{cat.slug}</td>
                                    <td className="px-4 py-3 text-xs max-w-xs truncate" style={{ color: "var(--muted)" }}>{cat.description}</td>
                                    <td className="px-4 py-3 text-xs" style={{ color: "var(--muted)" }}>{cat.productCount ?? 0}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => startEdit(cat)} className="text-xs font-medium" style={{ color: "var(--accent)" }}>Edit</button>
                                            <button onClick={() => { if (confirm("Delete this category?")) remove(cat.id); }} className="text-xs font-medium text-red-400 hover:text-red-600">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
