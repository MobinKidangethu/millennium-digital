import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/constants/storageKeys';

export const MAX_COMPARE_ITEMS = 4;

interface CompareState {
  productIds: number[];
  /** returns false when the list is already at MAX_COMPARE_ITEMS */
  add: (productId: number) => boolean;
  remove: (productId: number) => void;
  clear: () => void;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      productIds: [],
      add: (productId) => {
        const { productIds } = get();
        if (productIds.includes(productId)) return true;
        if (productIds.length >= MAX_COMPARE_ITEMS) return false;
        set({ productIds: [...productIds, productId] });
        return true;
      },
      remove: (productId) =>
        set((state) => ({ productIds: state.productIds.filter((id) => id !== productId) })),
      clear: () => set({ productIds: [] }),
    }),
    {
      name: STORAGE_KEYS.compare,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
