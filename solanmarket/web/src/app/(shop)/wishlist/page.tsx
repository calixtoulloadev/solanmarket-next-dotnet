"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import { ProductListItem } from "@/types";
import { useCartStore } from "@/store/cartStore";

export default function WishlistPage() {
    const addItem = useCartStore((s) => s.addItem);

    const { data: items, isPending } = useQuery({
        queryKey: ["wishlist"],
        queryFn: async () => {
            const res = await api.get<ProductListItem[]>("/wishlist");
            return res.data;
        },
    });

    return (
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
            <h1 className="font-cormorant text-3xl font-semibold mb-6" style={{ color: "var(--dark)" }}>
                Wishlist
            </h1>

            {isPending ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-72 rounded-2xl animate-pulse" style={{ background: "rgba(200,192,185,0.3)" }} />
                    ))}
                </div>
            ) : !items?.length ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                    <svg className="w-12 h-12 opacity-20" style={{ color: "var(--muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <p style={{ color: "var(--muted)" }}>Your wishlist is empty</p>
                    <Link href="/explore" className="px-6 py-2.5 rounded-full text-white text-sm font-medium" style={{ background: "var(--accent)" }}>
                        Discover Products
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {items.map((product) => (
                        <div
                            key={product.id}
                            className="rounded-2xl overflow-hidden"
                            style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(200,192,185,0.3)" }}
                        >
                            <Link href={`/products/${product.slug}`}>
                                <div className="relative overflow-hidden" style={{ aspectRatio: "4/3", background: "var(--blush)" }}>
                                    {product.mainImageUrl && (
                                        <Image src={product.mainImageUrl} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 50vw, 33vw" />
                                    )}
                                </div>
                            </Link>
                            <div className="p-3">
                                <Link href={`/products/${product.slug}`}>
                                    <p className="text-sm font-medium line-clamp-2" style={{ color: "var(--dark)" }}>{product.name}</p>
                                </Link>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="font-semibold" style={{ color: "var(--dark)" }}>${product.price.toFixed(2)}</span>
                                    <button
                                        onClick={() => addItem({ productId: product.id, name: product.name, price: product.price, imageUrl: product.mainImageUrl, quantity: 1 })}
                                        className="px-3 py-1.5 rounded-full text-xs font-medium text-white"
                                        style={{ background: "var(--accent)" }}
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
