"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import { OrderDetail } from "@/types";

const STATUS_STEPS = ["Pending", "Processing", "Shipped", "Delivered"];

export default function OrderDetailPage() {
    const { id } = useParams<{ id: string }>();

    const { data: order, isPending, isError } = useQuery({
        queryKey: ["order", id],
        queryFn: async () => {
            const res = await api.get<OrderDetail>(`/orders/${id}`);
            return res.data;
        },
    });

    if (isPending) {
        return (
            <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 space-y-4 animate-pulse">
                <div className="h-8 w-48 rounded bg-[rgba(200,192,185,0.3)]" />
                <div className="h-40 rounded-2xl bg-[rgba(200,192,185,0.3)]" />
                <div className="h-60 rounded-2xl bg-[rgba(200,192,185,0.3)]" />
            </div>
        );
    }

    if (isError || !order) return notFound();

    const currentStep = STATUS_STEPS.indexOf(order.status);

    return (
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs mb-6" style={{ color: "var(--muted)" }}>
                <Link href="/orders" className="hover:underline">Orders</Link>
                <span>/</span>
                <span style={{ color: "var(--dark)" }}>#{order.orderNumber}</span>
            </div>

            <h1 className="font-cormorant text-3xl font-semibold mb-6" style={{ color: "var(--dark)" }}>
                Order #{order.orderNumber}
            </h1>

            {/* Progress tracker */}
            {order.status !== "Cancelled" && (
                <div
                    className="p-5 rounded-2xl mb-5"
                    style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(200,192,185,0.3)" }}
                >
                    <div className="flex items-center justify-between relative">
                        <div
                            className="absolute top-4 left-0 right-0 h-0.5 mx-8"
                            style={{ background: "rgba(200,192,185,0.4)" }}
                        />
                        <div
                            className="absolute top-4 left-0 h-0.5 mx-8 transition-all"
                            style={{
                                background: "var(--accent)",
                                width: currentStep > 0 ? `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` : "0%",
                            }}
                        />
                        {STATUS_STEPS.map((step, i) => (
                            <div key={step} className="relative flex flex-col items-center gap-1.5 z-10">
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                                    style={{
                                        background: i <= currentStep ? "var(--accent)" : "rgba(200,192,185,0.3)",
                                        color: i <= currentStep ? "white" : "var(--muted)",
                                    }}
                                >
                                    {i < currentStep ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        i + 1
                                    )}
                                </div>
                                <span className="text-[10px] text-center" style={{ color: i <= currentStep ? "var(--dark)" : "var(--muted)" }}>
                                    {step}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Items */}
            <div
                className="p-5 rounded-2xl mb-4"
                style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(200,192,185,0.3)" }}
            >
                <h2 className="font-cormorant text-lg font-semibold mb-3" style={{ color: "var(--dark)" }}>Items</h2>
                <div className="space-y-3">
                    {order.items.map((item) => (
                        <div key={item.id} className="flex gap-3">
                            <div className="w-14 h-14 rounded-xl shrink-0 overflow-hidden" style={{ background: "var(--blush)" }}>
                                {item.productImage ? (
                                    <Image src={item.productImage} alt={item.productName} width={56} height={56} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <svg className="w-5 h-5 opacity-20" style={{ color: "var(--muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium" style={{ color: "var(--dark)" }}>{item.productName}</p>
                                {item.variantDetails && <p className="text-xs" style={{ color: "var(--muted)" }}>{item.variantDetails}</p>}
                                <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                                    {item.quantity} × ${item.unitPrice.toFixed(2)}
                                </p>
                            </div>
                            <span className="text-sm font-semibold shrink-0" style={{ color: "var(--dark)" }}>${item.total.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Summary */}
            <div
                className="p-5 rounded-2xl mb-4"
                style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(200,192,185,0.3)" }}
            >
                <h2 className="font-cormorant text-lg font-semibold mb-3" style={{ color: "var(--dark)" }}>Summary</h2>
                <div className="space-y-1.5 text-sm">
                    {[
                        { label: "Subtotal", value: order.subTotal },
                        { label: "Shipping", value: order.shippingCost },
                        { label: "Discount", value: -order.discountAmount },
                        { label: "Tax", value: order.taxAmount },
                    ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between">
                            <span style={{ color: "var(--muted)" }}>{label}</span>
                            <span style={{ color: value < 0 ? "green" : "var(--dark)" }}>
                                {value < 0 ? "-" : ""}${Math.abs(value).toFixed(2)}
                            </span>
                        </div>
                    ))}
                    <div className="border-t pt-2 flex justify-between font-bold" style={{ borderColor: "rgba(200,192,185,0.3)" }}>
                        <span style={{ color: "var(--dark)" }}>Total</span>
                        <span style={{ color: "var(--dark)" }}>${order.total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Shipping address */}
            {order.shippingAddress && (
                <div
                    className="p-5 rounded-2xl"
                    style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(200,192,185,0.3)" }}
                >
                    <h2 className="font-cormorant text-lg font-semibold mb-2" style={{ color: "var(--dark)" }}>Shipping Address</h2>
                    <p className="text-sm" style={{ color: "var(--muted)" }}>
                        {order.shippingAddress.street}<br />
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                        {order.shippingAddress.country}
                    </p>
                </div>
            )}
        </div>
    );
}
