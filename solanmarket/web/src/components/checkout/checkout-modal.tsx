"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { CreateOrderRequest } from "@/types";

// Simplified payload used in checkout (shippingAddressId will be obtained from saved/created address)
interface CheckoutPayload {
    shippingAddress: string;
    shippingMethod: string;
    paymentMethodType: string;
    notes?: string;
    items: { productId: string; variantId?: string; quantity: number }[];
}

interface Props {
    open: boolean;
    onClose: () => void;
}

type Step = "address" | "payment" | "confirm";

interface AddressForm {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    notes: string;
}

export default function CheckoutModal({ open, onClose }: Props) {
    const router = useRouter();
    const { user } = useAuthStore();
    const items = useCartStore((s) => s.items);
    const subtotal = useCartStore((s) => s.totalPrice());
    const clearCart = useCartStore((s) => s.clearCart);

    const [step, setStep] = useState<Step>("address");
    const [address, setAddress] = useState<AddressForm>({
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "US",
        notes: "",
    });
    const [paymentMethod] = useState("card");

    const shipping = subtotal >= 50 ? 0 : 4.99;
    const total = subtotal + shipping;

    const { mutate: placeOrder, isPending, isError, error } = useMutation({
        mutationFn: async () => {
            const payload: CheckoutPayload = {
                shippingAddress: `${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`,
                shippingMethod: "Standard",
                paymentMethodType: paymentMethod === "card" ? "Card" : paymentMethod === "paypal" ? "PayPal" : "Card",
                notes: address.notes || undefined,
                items: items.map((i) => ({
                    productId: i.productId,
                    variantId: i.variantId,
                    quantity: i.quantity,
                })),
            };
            const res = await api.post<{ id: string }>("/orders", payload);
            return res.data;
        },
        onSuccess: (data) => {
            clearCart();
            onClose();
            router.push(`/orders/${data.id}`);
        },
    });

    if (!open) return null;

    const addressComplete = address.street && address.city && address.zipCode;

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            style={{ background: "rgba(42,36,48,0.5)", backdropFilter: "blur(4px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col"
                style={{ background: "var(--cream)", maxHeight: "90vh" }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b" style={{ borderColor: "rgba(200,192,185,0.3)" }}>
                    <div>
                        <h2 className="font-cormorant text-2xl font-semibold" style={{ color: "var(--dark)" }}>Checkout</h2>
                        <div className="flex items-center gap-2 mt-1">
                            {(["address", "payment", "confirm"] as Step[]).map((s, i) => (
                                <div key={s} className="flex items-center gap-2">
                                    <div
                                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                                        style={{
                                            background: step === s ? "var(--accent)" : (
                                                (step === "payment" && s === "address") || (step === "confirm" && s !== "confirm")
                                                    ? "var(--dark)"
                                                    : "rgba(200,192,185,0.4)"
                                            ),
                                            color: "white",
                                        }}
                                    >
                                        {i + 1}
                                    </div>
                                    <span className="text-[10px] capitalize" style={{ color: step === s ? "var(--accent)" : "var(--muted)" }}>{s}</span>
                                    {i < 2 && <div className="w-5 h-px" style={{ background: "rgba(200,192,185,0.5)" }} />}
                                </div>
                            ))}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:opacity-70">
                        <svg className="w-5 h-5" style={{ color: "var(--dark)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="overflow-y-auto styled-scroll flex-1 px-6 py-5">
                    {/* Step 1: Address */}
                    {step === "address" && (
                        <div className="space-y-4">
                            <h3 className="font-medium" style={{ color: "var(--dark)" }}>Shipping Address</h3>
                            {[
                                { key: "street", label: "Street address", placeholder: "123 Main St" },
                                { key: "city", label: "City", placeholder: "New York" },
                                { key: "state", label: "State / Province", placeholder: "NY" },
                                { key: "zipCode", label: "ZIP / Postal code", placeholder: "10001" },
                                { key: "country", label: "Country", placeholder: "US" },
                                { key: "notes", label: "Delivery notes (optional)", placeholder: "Leave at door..." },
                            ].map(({ key, label, placeholder }) => (
                                <div key={key}>
                                    <label className="block text-xs font-medium mb-1" style={{ color: "var(--muted)" }}>{label}</label>
                                    <input
                                        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                                        style={{
                                            background: "rgba(255,255,255,0.7)",
                                            border: "1px solid rgba(200,192,185,0.5)",
                                            color: "var(--dark)",
                                        }}
                                        placeholder={placeholder}
                                        value={(address as unknown as Record<string, string>)[key]}
                                        onChange={(e) => setAddress((a) => ({ ...a, [key]: e.target.value }))}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Step 2: Payment */}
                    {step === "payment" && (
                        <div className="space-y-4">
                            <h3 className="font-medium" style={{ color: "var(--dark)" }}>Payment Method</h3>
                            <div
                                className="flex items-center gap-4 p-4 rounded-xl"
                                style={{ border: "2px solid var(--accent)", background: "rgba(155,107,155,0.06)" }}
                            >
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--accent)" }}>
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium" style={{ color: "var(--dark)" }}>Credit / Debit Card</p>
                                    <p className="text-xs" style={{ color: "var(--muted)" }}>Visa, Mastercard, Amex</p>
                                </div>
                                <div className="ml-auto w-4 h-4 rounded-full border-2 border-(--accent) flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full" style={{ background: "var(--accent)" }} />
                                </div>
                            </div>
                            <p className="text-xs text-center py-2" style={{ color: "var(--muted)" }}>
                                Payment processing powered by Stripe — demo mode
                            </p>
                        </div>
                    )}

                    {/* Step 3: Confirm */}
                    {step === "confirm" && (
                        <div className="space-y-4">
                            <h3 className="font-medium" style={{ color: "var(--dark)" }}>Order Review</h3>

                            <div className="space-y-2">
                                {items.map((item) => (
                                    <div key={item.productId + (item.variantId ?? "")} className="flex justify-between text-sm">
                                        <span style={{ color: "var(--dark)" }}>{item.name} × {item.quantity}</span>
                                        <span style={{ color: "var(--dark)" }}>${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-3 space-y-1.5" style={{ borderColor: "rgba(200,192,185,0.3)" }}>
                                <div className="flex justify-between text-sm">
                                    <span style={{ color: "var(--muted)" }}>Shipping to:</span>
                                    <span className="text-right text-xs max-w-[60%]" style={{ color: "var(--dark)" }}>
                                        {address.street}, {address.city}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span style={{ color: "var(--muted)" }}>Shipping cost</span>
                                    <span style={{ color: "var(--dark)" }}>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                                </div>
                                <div className="flex justify-between font-bold pt-1">
                                    <span style={{ color: "var(--dark)" }}>Total</span>
                                    <span style={{ color: "var(--dark)" }}>${total.toFixed(2)}</span>
                                </div>
                            </div>

                            {isError && (
                                <p className="text-xs text-red-500 text-center">
                                    {(error as Error)?.message ?? "Failed to place order. Please try again."}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t" style={{ borderColor: "rgba(200,192,185,0.3)" }}>
                    {step === "address" && (
                        <button
                            onClick={() => setStep("payment")}
                            disabled={!addressComplete}
                            className="w-full py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ background: "var(--dark)" }}
                        >
                            Continue to Payment →
                        </button>
                    )}
                    {step === "payment" && (
                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep("address")}
                                className="flex-1 py-3.5 rounded-xl font-semibold"
                                style={{ background: "rgba(200,192,185,0.3)", color: "var(--dark)" }}
                            >
                                ← Back
                            </button>
                            <button
                                onClick={() => setStep("confirm")}
                                className="flex-1 py-3.5 rounded-xl text-white font-semibold"
                                style={{ background: "var(--dark)" }}
                            >
                                Review Order →
                            </button>
                        </div>
                    )}
                    {step === "confirm" && (
                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep("payment")}
                                className="flex-1 py-3.5 rounded-xl font-semibold"
                                style={{ background: "rgba(200,192,185,0.3)", color: "var(--dark)" }}
                            >
                                ← Back
                            </button>
                            <button
                                onClick={() => placeOrder()}
                                disabled={isPending}
                                className="flex-1 py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90 disabled:opacity-60"
                                style={{ background: "var(--accent)" }}
                            >
                                {isPending ? "Placing…" : "Place Order"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
