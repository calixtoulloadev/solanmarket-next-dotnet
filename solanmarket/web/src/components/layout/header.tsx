"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";

export default function Header() {
    const pathname = usePathname();
    const totalItems = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
    const { user, clearAuth } = useAuthStore();
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchVal, setSearchVal] = useState("");

    const isShop = !pathname.startsWith("/admin");

    return (
        <header
            className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-6 h-14"
            style={{
                background: "rgba(247,243,238,0.88)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                borderBottom: "1px solid rgba(255,255,255,0.6)",
            }}
        >
            {/* Logo */}
            <Link
                href="/"
                className="font-cormorant text-xl font-semibold shrink-0"
                style={{ color: "var(--dark)" }}
            >
                Solanmarket
            </Link>

            {/* Search bar – tablet/desktop */}
            {isShop && (
                <div
                    className="hidden md:flex items-center gap-2 flex-1 max-w-xs mx-6 px-3 py-1.5 rounded-full"
                    style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(200,192,185,0.5)" }}
                >
                    <svg className="w-4 h-4 shrink-0" style={{ color: "var(--muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        className="flex-1 bg-transparent text-sm outline-none"
                        style={{ color: "var(--dark)" }}
                        placeholder="Search products…"
                        value={searchVal}
                        onChange={(e) => setSearchVal(e.target.value)}
                    />
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
                {/* Mobile search toggle */}
                {isShop && (
                    <button
                        className="md:hidden p-2 rounded-full transition-opacity hover:opacity-70"
                        onClick={() => setSearchOpen((v) => !v)}
                        aria-label="Search"
                    >
                        <svg className="w-5 h-5" style={{ color: "var(--dark)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                )}

                {/* Cart */}
                {isShop && (
                    <Link href="/cart" className="relative p-2 rounded-full hover:opacity-70 transition-opacity">
                        <svg className="w-5 h-5" style={{ color: "var(--dark)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        {totalItems > 0 && (
                            <span
                                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                                style={{ background: "var(--accent)" }}
                            >
                                {totalItems > 9 ? "9+" : totalItems}
                            </span>
                        )}
                    </Link>
                )}

                {/* User */}
                {user ? (
                    <div className="flex items-center gap-2">
                        <Link
                            href="/profile"
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ background: "var(--accent)" }}
                        >
                            {user.firstName[0]}{user.lastName[0]}
                        </Link>
                    </div>
                ) : (
                    <Link
                        href="/login"
                        className="hidden md:flex items-center gap-1 px-4 py-1.5 rounded-full text-sm font-medium text-white"
                        style={{ background: "var(--accent)" }}
                    >
                        Sign In
                    </Link>
                )}
            </div>

            {/* Mobile search bar */}
            {isShop && searchOpen && (
                <div
                    className="absolute top-14 left-0 right-0 px-4 py-3"
                    style={{ background: "rgba(247,243,238,0.97)", borderBottom: "1px solid rgba(200,192,185,0.4)" }}
                >
                    <div
                        className="flex items-center gap-2 px-3 py-2 rounded-full"
                        style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(200,192,185,0.5)" }}
                    >
                        <svg className="w-4 h-4 shrink-0" style={{ color: "var(--muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            autoFocus
                            className="flex-1 bg-transparent text-sm outline-none"
                            style={{ color: "var(--dark)" }}
                            placeholder="Search products…"
                            value={searchVal}
                            onChange={(e) => setSearchVal(e.target.value)}
                        />
                    </div>
                </div>
            )}
        </header>
    );
}
