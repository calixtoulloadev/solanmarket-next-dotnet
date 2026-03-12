"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ProductListItem } from "@/types";
import ProductCard from "@/components/products/product-card";

interface PagedResult<T> {
    items: T[];
    totalCount: number;
    pageIndex: number;
    pageSize: number;
    totalPages: number;
}

const SORT_OPTIONS = [
    { label: "Newest", value: "newest" },
    { label: "Price: Low", value: "price_asc" },
    { label: "Price: High", value: "price_desc" },
    { label: "Top Rated", value: "rating" },
];

const CATEGORIES = [
    { label: "All", value: "" },
    { label: "Vegetables", value: "vegetables" },
    { label: "Fruits", value: "fruits" },
    { label: "Dairy", value: "dairy" },
    { label: "Bakery", value: "bakery" },
    { label: "Meats", value: "meats" },
    { label: "Beverages", value: "beverages" },
    { label: "Snacks", value: "snacks" },
];

function ExploreContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [search, setSearch] = useState(searchParams.get("q") ?? "");
    const [category, setCategory] = useState(searchParams.get("category") ?? "");
    const [sort, setSort] = useState(searchParams.get("sort") ?? "newest");
    const [page, setPage] = useState(1);
    const [allProducts, setAllProducts] = useState<ProductListItem[]>([]);
    const loaderRef = useRef<HTMLDivElement | null>(null);

    const params = {
        pageIndex: page,
        pageSize: 16,
        search: search || undefined,
        category: category || undefined,
        sortBy: sort,
    };

    const { data, isFetching } = useQuery({
        queryKey: ["products", "explore", params],
        queryFn: async () => {
            const res = await api.get<PagedResult<ProductListItem>>("/products", { params });
            return res.data;
        },
    });

    // Reset on filter changes
    useEffect(() => {
        setPage(1);
        setAllProducts([]);
    }, [search, category, sort]);

    // Accumulate pages
    useEffect(() => {
        if (data?.items) {
            if (page === 1) {
                setAllProducts(data.items);
            } else {
                setAllProducts((prev) => [...prev, ...data.items]);
            }
        }
    }, [data, page]);

    // Infinite scroll
    const handleObserver = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const [entry] = entries;
            if (entry.isIntersecting && !isFetching && data && page < data.totalPages) {
                setPage((p) => p + 1);
            }
        },
        [isFetching, data, page],
    );

    useEffect(() => {
        const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
        const el = loaderRef.current;
        if (el) observer.observe(el);
        return () => { if (el) observer.unobserve(el); };
    }, [handleObserver]);

    return (
        <div className="px-4 md:px-6 py-6">
            {/* Search + Sort */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div
                    className="flex items-center gap-2 flex-1 px-3 py-2.5 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(200,192,185,0.5)" }}
                >
                    <svg className="w-4 h-4 shrink-0" style={{ color: "var(--muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        className="flex-1 bg-transparent text-sm outline-none"
                        style={{ color: "var(--dark)" }}
                        placeholder="Search products, brands…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button onClick={() => setSearch("")} className="opacity-50 hover:opacity-80">
                            <svg className="w-3.5 h-3.5" style={{ color: "var(--dark)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{
                        background: "rgba(255,255,255,0.7)",
                        border: "1px solid rgba(200,192,185,0.5)",
                        color: "var(--dark)",
                    }}
                >
                    {SORT_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
            </div>

            {/* Category chips */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-5 -mx-1 px-1">
                {CATEGORIES.map((c) => (
                    <button
                        key={c.value}
                        onClick={() => setCategory(c.value)}
                        className="shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all"
                        style={{
                            background: category === c.value ? "var(--dark)" : "rgba(255,255,255,0.7)",
                            color: category === c.value ? "white" : "var(--dark)",
                            border: "1px solid",
                            borderColor: category === c.value ? "var(--dark)" : "rgba(200,192,185,0.5)",
                        }}
                    >
                        {c.label}
                    </button>
                ))}
            </div>

            {/* Result count */}
            {data && (
                <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>
                    {data.totalCount} product{data.totalCount !== 1 ? "s" : ""} found
                </p>
            )}

            {/* Grid */}
            {allProducts.length === 0 && !isFetching ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
                    <svg className="w-12 h-12 opacity-20" style={{ color: "var(--muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p style={{ color: "var(--muted)" }}>No products found</p>
                    <button onClick={() => { setSearch(""); setCategory(""); }} className="text-sm font-medium" style={{ color: "var(--accent)" }}>
                        Clear filters
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {allProducts.map((p) => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                    {/* Skeleton for loading next page */}
                    {isFetching && page > 1 && Array.from({ length: 4 }).map((_, i) => (
                        <div key={`sk-${i}`} className="h-72 rounded-2xl animate-pulse" style={{ background: "rgba(200,192,185,0.3)" }} />
                    ))}
                </div>
            )}

            {/* Initial loading skeleton */}
            {isFetching && page === 1 && (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-72 rounded-2xl animate-pulse" style={{ background: "rgba(200,192,185,0.3)" }} />
                    ))}
                </div>
            )}

            {/* Infinite scroll trigger */}
            <div ref={loaderRef} className="h-10" />
        </div>
    );
}

export default function ExplorePage() {
    return (
        <Suspense fallback={<div className="px-6 py-6"><div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{Array.from({ length: 8 }).map((_, i) => (<div key={i} className="h-72 rounded-2xl animate-pulse" style={{ background: "rgba(200,192,185,0.3)" }} />))}</div></div>}>
            <ExploreContent />
        </Suspense>
    );
}
