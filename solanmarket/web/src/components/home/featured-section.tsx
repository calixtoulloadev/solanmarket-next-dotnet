"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ProductListItem } from "@/types";
import ProductCard from "@/components/products/product-card";

export default function FeaturedSection() {
    const { data, isPending } = useQuery({
        queryKey: ["products", "featured"],
        queryFn: async () => {
            const res = await api.get<{ items: ProductListItem[] }>("/products", {
                params: { pageSize: 8, sortBy: "rating" },
            });
            return res.data.items;
        },
    });

    if (isPending) {
        return (
            <div className="flex gap-4 overflow-x-auto pb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="shrink-0 w-52 h-72 rounded-2xl animate-pulse" style={{ background: "rgba(200,192,185,0.3)" }} />
                ))}
            </div>
        );
    }

    return (
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
            {(data ?? []).map((product) => (
                <div key={product.id} className="shrink-0 w-52">
                    <ProductCard product={product} />
                </div>
            ))}
        </div>
    );
}
