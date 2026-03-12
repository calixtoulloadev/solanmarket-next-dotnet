"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/store/cartStore";

const TABS = [
    {
        label: "Home",
        href: "/",
        exact: true,
        icon: (active: boolean) => (
            <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 1 : 2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
    },
    {
        label: "Explore",
        href: "/explore",
        exact: false,
        icon: (active: boolean) => (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        ),
    },
    {
        label: "Cart",
        href: "/cart",
        exact: false,
        badge: true,
        icon: (active: boolean) => (
            <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 1 : 2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
        ),
    },
    {
        label: "Orders",
        href: "/orders",
        exact: false,
        icon: (active: boolean) => (
            <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 1 : 2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
        ),
    },
    {
        label: "Profile",
        href: "/profile",
        exact: false,
        icon: (active: boolean) => (
            <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 1 : 2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        ),
    },
];

export default function BottomNav() {
    const pathname = usePathname();
    const totalItems = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));

    if (pathname.startsWith("/admin")) return null;

    return (
        <nav
            className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]"
            style={{
                height: "calc(3.5rem + env(safe-area-inset-bottom))",
                background: "rgba(247,243,238,0.92)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderTop: "1px solid rgba(200,192,185,0.4)",
            }}
        >
            {TABS.map((tab) => {
                const isActive = tab.exact ? pathname === tab.href : pathname === tab.href || pathname.startsWith(tab.href + "/");
                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className="relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl min-w-12ion-all"
                        style={{ color: isActive ? "var(--accent)" : "var(--muted)" }}
                    >
                        <span className="relative">
                            {tab.icon(isActive)}
                            {tab.badge && totalItems > 0 && (
                                <span
                                    className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
                                    style={{ background: "var(--accent)" }}
                                >
                                    {totalItems > 9 ? "9+" : totalItems}
                                </span>
                            )}
                        </span>
                        <span className="text-[10px] font-medium leading-none">{tab.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
