import { create } from 'zustand';
import type { Bom, BomMatchResult, Quote, Rfq } from '@/types';

/**
 * In-memory state for the single active BOM -> RFQ -> Quote demo journey.
 * Deliberately not persisted: this mirrors an active working session in a
 * real procurement tool, not a stored record — a production BOMService /
 * RFQService would persist BOMs and RFQs server-side per buyer/account.
 */
interface BomWorkflowState {
  bom: Bom | null;
  matches: BomMatchResult[];
  selectedProductIds: number[];
  rfq: Rfq | null;
  quote: Quote | null;
  setBom: (bom: Bom) => void;
  setMatches: (matches: BomMatchResult[]) => void;
  toggleSelected: (productId: number) => void;
  setSelectedProductIds: (ids: number[]) => void;
  setRfq: (rfq: Rfq | null) => void;
  setQuote: (quote: Quote | null) => void;
  reset: () => void;
}

export const useBomWorkflowStore = create<BomWorkflowState>()((set, get) => ({
  bom: null,
  matches: [],
  selectedProductIds: [],
  rfq: null,
  quote: null,
  setBom: (bom) => set({ bom }),
  setMatches: (matches) => set({ matches }),
  toggleSelected: (productId) =>
    set({
      selectedProductIds: get().selectedProductIds.includes(productId)
        ? get().selectedProductIds.filter((id) => id !== productId)
        : [...get().selectedProductIds, productId],
    }),
  setSelectedProductIds: (ids) => set({ selectedProductIds: ids }),
  setRfq: (rfq) => set({ rfq }),
  setQuote: (quote) => set({ quote }),
  reset: () => set({ bom: null, matches: [], selectedProductIds: [], rfq: null, quote: null }),
}));
