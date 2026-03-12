"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import CheckoutModal from "@/components/checkout/checkout-modal";

export default function CartPage() {
    const items = useCartStore((s) => s.items);
    const removeItem = useCartStore((s) => s.removeItem);
    const updateQuantity = useCartStore((s) => s.updateQuantity);
    const clearCart = useCartStore((s) => s.clearCart);
    const subtotal = useCartStore((s) => s.totalPrice());
    const [checkoutOpen, setCheckoutOpen] = useState(false);

    const shipping = subtotal > 0 ? (subtotal >= 50 ? 0 : 4.99) : 0;
    const total = subtotal + shipping;

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 px-6 text-center">
                <svg className="w-16 h-16 opacity-20" style={{ color: "var(--muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <div>
                    <h2 className="font-cormorant text-2xl font-semibold mb-2" style={{ color: "var(--dark)" }}>Your cart is empty</h2>
                    <p className="text-sm" style={{ color: "var(--muted)" }}>Looks like you haven't added anything yet.</p>
                </div>
                <Link
                    href="/explore"
                    className="px-8 py-3 rounded-full text-white font-medium"
                    style={{ background: "var(--accent)" }}
                >
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
                <h1 className="font-cormorant text-3xl font-semibold mb-6" style={{ color: "var(--dark)" }}>
                    My Cart ({items.reduce((n, i) => n + i.quantity, 0)})
                </h1>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Items list */}
                    <div className="flex-1 space-y-3">
                        {items.map((item) => (
                            <div
                                key={item.productId + (item.variantId ?? "")}
                                className="flex gap-4 p-4 rounded-2xl"
                                style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(200,192,185,0.3)" }}
                            >
                                <div
                                    className="w-20 h-20 rounded-xl shrink-0 overflow-hidden"
                                    style={{ background: "var(--blush)" }}
                                >
                                    {item.imageUrl ? (
                                        <Image src={item.imageUrl} alt={item.name} width={80} height={80} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <svg className="w-8 h-8 opacity-20" style={{ color: "var(--muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="font-medium leading-snug" style={{ color: "var(--dark)" }}>{item.name}</p>
                                    {item.variantDetails && (
                                        <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                                            {item.variantDetails}
                                        </p>
                                    )}
                                    <div className="flex items-center justify-between mt-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => updateQuantity(item.productId, item.variantId, Math.max(1, item.quantity - 1))}
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                                                style={{ background: "rgba(200,192,185,0.35)", color: "var(--dark)" }}
                                            >
                                                −
                                            </button>
                                            <span className="text-sm font-medium w-5 text-center" style={{ color: "var(--dark)" }}>{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                                                style={{ background: "rgba(200,192,185,0.35)", color: "var(--dark)" }}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold" style={{ color: "var(--dark)" }}>
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </span>
                                            <button
                                                onClick={() => removeItem(item.productId, item.variantId)}
                                                className="opacity-40 hover:opacity-80 transition-opacity"
                                            >
                                                <svg className="w-4 h-4" style={{ color: "var(--dark)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={clearCart}
                            className="text-sm opacity-50 hover:opacity-80 transition-opacity"
                            style={{ color: "var(--muted)" }}
                        >
                            Clear cart
                        </button>
                    </div>

                    {/* Summary */}
                    <div
                        className="lg:w-72 h-fit p-5 rounded-2xl sticky top-20"
                        style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(200,192,185,0.3)" }}
                    >
                        <h2 className="font-cormorant text-xl font-semibold mb-4" style={{ color: "var(--dark)" }}>Order Summary</h2>

                        <div className="space-y-2.5 mb-4">
                            <div className="flex justify-between text-sm">
                                <span style={{ color: "var(--muted)" }}>Subtotal</span>
                                <span style={{ color: "var(--dark)" }}>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span style={{ color: "var(--muted)" }}>Shipping</span>
                                <span style={{ color: shipping === 0 ? "var(--sage, #D6E4D8)" : "var(--dark)" }}>
                                    {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                                </span>
                            </div>
                            {shipping > 0 && (
                                <p className="text-xs" style={{ color: "var(--muted)" }}>
                                    Add ${(50 - subtotal).toFixed(2)} more for free shipping
                                </p>
                            )}
                            <div className="border-t pt-2.5" style={{ borderColor: "rgba(200,192,185,0.3)" }}>
                                <div className="flex justify-between">
                                    <span className="font-semibold" style={{ color: "var(--dark)" }}>Total</span>
                                    <span className="font-bold text-lg" style={{ color: "var(--dark)" }}>${total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setCheckoutOpen(true)}
                            className="w-full py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90"
                            style={{ background: "var(--dark)" }}
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            </div>

            <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
        </>
    );
}
