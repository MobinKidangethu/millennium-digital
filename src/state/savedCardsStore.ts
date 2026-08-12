import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import type { CardBrand } from '@/features/checkout/cardValidation';

/**
 * A saved card is a tokenized reference only — brand, last 4 digits, and
 * expiry, the same shape a real payment gateway (Stripe/Razorpay/etc.)
 * would hand back after tokenizing a card. The raw card number and CVV are
 * never written to this store or anywhere else.
 */
export interface SavedCard {
  id: string;
  brand: CardBrand;
  last4: string;
  expiry: string; // MM/YY
  cardholderName: string;
  createdAt: string;
}

interface SavedCardsState {
  cards: SavedCard[];
  addCard: (card: Omit<SavedCard, 'id' | 'createdAt'>) => SavedCard;
  removeCard: (id: string) => void;
}

export const useSavedCardsStore = create<SavedCardsState>()(
  persist(
    (set, get) => ({
      cards: [],
      addCard: (card) => {
        const existing = get().cards.find(
          (c) => c.brand === card.brand && c.last4 === card.last4 && c.expiry === card.expiry,
        );
        if (existing) return existing;
        const full: SavedCard = { ...card, id: `card-${Date.now()}`, createdAt: new Date().toISOString() };
        set((state) => ({ cards: [...state.cards, full] }));
        return full;
      },
      removeCard: (id) => set((state) => ({ cards: state.cards.filter((c) => c.id !== id) })),
    }),
    {
      name: STORAGE_KEYS.savedCards,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
