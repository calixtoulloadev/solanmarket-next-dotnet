"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ProductListItem } from "@/types";
import ProductCard from "@/components/products/product-card";

export default function NewArrivals() {
    const { data, isPending } = useQuery({
        queryKey: ["products", "new-arrivals"],
        queryFn: async () => {
            const res = await api.get<{ items: ProductListItem[] }>("/products", {
                params: { pageSize: 8, sortBy: "newest" },
            });
            return res.data.items;
        },
    });

    if (isPending) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-72 rounded-2xl animate-pulse" style={{ background: "rgba(200,192,185,0.3)" }} />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(data ?? []).map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}
