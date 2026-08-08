import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/constants/storageKeys';

const MAX_RECENTLY_VIEWED = 20;

interface RecentlyViewedState {
  productIds: number[];
  recordView: (productId: number) => void;
  clear: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      productIds: [],
      recordView: (productId) =>
        set((state) => ({
          productIds: [productId, ...state.productIds.filter((id) => id !== productId)].slice(
            0,
            MAX_RECENTLY_VIEWED,
          ),
        })),
      clear: () => set({ productIds: [] }),
    }),
    {
      name: STORAGE_KEYS.recentlyViewed,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
