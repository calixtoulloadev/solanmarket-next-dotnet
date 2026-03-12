"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Link from "next/link";

interface DashboardStats {
    totalRevenue: number;
    totalOrders: number;
    totalUsers: number;
    totalProducts: number;
    revenueChange: number;
    ordersChange: number;
    usersChange: number;
    recentOrders: Array<{
        id: string;
        orderNumber: string;
        customerName: string;
        total: number;
        status: string;
        createdAt: string;
    }>;
    topProducts: Array<{
        id: string;
        name: string;
        salesCount: number;
        revenue: number;
        imageUrl?: string;
    }>;
}

const STAT_COLORS = ["var(--lavender)", "var(--sage)", "var(--blush)", "rgba(200,192,185,0.4)"];

export default function AdminDashboardPage() {
    const { data, isPending } = useQuery({
        queryKey: ["admin", "dashboard"],
        queryFn: async () => {
            const res = await api.get<DashboardStats>("/admin/dashboard");
            return res.data;
        },
    });

    const stats = [
        { label: "Total Revenue", value: data ? `$${data.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "—", change: data?.revenueChange, icon: "💰" },
        { label: "Orders", value: data?.totalOrders ?? "—", change: data?.ordersChange, icon: "📦" },
        { label: "Customers", value: data?.totalUsers ?? "—", change: data?.usersChange, icon: "👥" },
        { label: "Products", value: data?.totalProducts ?? "—", icon: "🛍️" },
    ];

    return (
        <div className="px-4 md:px-8 py-8">
            <h1 className="font-cormorant text-3xl font-semibold mb-8" style={{ color: "var(--dark)" }}>Dashboard</h1>

            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat, i) => (
                    <div
                        key={stat.label}
                        className="p-5 rounded-2xl"
                        style={{ background: STAT_COLORS[i], border: "1px solid rgba(200,192,185,0.3)" }}
                    >
                        {isPending ? (
                            <div className="space-y-2 animate-pulse">
                                <div className="h-4 w-20 rounded bg-white/40" />
                                <div className="h-8 w-24 rounded bg-white/40" />
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-medium" style={{ color: "var(--muted)" }}>{stat.label}</p>
                                    <span className="text-xl">{stat.icon}</span>
                                </div>
                                <p className="text-2xl font-bold" style={{ color: "var(--dark)" }}>{stat.value}</p>
                                {stat.change !== undefined && (
                                    <p className="text-xs mt-1" style={{ color: stat.change >= 0 ? "green" : "red" }}>
                                        {stat.change >= 0 ? "↑" : "↓"} {Math.abs(stat.change)}% vs last month
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent orders */}
                <div
                    className="p-5 rounded-2xl"
                    style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(200,192,185,0.3)" }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-cormorant text-xl font-semibold" style={{ color: "var(--dark)" }}>Recent Orders</h2>
                        <Link href="/admin/orders" className="text-xs font-medium" style={{ color: "var(--accent)" }}>View all →</Link>
                    </div>
                    {isPending ? (
                        <div className="space-y-3 animate-pulse">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 rounded bg-[rgba(200,192,185,0.3)]" />)}</div>
                    ) : data?.recentOrders?.length ? (
                        <div className="space-y-2">
                            {data.recentOrders.slice(0, 6).map((order) => (
                                <Link
                                    key={order.id}
                                    href={`/admin/orders/${order.id}`}
                                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/50 transition-all"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium truncate" style={{ color: "var(--dark)" }}>{order.customerName}</p>
                                        <p className="text-[10px]" style={{ color: "var(--muted)" }}>#{order.orderNumber}</p>
                                    </div>
                                    <span className="text-xs font-semibold shrink-0" style={{ color: "var(--dark)" }}>${order.total.toFixed(2)}</span>
                                    <span
                                        className="text-[10px] px-2 py-0.5 rounded-full shrink-0"
                                        style={{
                                            background: order.status === "Delivered" ? "var(--sage)" : order.status === "Cancelled" ? "#FEE2E2" : "var(--lavender)",
                                            color: "var(--dark)",
                                        }}
                                    >
                                        {order.status}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-center py-4" style={{ color: "var(--muted)" }}>No orders yet</p>
                    )}
                </div>

                {/* Top products */}
                <div
                    className="p-5 rounded-2xl"
                    style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(200,192,185,0.3)" }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-cormorant text-xl font-semibold" style={{ color: "var(--dark)" }}>Top Products</h2>
                        <Link href="/admin/products" className="text-xs font-medium" style={{ color: "var(--accent)" }}>View all →</Link>
                    </div>
                    {isPending ? (
                        <div className="space-y-3 animate-pulse">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 rounded bg-[rgba(200,192,185,0.3)]" />)}</div>
                    ) : data?.topProducts?.length ? (
                        <div className="space-y-2.5">
                            {data.topProducts.slice(0, 6).map((product, i) => (
                                <div key={product.id} className="flex items-center gap-3">
                                    <span className="text-xs font-bold w-5 shrink-0" style={{ color: "var(--muted)" }}>#{i + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium truncate" style={{ color: "var(--dark)" }}>{product.name}</p>
                                        <p className="text-[10px]" style={{ color: "var(--muted)" }}>{product.salesCount} sales</p>
                                    </div>
                                    <span className="text-xs font-semibold" style={{ color: "var(--accent)" }}>${product.revenue.toFixed(0)}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-center py-4" style={{ color: "var(--muted)" }}>No data yet</p>
                    )}
                </div>
            </div>
        </div>
    );
}
