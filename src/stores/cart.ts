/**
 * Client-side cart store (Zustand).
 * Provides optimistic UI state for cart count + drawer visibility.
 * Server is the source of truth; this store syncs after each API call.
 */

import { create } from 'zustand'

type CartItem = {
  id: string
  quantity: number
  unitPricePaise: number
  product: {
    id: string
    name: string
    slug: string
    images: { url: string; altText?: string | null }[]
  }
  variant: {
    id: string
    size: string
    color: string
    colorHex?: string | null
  }
}

type CartState = {
  items: CartItem[]
  isOpen: boolean
  isLoading: boolean
  setOpen: (open: boolean) => void
  setLoading: (loading: boolean) => void
  setItems: (items: CartItem[]) => void
  itemCount: () => number
  subtotalPaise: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,
  isLoading: false,
  setOpen: (open) => set({ isOpen: open }),
  setLoading: (loading) => set({ isLoading: loading }),
  setItems: (items) => set({ items }),
  itemCount: () => get().items.reduce((s, i) => s + i.quantity, 0),
  subtotalPaise: () => get().items.reduce((s, i) => s + i.unitPricePaise * i.quantity, 0),
}))
