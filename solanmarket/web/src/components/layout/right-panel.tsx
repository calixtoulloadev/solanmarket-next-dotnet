"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { usePathname } from "next/navigation";

export default function RightPanel() {
    const pathname = usePathname();
    const items = useCartStore((s) => s.items);
    const removeItem = useCartStore((s) => s.removeItem);
    const updateQuantity = useCartStore((s) => s.updateQuantity);
    const subtotal = useCartStore((s) => s.totalPrice());

    if (pathname.startsWith("/admin")) return null;

    return (
        <aside
            className="hidden xl:flex flex-col w-72 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)]"
            style={{
                background: "rgba(247,243,238,0.6)",
                borderLeft: "1px solid rgba(200,192,185,0.3)",
            }}
        >
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(200,192,185,0.3)" }}>
                <h2 className="font-cormorant text-lg font-semibold" style={{ color: "var(--dark)" }}>
                    My Cart
                </h2>
                {items.length > 0 && (
                    <span
                        className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                        style={{ background: "var(--accent)" }}
                    >
                        {items.reduce((n, i) => n + i.quantity, 0)}
                    </span>
                )}
            </div>

            <div className="flex-1 overflow-y-auto styled-scroll px-4 py-3">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-center pb-8">
                        <svg className="w-12 h-12" style={{ color: "var(--muted)", opacity: 0.4 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <p className="text-sm" style={{ color: "var(--muted)" }}>Your cart is empty</p>
                        <Link
                            href="/explore"
                            className="text-xs px-4 py-2 rounded-full text-white font-medium"
                            style={{ background: "var(--accent)" }}
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {items.map((item) => (
                            <div
                                key={item.productId + (item.variantId ?? "")}
                                className="flex gap-3 p-2 rounded-xl"
                                style={{ background: "rgba(255,255,255,0.6)" }}
                            >
                                <div
                                    className="w-14 h-14 rounded-lg shrink-0 overflow-hidden"
                                    style={{ background: "var(--blush)" }}
                                >
                                    {item.imageUrl ? (
                                        <Image
                                            src={item.imageUrl}
                                            alt={item.name}
                                            width={56}
                                            height={56}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <svg className="w-6 h-6" style={{ color: "var(--muted)", opacity: 0.5 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate" style={{ color: "var(--dark)" }}>{item.name}</p>
                                    {item.variantDetails && (
                                        <p className="text-[10px] mt-0.5" style={{ color: "var(--muted)" }}>
                                            {item.variantDetails}
                                        </p>
                                    )}
                                    <div className="flex items-center justify-between mt-1.5">
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => updateQuantity(item.productId, item.variantId, Math.max(1, item.quantity - 1))}
                                                className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                                                style={{ background: "rgba(200,192,185,0.4)", color: "var(--dark)" }}
                                            >
                                                −
                                            </button>
                                            <span className="text-xs w-4 text-center" style={{ color: "var(--dark)" }}>{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                                                className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                                                style={{ background: "rgba(200,192,185,0.4)", color: "var(--dark)" }}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <span className="text-xs font-semibold" style={{ color: "var(--accent)" }}>
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => removeItem(item.productId, item.variantId)}
                                    className="shrink-0 self-start mt-1 opacity-40 hover:opacity-80 transition-opacity"
                                >
                                    <svg className="w-3.5 h-3.5" style={{ color: "var(--dark)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {items.length > 0 && (
                <div className="p-4 border-t space-y-3" style={{ borderColor: "rgba(200,192,185,0.3)" }}>
                    <div className="flex items-center justify-between">
                        <span className="text-sm" style={{ color: "var(--muted)" }}>Subtotal</span>
                        <span className="text-sm font-semibold" style={{ color: "var(--dark)" }}>${subtotal.toFixed(2)}</span>
                    </div>
                    <Link
                        href="/cart"
                        className="block w-full text-center py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                        style={{ background: "var(--dark)" }}
                    >
                        View Cart & Checkout
                    </Link>
                </div>
            )}
        </aside>
    );
}
