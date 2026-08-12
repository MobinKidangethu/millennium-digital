import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/constants/storageKeys';

interface PromoState {
  /** The promo code currently applied to the cart, carried through checkout. */
  appliedCode: string | null;
  setAppliedCode: (code: string | null) => void;
  clear: () => void;
}

/**
 * Holds the single promo code applied to the active cart, persisted so it
 * survives navigation between Cart → Checkout → Review. Cleared on order
 * placement (see app/(buyer)/checkout/review.tsx) and whenever the cart is
 * cleared. The actual discount math lives in the promotions service
 * (evaluatePromoCode) — this store only tracks *which* code is applied.
 */
export const usePromoStore = create<PromoState>()(
  persist(
    (set) => ({
      appliedCode: null,
      setAppliedCode: (code) => set({ appliedCode: code }),
      clear: () => set({ appliedCode: null }),
    }),
    {
      name: STORAGE_KEYS.promoCode,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
