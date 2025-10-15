"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Product } from "@/types/product"

interface WishlistStore {
  items: Product[]
  addItem: (product: Product) => void
  removeItem: (id: string) => void
  clearWishlist: () => void
  isInWishlist: (id: string) => boolean
}

export const useWishlist = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        set((state) => {
          const exists = state.items.find((item) => item.id === product.id)
          if (exists) return state

          return { items: [...state.items, product] }
        })
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }))
      },

      clearWishlist: () => set({ items: [] }),

      isInWishlist: (id) => {
        return get().items.some((item) => item.id === id)
      },
    }),
    {
      name: "wishlist-storage",
    },
  ),
)
