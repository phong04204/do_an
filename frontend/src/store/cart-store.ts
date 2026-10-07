"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
  product_type?: "account" | "card" | "giftcode";
}

interface CartState {
  items: CartItem[];
  buyNowItem: CartItem | null;
  addItem: (item: CartItem) => void;
  setBuyNowItem: (item: CartItem | null) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const cartItemKey = (item: Pick<CartItem, "id" | "product_type">) =>
  `${item.product_type ?? "account"}-${item.id}`;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      buyNowItem: null,
      addItem: (newItem) => {
        const { items } = get();
        const normalizedItem = { ...newItem, quantity: 1 };
        if (items.some((item) => cartItemKey(item) === cartItemKey(normalizedItem))) {
          return;
        }
        set({ items: [...items, normalizedItem] });
      },
      setBuyNowItem: (item) => {
        set({ buyNowItem: item ? { ...item, quantity: 1 } : null });
      },
      removeItem: (key) => {
        set({ items: get().items.filter((item) => cartItemKey(item) !== key) });
      },
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.length,
      totalPrice: () => get().items.reduce((acc, item) => acc + item.price, 0),
    }),
    {
      name: "cart-storage",
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<CartState>;
        const persistedItems = persisted?.items ?? [];
        const uniqueItems = new Map<string, CartItem>();
        persistedItems.forEach((item) => {
          uniqueItems.set(cartItemKey(item), { ...item, quantity: 1 });
        });

        return {
          ...currentState,
          ...persisted,
          items: Array.from(uniqueItems.values()),
          buyNowItem: persisted?.buyNowItem ?? null,
        };
      },
    }
  )
);
