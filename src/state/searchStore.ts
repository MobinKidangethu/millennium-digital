import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const MAX_RECENT_SEARCHES = 8;

interface SearchState {
  recentSearches: string[];
  recordSearch: (query: string) => void;
  clear: () => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      recentSearches: [],
      recordSearch: (query) =>
        set((state) => {
          const trimmed = query.trim();
          if (!trimmed) return state;
          return {
            recentSearches: [
              trimmed,
              ...state.recentSearches.filter((q) => q.toLowerCase() !== trimmed.toLowerCase()),
            ].slice(0, MAX_RECENT_SEARCHES),
          };
        }),
      clear: () => set({ recentSearches: [] }),
    }),
    {
      name: 'md.recentSearches',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
