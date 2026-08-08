import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/constants/storageKeys';

interface WelcomeState {
  hasSeenWelcome: boolean;
  hasHydrated: boolean;
  markSeen: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useWelcomeStore = create<WelcomeState>()(
  persist(
    (set) => ({
      hasSeenWelcome: false,
      hasHydrated: false,
      markSeen: () => set({ hasSeenWelcome: true }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: STORAGE_KEYS.hasSeenWelcome,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ hasSeenWelcome: state.hasSeenWelcome }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
