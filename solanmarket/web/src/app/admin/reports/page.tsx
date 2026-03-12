"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface MonthlyRevenue { month: string; year: number; revenue: number; orders: number; }
interface TopProduct { productId: string; productName: string; unitsSold: number; revenue: number; }
interface CategoryRevenue { categoryName: string; revenue: number; percentage: number; }

interface ReportsData {
    totalRevenue: number; totalOrders: number; avgOrderValue: number;
    monthlyRevenue: MonthlyRevenue[];
    topProducts: TopProduct[];
    revenueByCategory: CategoryRevenue[];
}

export default function AdminReportsPage() {
    const { data, isPending } = useQuery<ReportsData>({
        queryKey: ["admin", "reports"],
        queryFn: async () => { const res = await api.get<ReportsData>("/admin/reports"); return res.data; },
    });

    const maxMonthlyRevenue = Math.max(...(data?.monthlyRevenue.map((m) => m.revenue) ?? [1]));

    return (
        <div className="px-4 md:px-8 py-8">
            <h1 className="font-cormorant text-3xl font-semibold mb-6" style={{ color: "var(--dark)" }}>Reports</h1>

            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                    { label: "Total Revenue", value: isPending ? "—" : `$${(data?.totalRevenue ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}` },
                    { label: "Total Orders", value: isPending ? "—" : (data?.totalOrders ?? 0).toLocaleString() },
                    { label: "Avg. Order Value", value: isPending ? "—" : `$${(data?.avgOrderValue ?? 0).toFixed(2)}` },
                ].map((stat) => (
                    <div key={stat.label} className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(200,192,185,0.3)" }}>
                        <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>{stat.label}</p>
                        <p className="text-2xl font-semibold font-cormorant" style={{ color: "var(--dark)" }}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Monthly Revenue Chart */}
            <div className="rounded-2xl p-6 mb-6" style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(200,192,185,0.3)" }}>
                <h2 className="font-semibold text-sm mb-6" style={{ color: "var(--dark)" }}>Monthly Revenue</h2>
                {isPending ? (
                    <div className="h-32 rounded animate-pulse" style={{ background: "rgba(200,192,185,0.2)" }} />
                ) : (
                    <div className="flex items-end gap-2 h-40 overflow-x-auto pb-2">
                        {data?.monthlyRevenue.map((m, i) => {
                            const pct = maxMonthlyRevenue > 0 ? (m.revenue / maxMonthlyRevenue) * 100 : 0;
                            return (
                                <div key={i} className="flex flex-col items-center gap-1 min-w-10 group relative">
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded-lg text-[10px] whitespace-nowrap z-10" style={{ background: "var(--dark)", color: "white" }}>
                                        ${m.revenue.toFixed(0)} · {m.orders} orders
                                    </div>
                                    <div className="w-full rounded-t-md transition-all" style={{ height: `${Math.max(pct, 4)}%`, background: "var(--accent)", opacity: 0.7 }} />
                                    <span className="text-[9px] text-center whitespace-nowrap" style={{ color: "var(--muted)" }}>{m.month.slice(0, 3)}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Products */}
                <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(200,192,185,0.3)" }}>
                    <h2 className="font-semibold text-sm mb-4" style={{ color: "var(--dark)" }}>Top Products</h2>
                    {isPending ? (
                        Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-8 rounded mb-2 animate-pulse" style={{ background: "rgba(200,192,185,0.2)" }} />)
                    ) : (
                        <table className="w-full text-xs">
                            <thead>
                                <tr style={{ borderBottom: "1px solid rgba(200,192,185,0.3)" }}>
                                    {["Product", "Units", "Revenue"].map((h) => <th key={h} className="py-2 text-left font-semibold" style={{ color: "var(--muted)" }}>{h}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {data?.topProducts.map((p, i) => (
                                    <tr key={p.productId} style={{ borderBottom: "1px solid rgba(200,192,185,0.1)" }}>
                                        <td className="py-2 font-medium" style={{ color: "var(--dark)" }}>
                                            <span className="mr-2 text-[10px]" style={{ color: "var(--muted)" }}>#{i + 1}</span>{p.productName}
                                        </td>
                                        <td className="py-2 text-center" style={{ color: "var(--muted)" }}>{p.unitsSold}</td>
                                        <td className="py-2 font-semibold" style={{ color: "var(--dark)" }}>${p.revenue.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Revenue by Category */}
                <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(200,192,185,0.3)" }}>
                    <h2 className="font-semibold text-sm mb-4" style={{ color: "var(--dark)" }}>Revenue by Category</h2>
                    {isPending ? (
                        Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-8 rounded mb-2 animate-pulse" style={{ background: "rgba(200,192,185,0.2)" }} />)
                    ) : (
                        <div className="space-y-3">
                            {data?.revenueByCategory.map((cat) => (
                                <div key={cat.categoryName}>
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <span style={{ color: "var(--dark)" }}>{cat.categoryName}</span>
                                        <span className="font-semibold" style={{ color: "var(--dark)" }}>${cat.revenue.toFixed(2)} <span style={{ color: "var(--muted)", fontWeight: 400 }}>({cat.percentage.toFixed(1)}%)</span></span>
                                    </div>
                                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(200,192,185,0.3)" }}>
                                        <div className="h-full rounded-full transition-all" style={{ width: `${cat.percentage}%`, background: "var(--accent)" }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
