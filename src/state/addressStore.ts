import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import type { Address } from '@/types';

/**
 * Two demo saved addresses seeded once on first load so the checkout
 * address step isn't empty for reviewers — one domestic (India), one
 * international (Netherlands), so the country/state pickers and the
 * INR→USD auto-switch on non-India addresses both have something to show
 * immediately. No phone number is included for Shashank's address since
 * none was provided — left blank rather than invented.
 */
const DEMO_ADDRESSES: Omit<Address, 'id'>[] = [
  {
    label: 'Office',
    fullName: 'Shashank Awasthi',
    line1: 'Devon – Powered by Emagine, Lower Ground Floor, Building 2A-West Tower',
    line2: 'Embassy Tech Village, Outer Ring Road, Devarabisanahalli, Varthur Hobli, Bellandur',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560087',
    country: 'India',
    phone: '',
    isDefault: true,
  },
  {
    label: 'International Office',
    fullName: 'Anders Gratter',
    line1: 'De Lairessestraat 49-2',
    city: 'Amsterdam',
    state: 'North Holland',
    postalCode: '1071 NT',
    country: 'Netherlands',
    phone: '+31 85 086 17 00',
    isDefault: false,
  },
];

interface AddressState {
  addresses: Address[];
  hasSeededDemoAddresses: boolean;
  addAddress: (address: Omit<Address, 'id'>) => Address;
  updateAddress: (id: string, patch: Partial<Address>) => void;
  removeAddress: (id: string) => void;
  setDefault: (id: string) => void;
  seedDemoAddresses: () => void;
}

export const useAddressStore = create<AddressState>()(
  persist(
    (set, get) => ({
      addresses: [],
      hasSeededDemoAddresses: false,
      seedDemoAddresses: () => {
        if (get().hasSeededDemoAddresses) return;
        set((state) => ({
          hasSeededDemoAddresses: true,
          addresses:
            state.addresses.length === 0
              ? DEMO_ADDRESSES.map((addr, i) => ({ ...addr, id: `addr-seed-${i}` }))
              : state.addresses,
        }));
      },
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
      onRehydrateStorage: () => (state) => {
        state?.seedDemoAddresses();
      },
    },
  ),
);
