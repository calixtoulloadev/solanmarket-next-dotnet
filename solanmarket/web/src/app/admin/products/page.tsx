"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import { ProductListItem } from "@/types";

interface PagedResult<T> { items: T[]; totalCount: number; totalPages: number; pageIndex: number; }

export default function AdminProductsPage() {
    const qc = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");

    const { data, isPending } = useQuery({
        queryKey: ["admin", "products", page, search],
        queryFn: async () => {
            const res = await api.get<PagedResult<ProductListItem>>("/products", {
                params: { pageIndex: page, pageSize: 20, search: search || undefined, includeAll: true },
            });
            return res.data;
        },
    });

    const { mutate: deleteProduct } = useMutation({
        mutationFn: async (id: string) => { await api.delete(`/admin/products/${id}`); },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "products"] }),
    });

    return (
        <div className="px-4 md:px-8 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="font-cormorant text-3xl font-semibold" style={{ color: "var(--dark)" }}>Products</h1>
                <Link
                    href="/admin/products/new"
                    className="px-4 py-2 rounded-xl text-white text-sm font-medium flex items-center gap-2"
                    style={{ background: "var(--dark)" }}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    Add Product
                </Link>
            </div>

            {/* Search */}
            <div
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl mb-6 max-w-sm"
                style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(200,192,185,0.5)" }}
            >
                <svg className="w-4 h-4 shrink-0" style={{ color: "var(--muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input
                    className="flex-1 bg-transparent text-sm outline-none"
                    style={{ color: "var(--dark)" }}
                    placeholder="Search products…"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(200,192,185,0.3)" }}>
                <table className="w-full text-sm">
                    <thead>
                        <tr style={{ borderBottom: "1px solid rgba(200,192,185,0.3)" }}>
                            {["Product", "Category", "Price", "Stock", "Status", ""].map((h) => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: "var(--muted)" }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {isPending
                            ? Array.from({ length: 8 }).map((_, i) => (
                                <tr key={i}>
                                    {Array.from({ length: 6 }).map((__, j) => (
                                        <td key={j} className="px-4 py-3"><div className="h-4 rounded animate-pulse" style={{ background: "rgba(200,192,185,0.3)" }} /></td>
                                    ))}
                                </tr>
                            ))
                            : data?.items.map((product) => (
                                <tr key={product.id} className="hover:bg-white/40 transition-all" style={{ borderBottom: "1px solid rgba(200,192,185,0.15)" }}>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg shrink-0 overflow-hidden" style={{ background: "var(--blush)" }}>
                                                {product.mainImageUrl && <Image src={product.mainImageUrl} alt="" width={36} height={36} className="w-full h-full object-cover" />}
                                            </div>
                                            <span className="font-medium truncate max-w-40" style={{ color: "var(--dark)" }}>{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-xs" style={{ color: "var(--muted)" }}>{product.categoryName}</td>
                                    <td className="px-4 py-3 font-medium" style={{ color: "var(--dark)" }}>${product.price.toFixed(2)}</td>
                                    <td className="px-4 py-3">
                                        <span style={{ color: product.totalStock === 0 ? "red" : product.totalStock < 5 ? "orange" : "var(--dark)" }}>
                                            {product.totalStock}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: product.isPublished ? "var(--sage)" : "rgba(200,192,185,0.3)", color: "var(--dark)" }}>
                                            {product.isPublished ? "Published" : "Draft"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Link href={`/admin/products/${product.id}/edit`} className="text-xs font-medium" style={{ color: "var(--accent)" }}>Edit</Link>
                                            <button onClick={() => { if (confirm("Delete this product?")) deleteProduct(product.id); }} className="text-xs font-medium text-red-400 hover:text-red-600">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>

                {/* Pagination */}
                {data && data.totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: "rgba(200,192,185,0.3)" }}>
                        <p className="text-xs" style={{ color: "var(--muted)" }}>{data.totalCount} products</p>
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

