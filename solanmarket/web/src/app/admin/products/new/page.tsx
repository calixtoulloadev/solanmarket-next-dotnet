"use client";

import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { api } from "@/lib/api";

interface CategoryOption { id: string; name: string; }

interface SizeEntry { size: string; sku: string; stock: number; additionalPrice: number; }
interface ColorGroup { colorHex: string; colorName: string; sizes: SizeEntry[]; images: File[]; previews: string[]; }

interface ProductFormData {
    name: string; slug: string; description: string; brand: string;
    price: string; originalPrice: string; categoryId: string;
    tags: string; isPublished: boolean;
}

const EMPTY_SIZE: SizeEntry = { size: "", sku: "", stock: 0, additionalPrice: 0 };
const EMPTY_COLOR: ColorGroup = { colorHex: "#000000", colorName: "", sizes: [{ ...EMPTY_SIZE }], images: [], previews: [] };

const EMPTY_FORM: ProductFormData = {
    name: "", slug: "", description: "", brand: "", price: "",
    originalPrice: "", categoryId: "", tags: "", isPublished: false,
};

function toSlug(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

export default function NewProductPage() {
    const router = useRouter();
    const qc = useQueryClient();
    const [form, setForm] = useState<ProductFormData>(EMPTY_FORM);
    const [colorGroups, setColorGroups] = useState<ColorGroup[]>([]);
    const [error, setError] = useState("");
    const [pendingImages, setPendingImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const colorFileRefs = useRef<(HTMLInputElement | null)[]>([]);

    const { data: categories } = useQuery<CategoryOption[]>({
        queryKey: ["categories", "all"],
        queryFn: async () => { const res = await api.get<CategoryOption[]>("/categories"); return res.data; },
    });

    async function uploadImages(id: string, files: File[], colorHex?: string) {
        const formData = new FormData();
        files.forEach((f) => formData.append("files", f));
        const url = colorHex
            ? `/admin/products/${id}/images?colorHex=${encodeURIComponent(colorHex)}`
            : `/admin/products/${id}/images`;
        await api.post(url, formData, { headers: { "Content-Type": "multipart/form-data" } });
    }

    const { mutate: create, isPending } = useMutation({
        mutationFn: async (payload: object) => {
            const res = await api.post<{ id: string }>("/admin/products", payload);
            return res.data;
        },
        onSuccess: async (data) => {
            const uploads: Promise<void>[] = [];
            if (pendingImages.length > 0)
                uploads.push(uploadImages(data.id, pendingImages));
            colorGroups.forEach((cg) => {
                if (cg.images.length > 0)
                    uploads.push(uploadImages(data.id, cg.images, cg.colorHex));
            });
            await Promise.allSettled(uploads);
            qc.invalidateQueries({ queryKey: ["admin", "products"] });
            router.push("/admin/products");
        },
        onError: (e: Error) => setError(e.message),
    });

    function handleFiles(files: FileList | null) {
        if (!files) return;
        const newFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
        setPendingImages((prev) => [...prev, ...newFiles]);
        newFiles.forEach((f) => {
            const reader = new FileReader();
            reader.onload = (e) => setImagePreviews((prev) => [...prev, e.target?.result as string]);
            reader.readAsDataURL(f);
        });
    }

    function removeImage(index: number) {
        setPendingImages((prev) => prev.filter((_, i) => i !== index));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    }

    function handleColorFiles(colorIdx: number, files: FileList | null) {
        if (!files) return;
        const newFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
        if (newFiles.length === 0) return;
        // Pure state update — add File objects only, no side effects
        setColorGroups((prev) => {
            const updated = [...prev];
            updated[colorIdx] = { ...updated[colorIdx], images: [...updated[colorIdx].images, ...newFiles] };
            return updated;
        });
        // Read previews OUTSIDE the state updater to avoid double-invocation in StrictMode
        newFiles.forEach((f) => {
            const reader = new FileReader();
            reader.onload = (e) => setColorGroups((p) => {
                const u = [...p];
                u[colorIdx] = { ...u[colorIdx], previews: [...u[colorIdx].previews, e.target?.result as string] };
                return u;
            });
            reader.readAsDataURL(f);
        });
    }

    function removeColorImage(colorIdx: number, imgIdx: number) {
        setColorGroups((prev) => {
            const updated = [...prev];
            updated[colorIdx] = {
                ...updated[colorIdx],
                images: updated[colorIdx].images.filter((_, i) => i !== imgIdx),
                previews: updated[colorIdx].previews.filter((_, i) => i !== imgIdx),
            };
            return updated;
        });
    }

    function addColor() {
        setColorGroups((prev) => [...prev, { ...EMPTY_COLOR, sizes: [{ ...EMPTY_SIZE }], images: [], previews: [] }]);
    }

    function removeColor(colorIdx: number) {
        setColorGroups((prev) => prev.filter((_, i) => i !== colorIdx));
    }

    function updateColor(colorIdx: number, field: "colorHex" | "colorName", value: string) {
        setColorGroups((prev) => {
            const updated = [...prev];
            updated[colorIdx] = { ...updated[colorIdx], [field]: value };
            return updated;
        });
    }

    function addSize(colorIdx: number) {
        setColorGroups((prev) => {
            const updated = [...prev];
            updated[colorIdx] = { ...updated[colorIdx], sizes: [...updated[colorIdx].sizes, { ...EMPTY_SIZE }] };
            return updated;
        });
    }

    function removeSize(colorIdx: number, sizeIdx: number) {
        setColorGroups((prev) => {
            const updated = [...prev];
            updated[colorIdx] = { ...updated[colorIdx], sizes: updated[colorIdx].sizes.filter((_, i) => i !== sizeIdx) };
            return updated;
        });
    }

    function updateSize(colorIdx: number, sizeIdx: number, field: keyof SizeEntry, value: string | number) {
        setColorGroups((prev) => {
            const updated = [...prev];
            const sizes = [...updated[colorIdx].sizes];
            sizes[sizeIdx] = { ...sizes[sizeIdx], [field]: value };
            updated[colorIdx] = { ...updated[colorIdx], sizes };
            return updated;
        });
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        if (!form.name || !form.price || !form.categoryId) { setError("Name, price, and category are required."); return; }

        const slug = form.slug || toSlug(form.name);
        // Flatten color groups into variants array
        const variants = colorGroups.flatMap((cg) =>
            cg.sizes.map((s) => ({
                colorHex: cg.colorHex,
                colorName: cg.colorName,
                size: s.size,
                sku: s.sku,
                stock: s.stock,
                additionalPrice: s.additionalPrice,
            }))
        );

        create({
            name: form.name,
            slug,
            description: form.description,
            brand: form.brand,
            price: parseFloat(form.price),
            originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
            categoryId: form.categoryId,
            tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
            isPublished: form.isPublished,
            variants,
        });
    }

    const inputCls = "w-full px-3 py-2 rounded-xl text-sm outline-none";
    const inputStyle = { background: "rgba(247,243,238,0.8)", border: "1px solid rgba(200,192,185,0.4)", color: "var(--dark)" };

    return (
        <div className="px-4 md:px-8 py-8 max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => router.back()} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/50">
                    <svg className="w-4 h-4" style={{ color: "var(--muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h1 className="font-cormorant text-3xl font-semibold" style={{ color: "var(--dark)" }}>New Product</h1>
            </div>

            {error && <div className="mb-4 px-4 py-3 rounded-xl text-sm text-red-700 bg-red-50 border border-red-200">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="rounded-2xl p-6 space-y-4" style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(200,192,185,0.3)" }}>
                    <h2 className="font-semibold text-sm" style={{ color: "var(--dark)" }}>Basic Information</h2>
                    {[["name", "Name *"], ["slug", "Slug (auto-generated)"], ["brand", "Brand"]].map(([field, label]) => (
                        <div key={field}>
                            <label className="block text-xs mb-1" style={{ color: "var(--muted)" }}>{label}</label>
                            <input
                                className={inputCls} style={inputStyle}
                                value={form[field as keyof ProductFormData] as string}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setForm((f) => field === "name" ? { ...f, name: val, slug: toSlug(val) } : { ...f, [field]: val });
                                }}
                            />
                        </div>
                    ))}
                    <div>
                        <label className="block text-xs mb-1" style={{ color: "var(--muted)" }}>Description</label>
                        <textarea rows={4} className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none" style={inputStyle} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                    </div>
                    <div>
                        <label className="block text-xs mb-1" style={{ color: "var(--muted)" }}>Category *</label>
                        <select className={inputCls} style={inputStyle} value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}>
                            <option value="">Select category</option>
                            {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {[["price", "Price *"], ["originalPrice", "Original Price"]].map(([field, label]) => (
                            <div key={field}>
                                <label className="block text-xs mb-1" style={{ color: "var(--muted)" }}>{label}</label>
                                <input type="number" step="0.01" min="0" className={inputCls} style={inputStyle} value={form[field as keyof ProductFormData] as string} onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))} />
                            </div>
                        ))}
                    </div>
                    <div>
                        <label className="block text-xs mb-1" style={{ color: "var(--muted)" }}>Tags (comma-separated)</label>
                        <input className={inputCls} style={inputStyle} value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} placeholder="luxury, skincare, bestseller" />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))} className="rounded" />
                        <span className="text-sm" style={{ color: "var(--dark)" }}>Published</span>
                    </label>
                </div>

                {/* General Product Images (shared across all colors) */}
                <div className="rounded-2xl p-6 space-y-4" style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(200,192,185,0.3)" }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="font-semibold text-sm" style={{ color: "var(--dark)" }}>General Images</h2>
                            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Shared across all colors. First image becomes main.</p>
                        </div>
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs px-3 py-1 rounded-lg" style={{ background: "var(--blush)", color: "var(--dark)" }}>+ Add Images</button>
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />

                    {imagePreviews.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                            {imagePreviews.map((src, i) => (
                                <div key={i} className="relative group w-20 h-20 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(200,192,185,0.4)" }}>
                                    <Image src={src} alt="" fill className="object-cover" />
                                    {i === 0 && <span className="absolute top-1 left-1 text-[9px] px-1.5 py-0.5 rounded-full text-white" style={{ background: "var(--accent)" }}>Main</span>}
                                    <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer" style={{ borderColor: "rgba(200,192,185,0.5)" }} onClick={() => fileInputRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}>
                            <p className="text-sm" style={{ color: "var(--muted)" }}>Drag & drop or click to select general images</p>
                        </div>
                    )}
                </div>

                {/* Colors & Variants */}
                <div className="rounded-2xl p-6 space-y-5" style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(200,192,185,0.3)" }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="font-semibold text-sm" style={{ color: "var(--dark)" }}>Colors & Variants</h2>
                            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Add colors, then define sizes and stock for each. Leave SKU blank to auto-generate.</p>
                        </div>
                        <button type="button" onClick={addColor} className="text-xs px-3 py-1 rounded-lg" style={{ background: "var(--blush)", color: "var(--dark)" }}>+ Add Color</button>
                    </div>

                    {colorGroups.length === 0 && (
                        <p className="text-xs text-center py-4" style={{ color: "var(--muted)" }}>No variants yet. Click &quot;+ Add Color&quot; to get started, or leave empty for a product with no variants.</p>
                    )}

                    {colorGroups.map((cg, ci) => (
                        <div key={ci} className="rounded-xl p-4 space-y-4" style={{ background: "rgba(247,243,238,0.6)", border: "1px solid rgba(200,192,185,0.35)" }}>
                            {/* Color header */}
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-8 h-8 rounded-full border-2 cursor-pointer" style={{ background: cg.colorHex, borderColor: "rgba(200,192,185,0.6)" }} onClick={() => document.getElementById(`colorpicker-${ci}`)?.click()} />
                                    <input id={`colorpicker-${ci}`} type="color" className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" value={cg.colorHex} onChange={(e) => updateColor(ci, "colorHex", e.target.value)} />
                                </div>
                                <input className="flex-1 px-2 py-1 rounded-lg text-sm outline-none" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(200,192,185,0.4)", color: "var(--dark)" }} placeholder="Color name (e.g. Midnight Black)" value={cg.colorName} onChange={(e) => updateColor(ci, "colorName", e.target.value)} />
                                <span className="text-xs font-mono" style={{ color: "var(--muted)" }}>{cg.colorHex}</span>
                                <button type="button" onClick={() => removeColor(ci)} className="text-red-400 hover:text-red-600 text-xs ml-auto">Remove</button>
                            </div>

                            {/* Per-color images */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Images for this color</label>
                                    <button type="button" onClick={() => colorFileRefs.current[ci]?.click()} className="text-xs px-2 py-0.5 rounded" style={{ background: "var(--blush)", color: "var(--dark)" }}>+ Photos</button>
                                </div>
                                <input ref={(el) => { colorFileRefs.current[ci] = el; }} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { handleColorFiles(ci, e.target.files); e.target.value = ""; }} />
                                {cg.previews.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {cg.previews.map((src, pi) => (
                                            <div key={pi} className="relative group w-16 h-16 rounded-lg overflow-hidden" style={{ border: "1px solid rgba(200,192,185,0.4)" }}>
                                                <Image src={src} alt="" fill className="object-cover" />
                                                <button type="button" onClick={() => removeColorImage(ci, pi)} className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 text-white text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="border border-dashed rounded-lg p-3 text-center cursor-pointer" style={{ borderColor: "rgba(200,192,185,0.5)" }} onClick={() => colorFileRefs.current[ci]?.click()}>
                                        <p className="text-xs" style={{ color: "var(--muted)" }}>Click to add images for this color</p>
                                    </div>
                                )}
                            </div>

                            {/* Sizes table */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Sizes / Units</label>
                                    <button type="button" onClick={() => addSize(ci)} className="text-xs px-2 py-0.5 rounded" style={{ background: "var(--blush)", color: "var(--dark)" }}>+ Size</button>
                                </div>
                                <div className="space-y-2">
                                    <div className="grid grid-cols-4 gap-2">
                                        {["Size", "SKU (auto)", "Stock", "Price Mod."].map((h) => (
                                            <span key={h} className="text-[10px]" style={{ color: "var(--muted)" }}>{h}</span>
                                        ))}
                                    </div>
                                    {cg.sizes.map((s, si) => (
                                        <div key={si} className="grid grid-cols-4 gap-2 items-center">
                                            <input className="px-2 py-1 rounded-lg text-xs outline-none" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(200,192,185,0.4)", color: "var(--dark)" }} placeholder="S, M, L…" value={s.size} onChange={(e) => updateSize(ci, si, "size", e.target.value)} />
                                            <input className="px-2 py-1 rounded-lg text-xs outline-none" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(200,192,185,0.4)", color: "var(--dark)" }} placeholder="auto" value={s.sku} onChange={(e) => updateSize(ci, si, "sku", e.target.value)} />
                                            <input type="number" min="0" className="px-2 py-1 rounded-lg text-xs outline-none" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(200,192,185,0.4)", color: "var(--dark)" }} value={s.stock} onChange={(e) => updateSize(ci, si, "stock", parseInt(e.target.value) || 0)} />
                                            <div className="flex items-center gap-1">
                                                <input type="number" step="0.01" className="flex-1 px-2 py-1 rounded-lg text-xs outline-none" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(200,192,185,0.4)", color: "var(--dark)" }} value={s.additionalPrice} onChange={(e) => updateSize(ci, si, "additionalPrice", parseFloat(e.target.value) || 0)} />
                                                {cg.sizes.length > 1 && (
                                                    <button type="button" onClick={() => removeSize(ci, si)} className="text-red-400 hover:text-red-600 text-[10px] shrink-0">✕</button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex gap-3">
                    <button type="button" onClick={() => router.back()} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ background: "rgba(200,192,185,0.25)", color: "var(--dark)" }}>Cancel</button>
                    <button type="submit" disabled={isPending} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-60" style={{ background: "var(--dark)" }}>
                        {isPending ? "Creating…" : "Create Product"}
                    </button>
                </div>
            </form>
        </div>
    );
}
