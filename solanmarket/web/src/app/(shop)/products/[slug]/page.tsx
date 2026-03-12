"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import { ProductDetail } from "@/types";
import { useCartStore } from "@/store/cartStore";

export default function ProductDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const { data: product, isPending, isError } = useQuery({
        queryKey: ["product", slug],
        queryFn: async () => {
            const res = await api.get<ProductDetail>(`/products/${slug}`);
            return res.data;
        },
    });

    const [activeImage, setActiveImage] = useState(0);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);

    const addItem = useCartStore((s) => s.addItem);

    // All derived state must be computed before early returns to keep hook call order stable.
    const images = [...(product?.images ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
    const activeVariants = (product?.variants ?? []).filter((v) => v.isActive);
    const colors = [
        ...new Map(
            activeVariants
                .filter((v) => v.colorHex)
                .map((v) => [v.colorHex, { hex: v.colorHex!, name: v.colorName ?? v.colorHex! }])
        ).values(),
    ];
    const hasColors = colors.length > 0;

    // Variants visible for selected color (or all if no colors)
    const sizeVariants = useMemo(() => {
        if (!hasColors) return activeVariants;
        if (!selectedColor) return [];
        return activeVariants.filter((v) => v.colorHex === selectedColor);
    }, [activeVariants, hasColors, selectedColor]);

    // Images filtered to selected color when present
    const visibleImages = useMemo(() => {
        if (selectedColor) {
            const colorImgs = images.filter((i) => i.colorHex === selectedColor);
            return colorImgs.length > 0 ? colorImgs : images;
        }
        return images;
    }, [images, selectedColor]);

    if (isPending) return <ProductDetailSkeleton />;
    if (isError || !product) return notFound();

    const hasSizes = sizeVariants.some((v) => v.size);
    const selectedVariant = activeVariants.find((v) => v.id === selectedVariantId) ?? null;
    const effectivePrice = product.price + (selectedVariant?.additionalPrice ?? 0);

    const safeActiveImage = Math.min(activeImage, Math.max(0, visibleImages.length - 1));
    const displayImages = visibleImages.length > 0 ? visibleImages : images;

    const stock = selectedVariant
        ? selectedVariant.stock
        : activeVariants.length > 0
            ? activeVariants.reduce((s, v) => s + v.stock, 0)
            : 0;
    const outOfStock = activeVariants.length > 0 && stock === 0;

    // Can add to cart:
    // - no variants → always
    // - has colors, no sizes (color-only) → need color selected
    // - has colors and sizes → need variant selected
    // - no colors, has sizes → need variant selected
    const canAddToCart =
        activeVariants.length === 0 ||
        (!hasColors && !hasSizes) ||
        (hasColors && !hasSizes && selectedColor !== null) ||
        selectedVariantId !== null;

    const handleColorClick = (hex: string) => {
        const next = hex === selectedColor ? null : hex;
        setSelectedColor(next);
        setSelectedVariantId(null);
        setActiveImage(0);

        // Auto-select variant if this color has no size dimension
        if (next) {
            const colorVariants = activeVariants.filter((v) => v.colorHex === next);
            if (colorVariants.length > 0 && !colorVariants.some((v) => v.size)) {
                setSelectedVariantId(colorVariants[0].id);
            }
        }
    };

    const handleAddToCart = () => {
        if (!canAddToCart || outOfStock) return;

        const variantLabel = selectedVariant
            ? [selectedVariant.colorName, selectedVariant.size].filter(Boolean).join(" / ")
            : undefined;

        addItem({
            productId: product.id,
            variantId: selectedVariantId ?? undefined,
            name: product.name,
            variantDetails: variantLabel,
            imageUrl: displayImages[0]?.url,
            price: effectivePrice,
            quantity,
        });
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    const stars = Math.round(product.rating);

    return (
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs mb-6 flex-wrap" style={{ color: "var(--muted)" }}>
                <Link href="/" className="hover:underline">Home</Link>
                <span>/</span>
                <Link href="/explore" className="hover:underline">Explore</Link>
                {product.categoryName && (
                    <>
                        <span>/</span>
                        <Link
                            href={`/explore?category=${encodeURIComponent(product.categoryName.toLowerCase())}`}
                            className="hover:underline"
                        >
                            {product.categoryName}
                        </Link>
                    </>
                )}
                <span>/</span>
                <span style={{ color: "var(--dark)" }}>{product.name}</span>
            </nav>

            <div className="flex flex-col md:flex-row gap-8">
                {/* ── Image gallery ── */}
                <div className="md:w-100 shrink-0">
                    <div
                        className="relative rounded-2xl overflow-hidden"
                        style={{ aspectRatio: "1/1", background: "var(--blush)" }}
                    >
                        {displayImages[safeActiveImage]?.url ? (
                            <Image
                                src={displayImages[safeActiveImage].url}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="400px"
                                priority
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <svg
                                    className="w-16 h-16 opacity-20"
                                    style={{ color: "var(--muted)" }}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                        )}

                        {(product.discountPercent ?? 0) > 0 && (
                            <span
                                className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold text-white"
                                style={{ background: "var(--accent)" }}
                            >
                                -{product.discountPercent}%
                            </span>
                        )}

                        {outOfStock && (
                            <div
                                className="absolute inset-0 flex items-center justify-center"
                                style={{ background: "rgba(255,255,255,0.55)" }}
                            >
                                <span className="text-sm font-semibold" style={{ color: "var(--muted)" }}>
                                    Out of stock
                                </span>
                            </div>
                        )}
                    </div>

                    {displayImages.length > 1 && (
                        <div className="flex gap-2 mt-3 flex-wrap">
                            {displayImages.map((img, i) => (
                                <button
                                    key={img.id}
                                    onClick={() => setActiveImage(i)}
                                    className="relative w-16 h-16 rounded-xl overflow-hidden transition-all hover:opacity-90"
                                    style={{
                                        border:
                                            i === safeActiveImage
                                                ? "2px solid var(--accent)"
                                                : "1px solid rgba(0,0,0,0.08)",
                                    }}
                                >
                                    <Image src={img.url} alt="" fill className="object-cover" sizes="64px" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Product info ── */}
                <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase tracking-widest mb-1 font-medium" style={{ color: "var(--accent)" }}>
                        {product.categoryName}
                        {product.brand && ` · ${product.brand}`}
                    </p>

                    <h1
                        className="font-cormorant text-3xl md:text-4xl font-semibold leading-tight mb-2"
                        style={{ color: "var(--dark)" }}
                    >
                        {product.name}
                    </h1>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-5">
                        <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <svg
                                    key={i}
                                    className="w-4 h-4"
                                    fill={i < stars ? "currentColor" : "none"}
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    style={{ color: i < stars ? "#F59E0B" : "var(--muted)" }}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                    />
                                </svg>
                            ))}
                        </div>
                        <span className="text-xs" style={{ color: "var(--muted)" }}>
                            {product.rating.toFixed(1)} ({product.reviewCount} reviews)
                        </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-3 mb-6">
                        <span className="text-3xl font-semibold" style={{ color: "var(--dark)" }}>
                            ${effectivePrice.toFixed(2)}
                        </span>
                        {(product.originalPrice ?? 0) > product.price && (
                            <span className="text-base line-through" style={{ color: "var(--muted)" }}>
                                ${product.originalPrice!.toFixed(2)}
                            </span>
                        )}
                        {(product.discountPercent ?? 0) > 0 && (
                            <span
                                className="text-sm font-medium px-2.5 py-0.5 rounded-full"
                                style={{ background: "rgba(155,107,155,0.12)", color: "var(--accent)" }}
                            >
                                Save {product.discountPercent}%
                            </span>
                        )}
                    </div>

                    {/* Color selector */}
                    {hasColors && (
                        <div className="mb-5">
                            <p className="text-xs font-medium mb-2" style={{ color: "var(--dark)" }}>
                                Color
                                {selectedColor && (
                                    <span style={{ fontWeight: 400, color: "var(--muted)" }}>
                                        {" "}— {colors.find((c) => c.hex === selectedColor)?.name ?? selectedColor}
                                    </span>
                                )}
                            </p>
                            <div className="flex gap-2.5 flex-wrap">
                                {colors.map((c) => (
                                    <button
                                        key={c.hex}
                                        onClick={() => handleColorClick(c.hex)}
                                        className="w-8 h-8 rounded-full transition-all hover:scale-110"
                                        style={{
                                            background: c.hex,
                                            boxShadow:
                                                selectedColor === c.hex
                                                    ? "0 0 0 2px white, 0 0 0 4px var(--accent)"
                                                    : "0 0 0 1.5px rgba(0,0,0,0.12)",
                                        }}
                                        title={c.name}
                                        aria-label={`Color: ${c.name}`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Size selector */}
                    {hasSizes && (
                        <div className="mb-5">
                            <p className="text-xs font-medium mb-2" style={{ color: "var(--dark)" }}>Size</p>
                            <div className="flex gap-2 flex-wrap">
                                {sizeVariants
                                    .filter((v) => v.size)
                                    .map((v) => {
                                        const isSelected = selectedVariantId === v.id;
                                        const noStock = v.stock === 0;
                                        return (
                                            <button
                                                key={v.id}
                                                onClick={() => !noStock && setSelectedVariantId(v.id === selectedVariantId ? null : v.id)}
                                                disabled={noStock}
                                                className="px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all"
                                                style={{
                                                    background: isSelected ? "var(--accent)" : "rgba(255,255,255,0.7)",
                                                    color: isSelected ? "white" : noStock ? "var(--muted)" : "var(--dark)",
                                                    border: `1px solid ${isSelected ? "var(--accent)" : "rgba(0,0,0,0.08)"}`,
                                                    opacity: noStock ? 0.5 : 1,
                                                    textDecoration: noStock ? "line-through" : "none",
                                                }}
                                            >
                                                {v.size}
                                            </button>
                                        );
                                    })}
                            </div>
                        </div>
                    )}

                    {/* Stock indicator */}
                    <div className="flex items-center gap-2 mb-5 h-4">
                        {outOfStock ? (
                            <span className="text-xs font-medium" style={{ color: "#EF4444" }}>Out of stock</span>
                        ) : stock > 0 ? (
                            <>
                                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#22C55E" }} />
                                <span className="text-xs" style={{ color: "var(--muted)" }}>
                                    {stock <= 5 ? `Only ${stock} left in stock` : "In stock"}
                                </span>
                            </>
                        ) : null}
                    </div>

                    {/* Quantity + Add to cart */}
                    <div className="flex items-center gap-3 mb-3">
                        <div
                            className="flex items-center rounded-xl overflow-hidden"
                            style={{
                                border: "1px solid rgba(0,0,0,0.08)",
                                background: "rgba(255,255,255,0.7)",
                            }}
                        >
                            <button
                                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                className="w-9 h-11 flex items-center justify-center text-xl leading-none hover:bg-black/5 transition-colors"
                                style={{ color: "var(--dark)" }}
                            >
                                −
                            </button>
                            <span
                                className="w-10 text-center text-sm font-medium"
                                style={{ color: "var(--dark)" }}
                            >
                                {quantity}
                            </span>
                            <button
                                onClick={() => setQuantity((q) => Math.min(stock || 99, q + 1))}
                                className="w-9 h-11 flex items-center justify-center text-xl leading-none hover:bg-black/5 transition-colors"
                                style={{ color: "var(--dark)" }}
                            >
                                +
                            </button>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            disabled={!canAddToCart || outOfStock}
                            className="flex-1 h-11 rounded-xl font-medium text-sm text-white transition-all hover:scale-[1.02] hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed"
                            style={{
                                background: addedToCart
                                    ? "#22C55E"
                                    : outOfStock || !canAddToCart
                                        ? "var(--muted)"
                                        : "var(--accent)",
                            }}
                        >
                            {addedToCart
                                ? "Added to cart ✓"
                                : outOfStock
                                    ? "Out of stock"
                                    : !canAddToCart
                                        ? "Select options above"
                                        : "Add to cart"}
                        </button>
                    </div>

                    {hasColors && !selectedColor && !outOfStock && (
                        <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>
                            Please select a color to continue.
                        </p>
                    )}
                    {hasSizes && selectedColor && !selectedVariantId && !outOfStock && (
                        <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>
                            Please select a size to continue.
                        </p>
                    )}

                    {/* Tags */}
                    {product.tags.length > 0 && (
                        <div className="flex gap-2 flex-wrap mt-4">
                            {product.tags.map((tag) => (
                                <Link
                                    key={tag}
                                    href={`/explore?q=${encodeURIComponent(tag)}`}
                                    className="px-2.5 py-1 rounded-full text-xs hover:opacity-75 transition-opacity"
                                    style={{ background: "rgba(155,107,155,0.1)", color: "var(--accent)" }}
                                >
                                    #{tag}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Description */}
            {product.description && (
                <div
                    className="mt-10 pt-8"
                    style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
                >
                    <h2
                        className="font-cormorant text-2xl font-semibold mb-3"
                        style={{ color: "var(--dark)" }}
                    >
                        Product Description
                    </h2>
                    <p
                        className="text-sm leading-relaxed whitespace-pre-line max-w-2xl"
                        style={{ color: "var(--muted)" }}
                    >
                        {product.description}
                    </p>
                </div>
            )}
        </div>
    );
}

function ProductDetailSkeleton() {
    return (
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 animate-pulse">
            <div className="h-3 w-48 rounded mb-6" style={{ background: "rgba(200,192,185,0.4)" }} />
            <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-100 shrink-0">
                    <div
                        className="rounded-2xl"
                        style={{ aspectRatio: "1/1", background: "rgba(200,192,185,0.3)" }}
                    />
                    <div className="flex gap-2 mt-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-16 h-16 rounded-xl" style={{ background: "rgba(200,192,185,0.3)" }} />
                        ))}
                    </div>
                </div>
                <div className="flex-1 space-y-4">
                    <div className="h-3 w-28 rounded" style={{ background: "rgba(200,192,185,0.3)" }} />
                    <div className="h-9 w-3/4 rounded" style={{ background: "rgba(200,192,185,0.3)" }} />
                    <div className="h-4 w-40 rounded" style={{ background: "rgba(200,192,185,0.3)" }} />
                    <div className="h-9 w-32 rounded" style={{ background: "rgba(200,192,185,0.3)" }} />
                    <div className="h-11 rounded-xl" style={{ background: "rgba(200,192,185,0.3)" }} />
                </div>
            </div>
        </div>
    );
}

