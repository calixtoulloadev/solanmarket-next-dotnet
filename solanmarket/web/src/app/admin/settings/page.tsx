"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface Settings {
    storeName: string; storeDescription: string; contactEmail: string; address: string;
    currency: string; freeShippingThreshold: number;
    notifyNewOrder: boolean; notifyLowStock: boolean; notifyNewUser: boolean;
}

const DEFAULT_SETTINGS: Settings = {
    storeName: "Solanmarket", storeDescription: "", contactEmail: "", address: "",
    currency: "USD", freeShippingThreshold: 50,
    notifyNewOrder: true, notifyLowStock: true, notifyNewUser: false,
};

export default function AdminSettingsPage() {
    const [form, setForm] = useState<Settings>(DEFAULT_SETTINGS);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");

    const { data, isPending } = useQuery<Settings>({
        queryKey: ["admin", "settings"],
        queryFn: async () => { const res = await api.get<Settings>("/admin/settings"); return res.data; },
    });

    useEffect(() => { if (data) setForm({ ...DEFAULT_SETTINGS, ...data }); }, [data]);

    const { mutate: save, isPending: saving } = useMutation({
        mutationFn: async (payload: Settings) => { await api.put("/admin/settings", payload); },
        onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 3000); },
        onError: (e: Error) => setError(e.message),
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        save(form);
    }

    function set<K extends keyof Settings>(key: K, value: Settings[K]) {
        setForm((f) => ({ ...f, [key]: value }));
    }

    return (
        <div className="px-4 md:px-8 py-8 max-w-2xl">
            <h1 className="font-cormorant text-3xl font-semibold mb-6" style={{ color: "var(--dark)" }}>Settings</h1>

            {error && <div className="mb-4 px-4 py-3 rounded-xl text-sm text-red-700 bg-red-50 border border-red-200">{error}</div>}
            {saved && <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: "var(--sage)", color: "var(--dark)" }}>Settings saved successfully.</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* General */}
                <div className="rounded-2xl p-6 space-y-4" style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(200,192,185,0.3)" }}>
                    <h2 className="font-semibold text-sm" style={{ color: "var(--dark)" }}>General</h2>
                    {isPending ? (
                        Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-10 rounded-xl animate-pulse" style={{ background: "rgba(200,192,185,0.2)" }} />)
                    ) : (
                        <>
                            {[
                                ["storeName", "Store Name"],
                                ["storeDescription", "Store Description"],
                                ["contactEmail", "Contact Email"],
                                ["address", "Address"],
                            ].map(([field, label]) => (
                                <div key={field}>
                                    <label className="block text-xs mb-1" style={{ color: "var(--muted)" }}>{label}</label>
                                    <input
                                        className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                                        style={{ background: "rgba(247,243,238,0.8)", border: "1px solid rgba(200,192,185,0.4)", color: "var(--dark)" }}
                                        value={form[field as keyof Settings] as string}
                                        onChange={(e) => set(field as keyof Settings, e.target.value as Settings[keyof Settings])}
                                    />
                                </div>
                            ))}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs mb-1" style={{ color: "var(--muted)" }}>Currency</label>
                                    <select className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: "rgba(247,243,238,0.8)", border: "1px solid rgba(200,192,185,0.4)", color: "var(--dark)" }} value={form.currency} onChange={(e) => set("currency", e.target.value)}>
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                        <option value="GBP">GBP (£)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs mb-1" style={{ color: "var(--muted)" }}>Free Shipping Threshold ($)</label>
                                    <input type="number" min="0" step="0.01" className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: "rgba(247,243,238,0.8)", border: "1px solid rgba(200,192,185,0.4)", color: "var(--dark)" }} value={form.freeShippingThreshold} onChange={(e) => set("freeShippingThreshold", parseFloat(e.target.value) || 0)} />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Notifications */}
                <div className="rounded-2xl p-6 space-y-4" style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(200,192,185,0.3)" }}>
                    <h2 className="font-semibold text-sm" style={{ color: "var(--dark)" }}>Notifications</h2>
                    {(
                        [
                            ["notifyNewOrder", "Notify on new orders"],
                            ["notifyLowStock", "Notify on low stock"],
                            ["notifyNewUser", "Notify on new user registration"],
                        ] as [keyof Settings, string][]
                    ).map(([key, label]) => (
                        <label key={key} className="flex items-center justify-between cursor-pointer select-none">
                            <span className="text-sm" style={{ color: "var(--dark)" }}>{label}</span>
                            <button type="button" onClick={() => set(key, !form[key] as Settings[keyof Settings])} className="w-10 h-5.5 rounded-full relative transition-all" style={{ background: form[key] ? "var(--accent)" : "rgba(200,192,185,0.5)" }}>
                                <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm" style={{ left: form[key] ? "calc(100% - 18px)" : "2px" }} />
                            </button>
                        </label>
                    ))}
                </div>

                <button type="submit" disabled={saving || isPending} className="w-full py-3 rounded-xl text-sm font-medium text-white disabled:opacity-60 transition-all" style={{ background: "var(--dark)" }}>
                    {saving ? "Saving…" : "Save Settings"}
                </button>
            </form>
        </div>
    );
}
