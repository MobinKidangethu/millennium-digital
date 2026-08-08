import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * Categories and manufacturers are derived from the product catalog
 * (see src/features/products/service.ts) rather than being their own
 * stored entities — a new one appears automatically the moment a
 * product uses that category/manufacturer name, via the admin Add
 * Product form. This store only holds the one thing that *isn't*
 * derivable: whether an admin has disabled a category/manufacturer
 * from being shown in buyer-facing browse/shop-by sections.
 */
interface CatalogMetaState {
  disabledCategories: string[];
  disabledManufacturers: string[];
  toggleCategory: (name: string) => void;
  toggleManufacturer: (name: string) => void;
}

export const useCatalogMetaStore = create<CatalogMetaState>()(
  persist(
    (set) => ({
      disabledCategories: [],
      disabledManufacturers: [],
      toggleCategory: (name) =>
        set((state) => ({
          disabledCategories: state.disabledCategories.includes(name)
            ? state.disabledCategories.filter((c) => c !== name)
            : [...state.disabledCategories, name],
        })),
      toggleManufacturer: (name) =>
        set((state) => ({
          disabledManufacturers: state.disabledManufacturers.includes(name)
            ? state.disabledManufacturers.filter((m) => m !== name)
            : [...state.disabledManufacturers, name],
        })),
    }),
    {
      name: 'md.catalogMeta',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
