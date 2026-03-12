"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

interface ProfileData {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
}

export default function ProfilePage() {
    const { user } = useAuthStore();
    const qc = useQueryClient();
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ firstName: user?.firstName ?? "", lastName: user?.lastName ?? "", phone: "" });

    const { data: profile } = useQuery({
        queryKey: ["profile"],
        queryFn: async () => {
            const res = await api.get<ProfileData>("/profile");
            return res.data;
        },
    });

    useEffect(() => {
        if (profile) {
            setForm({ firstName: profile.firstName, lastName: profile.lastName, phone: profile.phone ?? "" });
        }
    }, [profile]);

    const { mutate: save, isPending } = useMutation({
        mutationFn: async () => {
            await api.put("/profile", form);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["profile"] });
            setEditing(false);
        },
    });

    const displayName = profile
        ? `${profile.firstName} ${profile.lastName}`
        : user
            ? `${user.firstName} ${user.lastName}`
            : "";
    const initials = displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

    return (
        <div className="max-w-xl mx-auto px-4 md:px-6 py-8">
            <h1 className="font-cormorant text-3xl font-semibold mb-6" style={{ color: "var(--dark)" }}>
                My Profile
            </h1>

            {/* Avatar + name */}
            <div className="flex items-center gap-4 mb-8">
                <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold"
                    style={{ background: "var(--accent)" }}
                >
                    {initials}
                </div>
                <div>
                    <p className="font-cormorant text-2xl font-semibold" style={{ color: "var(--dark)" }}>{displayName}</p>
                    <p className="text-sm" style={{ color: "var(--muted)" }}>{profile?.email ?? user?.email}</p>
                </div>
            </div>

            {/* Info card */}
            <div
                className="p-5 rounded-2xl mb-4"
                style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(200,192,185,0.3)" }}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-cormorant text-xl font-semibold" style={{ color: "var(--dark)" }}>Personal Info</h2>
                    {!editing ? (
                        <button
                            onClick={() => setEditing(true)}
                            className="text-sm font-medium"
                            style={{ color: "var(--accent)" }}
                        >
                            Edit
                        </button>
                    ) : (
                        <button onClick={() => setEditing(false)} className="text-sm" style={{ color: "var(--muted)" }}>Cancel</button>
                    )}
                </div>

                {editing ? (
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { key: "firstName", label: "First name" },
                                { key: "lastName", label: "Last name" },
                            ].map(({ key, label }) => (
                                <div key={key}>
                                    <label className="block text-xs font-medium mb-1" style={{ color: "var(--muted)" }}>{label}</label>
                                    <input
                                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                                        style={{ background: "rgba(247,243,238,0.8)", border: "1px solid rgba(200,192,185,0.5)", color: "var(--dark)" }}
                                        value={(form as Record<string, string>)[key]}
                                        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                                    />
                                </div>
                            ))}
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: "var(--muted)" }}>Phone</label>
                            <input
                                type="tel"
                                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                                style={{ background: "rgba(247,243,238,0.8)", border: "1px solid rgba(200,192,185,0.5)", color: "var(--dark)" }}
                                placeholder="+1 555 000 0000"
                                value={form.phone}
                                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                            />
                        </div>
                        <button
                            onClick={() => save()}
                            disabled={isPending}
                            className="w-full py-3 rounded-xl text-white font-semibold disabled:opacity-60"
                            style={{ background: "var(--dark)" }}
                        >
                            {isPending ? "Saving…" : "Save Changes"}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3 text-sm">
                        {[
                            { label: "First name", value: profile?.firstName ?? user?.firstName },
                            { label: "Last name", value: profile?.lastName ?? user?.lastName },
                            { label: "Email", value: profile?.email ?? user?.email },
                            { label: "Phone", value: profile?.phone ?? "—" },
                        ].map(({ label, value }) => (
                            <div key={label} className="flex justify-between">
                                <span style={{ color: "var(--muted)" }}>{label}</span>
                                <span style={{ color: "var(--dark)" }}>{value}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick links */}
            <div
                className="rounded-2xl overflow-hidden"
                style={{ border: "1px solid rgba(200,192,185,0.3)" }}
            >
                {[
                    { label: "My Orders", href: "/orders", icon: "📦" },
                    { label: "Wishlist", href: "/wishlist", icon: "♡" },
                    { label: "Loyalty Points", href: "/loyalty", icon: "⭐" },
                    { label: "Coupons", href: "/coupons", icon: "🏷️" },
                    { label: "Notifications", href: "/notifications", icon: "🔔" },
                ].map(({ label, href, icon }, i, arr) => (
                    <a
                        key={href}
                        href={href}
                        className="flex items-center gap-3 px-5 py-3.5 transition-all hover:bg-white/40"
                        style={{
                            background: "rgba(255,255,255,0.65)",
                            borderBottom: i < arr.length - 1 ? "1px solid rgba(200,192,185,0.3)" : "none",
                        }}
                    >
                        <span className="text-lg w-6 text-center">{icon}</span>
                        <span className="flex-1 text-sm font-medium" style={{ color: "var(--dark)" }}>{label}</span>
                        <svg className="w-4 h-4 opacity-40" style={{ color: "var(--dark)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </a>
                ))}
            </div>
        </div>
    );
}
