"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartItem {
  id: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
  product_type?: "account" | "card" | "giftcode";
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  decreaseItem: (id: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => {
        const { items } = get();
        const existing = items.find((i) => i.id === newItem.id);
        if (existing) {
          set({
            items: items.map((i) =>
              i.id === newItem.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          set({ items: [...items, newItem] });
        }
      },
      decreaseItem: (id) => {
        const { items } = get();
        const item = items.find((i) => i.id === id);
        if (!item) return;
        if (item.quantity <= 1) {
          set({ items: items.filter((i) => i.id !== id) });
        } else {
          set({ items: items.map((i) => i.id === id ? { ...i, quantity: i.quantity - 1 } : i) });
        }
      },
      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
      totalPrice: () => get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    }),
    {
      name: "cart-storage",
    }
  )
);
