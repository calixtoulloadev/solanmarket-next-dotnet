"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface Notification {
    id: string;
    title: string;
    body: string;
    isRead: boolean;
    type: string;
    createdAt: string;
}

const TYPE_ICONS: Record<string, string> = {
    order: "📦",
    promo: "🏷️",
    loyalty: "⭐",
    system: "🔔",
};

export default function NotificationsPage() {
    const qc = useQueryClient();

    const { data, isPending } = useQuery({
        queryKey: ["notifications"],
        queryFn: async () => {
            const res = await api.get<Notification[]>("/notifications");
            return res.data;
        },
    });

    const { mutate: markAllRead } = useMutation({
        mutationFn: async () => {
            await api.post("/notifications/read-all");
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
    });

    const { mutate: markRead } = useMutation({
        mutationFn: async (id: string) => {
            await api.put(`/notifications/${id}/read`);
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
    });

    const unreadCount = data?.filter((n) => !n.isRead).length ?? 0;

    return (
        <div className="max-w-xl mx-auto px-4 md:px-6 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="font-cormorant text-3xl font-semibold" style={{ color: "var(--dark)" }}>
                    Notifications
                    {unreadCount > 0 && (
                        <span
                            className="ml-2 text-sm px-2 py-0.5 rounded-full text-white"
                            style={{ background: "var(--accent)" }}
                        >
                            {unreadCount}
                        </span>
                    )}
                </h1>
                {unreadCount > 0 && (
                    <button onClick={() => markAllRead()} className="text-sm font-medium" style={{ color: "var(--accent)" }}>
                        Mark all read
                    </button>
                )}
            </div>

            {isPending ? (
                <div className="space-y-3 animate-pulse">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-16 rounded-2xl bg-[rgba(200,192,185,0.3)]" />
                    ))}
                </div>
            ) : !data?.length ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
                    <svg className="w-10 h-10 opacity-20" style={{ color: "var(--muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <p className="text-sm" style={{ color: "var(--muted)" }}>No notifications yet</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {data.map((n) => (
                        <button
                            key={n.id}
                            onClick={() => !n.isRead && markRead(n.id)}
                            className="w-full flex items-start gap-3 p-4 rounded-2xl text-left transition-all hover:bg-white/60"
                            style={{
                                background: n.isRead ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.75)",
                                border: "1px solid rgba(200,192,185,0.3)",
                            }}
                        >
                            <span className="text-2xl shrink-0 mt-0.5">{TYPE_ICONS[n.type] ?? TYPE_ICONS.system}</span>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <p className="text-sm font-medium" style={{ color: "var(--dark)" }}>{n.title}</p>
                                    {!n.isRead && (
                                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: "var(--accent)" }} />
                                    )}
                                </div>
                                <p className="text-xs" style={{ color: "var(--muted)" }}>{n.body}</p>
                                <p className="text-[10px] mt-1" style={{ color: "var(--muted)", opacity: 0.6 }}>
                                    {new Date(n.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
