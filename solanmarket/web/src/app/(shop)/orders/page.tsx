"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/api";
import { OrderSummary } from "@/types";

const STATUS_COLORS: Record<string, string> = {
    Pending: "var(--lavender)",
    Processing: "#FEF3C7",
    Shipped: "#DBEAFE",
    Delivered: "var(--sage)",
    Cancelled: "#FEE2E2",
};

export default function OrdersPage() {
    const { data: orders, isPending } = useQuery({
        queryKey: ["orders"],
        queryFn: async () => {
            const res = await api.get<OrderSummary[]>("/orders");
            return res.data;
        },
    });

    return (
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-8">
            <h1 className="font-cormorant text-3xl font-semibold mb-6" style={{ color: "var(--dark)" }}>My Orders</h1>

            {isPending ? (
                <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: "rgba(200,192,185,0.3)" }} />
                    ))}
                </div>
            ) : !orders?.length ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                    <svg className="w-12 h-12 opacity-20" style={{ color: "var(--muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p style={{ color: "var(--muted)" }}>No orders yet</p>
                    <Link href="/explore" className="px-6 py-2.5 rounded-full text-white text-sm font-medium" style={{ background: "var(--accent)" }}>
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {orders.map((order) => (
                        <Link
                            key={order.id}
                            href={`/orders/${order.id}`}
                            className="flex items-center gap-4 p-4 rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-md"
                            style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(200,192,185,0.3)" }}
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-mono" style={{ color: "var(--muted)" }}>#{order.orderNumber}</span>
                                    <span
                                        className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                        style={{
                                            background: STATUS_COLORS[order.status] ?? "var(--blush)",
                                            color: "var(--dark)",
                                        }}
                                    >
                                        {order.status}
                                    </span>
                                </div>
                                <p className="text-xs" style={{ color: "var(--muted)" }}>
                                    {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                                    {" · "}{order.itemCount} item{order.itemCount !== 1 ? "s" : ""}
                                </p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="font-semibold" style={{ color: "var(--dark)" }}>${order.total.toFixed(2)}</p>
                            </div>
                            <svg className="w-4 h-4 shrink-0 opacity-40" style={{ color: "var(--dark)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
