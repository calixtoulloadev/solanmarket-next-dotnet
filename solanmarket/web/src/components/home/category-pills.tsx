"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

interface Category {
    label: string;
    value: string;
}

function Pills({ categories }: { categories: Category[] }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const active = searchParams.get("category") ?? "";

    const select = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set("category", value);
        } else {
            params.delete("category");
        }
        router.push(`/explore?${params.toString()}`);
    };

    return (
        <div className="flex gap-2 overflow-x-auto px-4 md:px-6 pb-1 no-scrollbar">
            {categories.map((c) => (
                <button
                    key={c.value}
                    onClick={() => select(c.value)}
                    className="shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all"
                    style={{
                        background: active === c.value ? "var(--dark)" : "rgba(255,255,255,0.7)",
                        color: active === c.value ? "white" : "var(--dark)",
                        border: "1px solid",
                        borderColor: active === c.value ? "var(--dark)" : "rgba(200,192,185,0.5)",
                    }}
                >
                    {c.label}
                </button>
            ))}
        </div>
    );
}

export default function CategoryPills({ categories }: { categories: Category[] }) {
    return (
        <div className="py-4">
            <Suspense fallback={null}>
                <Pills categories={categories} />
            </Suspense>
        </div>
    );
}
