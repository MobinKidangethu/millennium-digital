import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import type { Address } from '@/types';

interface AddressState {
  addresses: Address[];
  addAddress: (address: Omit<Address, 'id'>) => Address;
  updateAddress: (id: string, patch: Partial<Address>) => void;
  removeAddress: (id: string) => void;
  setDefault: (id: string) => void;
}

export const useAddressStore = create<AddressState>()(
  persist(
    (set, get) => ({
      addresses: [],
      addAddress: (address) => {
        const isFirst = get().addresses.length === 0;
        const full: Address = { ...address, id: `addr-${Date.now()}`, isDefault: isFirst || address.isDefault };
        set((state) => ({
          addresses: full.isDefault
            ? [...state.addresses.map((a) => ({ ...a, isDefault: false })), full]
            : [...state.addresses, full],
        }));
        return full;
      },
      updateAddress: (id, patch) =>
        set((state) => ({
          addresses: state.addresses.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        })),
      removeAddress: (id) =>
        set((state) => ({ addresses: state.addresses.filter((a) => a.id !== id) })),
      setDefault: (id) =>
        set((state) => ({
          addresses: state.addresses.map((a) => ({ ...a, isDefault: a.id === id })),
        })),
    }),
    {
      name: STORAGE_KEYS.addresses,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
