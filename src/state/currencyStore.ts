import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type DisplayCurrency = 'INR' | 'USD';

/**
 * Storefront-wide display currency, set via the header currency switcher.
 * Product prices themselves are always stored in INR in products.json —
 * this only controls how they're *shown*. See src/utils/currency.ts for
 * the conversion logic consumed by every price-rendering component.
 */
interface CurrencyState {
  currency: DisplayCurrency;
  setCurrency: (currency: DisplayCurrency) => void;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      currency: 'INR',
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: 'md.currency',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
