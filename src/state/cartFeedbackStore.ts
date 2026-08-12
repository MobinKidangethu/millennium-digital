import { create } from 'zustand';
import type { Product } from '@/types';

/**
 * Ephemeral (non-persisted) UI-feedback state for the "Add to Cart" action —
 * separate from `cartStore` (which owns the actual cart contents). Two
 * consumers read this:
 *  - `AddedToCartPopup` shows a confirmation card for the most recently
 *    added line.
 *  - `BuyerHeader`'s cart icon plays a bounce animation keyed off `bumpToken`
 *    (a monotonically increasing counter — every add increments it, even if
 *    the same product is added twice in a row).
 */
interface CartFeedbackState {
  bumpToken: number;
  popupProduct: Product | null;
  popupQuantity: number;
  notifyAdded: (product: Product, quantity: number) => void;
  dismissPopup: () => void;
}

export const useCartFeedbackStore = create<CartFeedbackState>((set) => ({
  bumpToken: 0,
  popupProduct: null,
  popupQuantity: 0,
  notifyAdded: (product, quantity) =>
    set((s) => ({ bumpToken: s.bumpToken + 1, popupProduct: product, popupQuantity: quantity })),
  dismissPopup: () => set({ popupProduct: null }),
}));
