"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ProductListItem } from "@/types";
import { useCartStore } from "@/store/cartStore";

interface Props {
    product: ProductListItem;
}

export default function ProductCard({ product }: Props) {
    const addItem = useCartStore((s) => s.addItem);
    const [wishlisted, setWishlisted] = useState(false);
    const [added, setAdded] = useState(false);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        addItem({
            productId: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.mainImageUrl,
            quantity: 1,
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    };

    const stars = Math.round(product.rating);

    return (
        <Link
            href={`/products/${product.slug}`}
            className="group block rounded-2xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg"
            style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(200,192,185,0.3)" }}
        >
            {/* Image */}
            <div
                className="relative overflow-hidden"
                style={{ aspectRatio: "4/3", background: "var(--blush)" }}
            >
                {product.mainImageUrl ? (
                    <Image
                        src={product.mainImageUrl}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-10 h-10 opacity-20" style={{ color: "var(--muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}

                {/* Discount badge */}
                {product.discountPercent && product.discountPercent > 0 ? (
                    <span
                        className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                        style={{ background: "var(--accent)" }}
                    >
                        -{product.discountPercent}%
                    </span>
                ) : null}

                {/* Out of stock overlay */}
                {product.totalStock === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(255,255,255,0.6)" }}>
                        <span className="text-xs font-semibold" style={{ color: "var(--muted)" }}>Out of stock</span>
                    </div>
                )}

                {/* Wishlist button */}
                <button
                    onClick={(e) => { e.preventDefault(); setWishlisted((v) => !v); }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{ background: "rgba(255,255,255,0.85)" }}
                    aria-label="Wishlist"
                >
                    <svg
                        className="w-3.5 h-3.5"
                        fill={wishlisted ? "currentColor" : "none"}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{ color: wishlisted ? "var(--accent)" : "var(--muted)" }}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </button>
            </div>

            {/* Info */}
            <div className="p-3">
                <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "var(--accent)" }}>
                    {product.categoryName}
                </p>
                <p className="text-sm font-medium leading-snug line-clamp-2" style={{ color: "var(--dark)" }}>
                    {product.name}
                </p>

                {/* Stars */}
                <div className="flex items-center gap-0.5 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                            key={i}
                            className="w-3 h-3"
                            fill={i < stars ? "currentColor" : "none"}
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            style={{ color: i < stars ? "#F59E0B" : "var(--muted)" }}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                    ))}
                    <span className="text-[10px] ml-0.5" style={{ color: "var(--muted)" }}>({product.reviewCount})</span>
                </div>

                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-semibold" style={{ color: "var(--dark)" }}>
                            ${product.price.toFixed(2)}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-[10px] line-through" style={{ color: "var(--muted)" }}>
                                ${product.originalPrice.toFixed(2)}
                            </span>
                        )}
                    </div>

                    <button
                        onClick={handleAddToCart}
                        disabled={product.totalStock === 0}
                        className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: added ? "var(--sage)" : "var(--dark)" }}
                        aria-label="Add to cart"
                    >
                        {added ? (
                            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </Link>
    );
}
