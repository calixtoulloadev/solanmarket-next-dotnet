import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";

interface CartStore {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (productId: string, variantId?: string) => void;
    updateQuantity: (productId: string, variantId: string | undefined, qty: number) => void;
    clearCart: () => void;
    totalItems: () => number;
    totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (item) => {
                set((state) => {
                    const existing = state.items.find(
                        (i) => i.productId === item.productId && i.variantId === item.variantId
                    );
                    if (existing) {
                        return {
                            items: state.items.map((i) =>
                                i.productId === item.productId && i.variantId === item.variantId
                                    ? { ...i, quantity: i.quantity + item.quantity }
                                    : i
                            ),
                        };
                    }
                    return { items: [...state.items, item] };
                });
            },

            removeItem: (productId, variantId) =>
                set((state) => ({
                    items: state.items.filter(
                        (i) => !(i.productId === productId && i.variantId === variantId)
                    ),
                })),

            updateQuantity: (productId, variantId, qty) =>
                set((state) => ({
                    items:
                        qty <= 0
                            ? state.items.filter(
                                (i) => !(i.productId === productId && i.variantId === variantId)
                            )
                            : state.items.map((i) =>
                                i.productId === productId && i.variantId === variantId
                                    ? { ...i, quantity: qty }
                                    : i
                            ),
                })),

            clearCart: () => set({ items: [] }),

            totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

            totalPrice: () =>
                get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
        }),
        { name: "solanmarket-cart" }
    )
);
