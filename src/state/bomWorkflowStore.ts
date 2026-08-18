import { create } from 'zustand';
import type { BomDesignRequestLink, BomLineRouting, BomMatchResult, BomRfqSubmissionLink, Quote, Rfq } from '@/types';

export type BomWorkflowStep = 'input' | 'processing' | 'results';

/**
 * In-memory state for the single active BOM -> RFQ -> Quote demo journey.
 * Deliberately not persisted to disk: this mirrors an active working
 * session in a real procurement tool, not a stored record — a production
 * BOMService / RFQService would persist BOMs and RFQs server-side per
 * buyer/account.
 *
 * The BOM step/text/matches/selections used to live as local component
 * state inside the BOM screen, which meant navigating away (e.g. to submit
 * a Design Request for an unmatched line) and back reset the whole screen
 * to a blank upload form — the processed results were lost. Lifting that
 * state here keeps it alive across navigation for the lifetime of the app
 * session, so "Submit Design Request" -> fill form -> submit -> back
 * returns to the same processed BOM, not a blank one.
 */
interface BomWorkflowState {
  step: BomWorkflowStep;
  text: string;
  matches: BomMatchResult[];
  selectedExactIds: string[];
  chosenAlternative: Record<string, number>;
  /**
   * BOM line id -> where a resolved line's approved quantity should go:
   * a normal catalog order (cart/checkout) or the RFQ pipeline. Defaulted
   * in startBomResults (exact -> order, alternative/ai-suggested -> rfq)
   * and always overridable per line by the buyer.
   */
  lineRouting: Record<string, BomLineRouting>;
  /**
   * BOM line id -> the buyer's entered approximate unit price, for
   * alternative/ai-suggested lines routed to RFQ. Once RFQ routing is
   * chosen for these match types, the specific catalog alternative picker
   * is hidden — the buyer isn't confirming an exact SKU, they're giving
   * sales a target price to quote against (see RfqLineItem.targetUnitPrice).
   * Kept as a raw string so the input can hold partial/invalid entries
   * while typing; parsed to a number only on RFQ submission.
   */
  customerTargetPrices: Record<string, string>;
  /** BOM line id -> the Design Request submitted for it. Cleared whenever a new BOM is processed. */
  designRequestLinks: Record<string, BomDesignRequestLink>;
  /** BOM line id -> the RFQ it was submitted in. Cleared whenever a new BOM is processed. */
  rfqSubmissionLinks: Record<string, BomRfqSubmissionLink>;
  rfq: Rfq | null;
  quote: Quote | null;
  setStep: (step: BomWorkflowStep) => void;
  setText: (text: string) => void;
  /** Atomically applies a freshly matched BOM's results and resets per-line selections/links/routing from any previous run. */
  startBomResults: (matches: BomMatchResult[], selectedExactIds: string[], chosenAlternative: Record<string, number>) => void;
  toggleSelectedExact: (lineId: string) => void;
  chooseAlternativeFor: (lineId: string, productId: number) => void;
  setLineRouting: (lineId: string, routing: BomLineRouting) => void;
  setCustomerTargetPrice: (lineId: string, value: string) => void;
  /** Marks a BOM line as having a Design Request submitted for it — excludes it from cart/RFQ processing. */
  linkDesignRequest: (link: BomDesignRequestLink) => void;
  /** Marks every given BOM line as submitted in the given RFQ — excludes them from re-submission and shows their fulfillment link instead of the routing controls. */
  linkRfqSubmissions: (links: BomRfqSubmissionLink[]) => void;
  setRfq: (rfq: Rfq | null) => void;
  setQuote: (quote: Quote | null) => void;
  /** Clears the whole BOM workflow back to a blank upload form (e.g. "Start New BOM"). */
  resetBomWorkflow: () => void;
  /**
   * Clears the BOM input/results back to a blank upload form once a run is
   * fully handed off — either all Normal Order lines were added to cart, or
   * an RFQ was submitted for the RFQ-routed lines — so returning to this
   * screen never shows a stale, already-actioned BOM. Deliberately leaves
   * `rfq`/`quote` untouched (unlike resetBomWorkflow) since a just-submitted
   * RFQ still needs that session slot for the RFQ detail screen right after.
   */
  startFreshBom: () => void;
}

export const useBomWorkflowStore = create<BomWorkflowState>()((set, get) => ({
  step: 'input',
  text: '',
  matches: [],
  selectedExactIds: [],
  chosenAlternative: {},
  lineRouting: {},
  customerTargetPrices: {},
  designRequestLinks: {},
  rfqSubmissionLinks: {},
  rfq: null,
  quote: null,
  setStep: (step) => set({ step }),
  setText: (text) => set({ text }),
  startBomResults: (matches, selectedExactIds, chosenAlternative) => {
    const lineRouting: Record<string, BomLineRouting> = {};
    matches.forEach((result) => {
      if (result.matchType === 'exact') lineRouting[result.line.id] = 'order';
      else if (result.matchType === 'alternative' || result.matchType === 'ai-suggested') lineRouting[result.line.id] = 'rfq';
    });
    set({ matches, selectedExactIds, chosenAlternative, lineRouting, customerTargetPrices: {}, designRequestLinks: {}, rfqSubmissionLinks: {}, step: 'results' });
  },
  toggleSelectedExact: (lineId) =>
    set({
      selectedExactIds: get().selectedExactIds.includes(lineId)
        ? get().selectedExactIds.filter((id) => id !== lineId)
        : [...get().selectedExactIds, lineId],
    }),
  chooseAlternativeFor: (lineId, productId) => set({ chosenAlternative: { ...get().chosenAlternative, [lineId]: productId } }),
  setLineRouting: (lineId, routing) => set({ lineRouting: { ...get().lineRouting, [lineId]: routing } }),
  setCustomerTargetPrice: (lineId, value) => set({ customerTargetPrices: { ...get().customerTargetPrices, [lineId]: value } }),
  linkDesignRequest: (link) => set({ designRequestLinks: { ...get().designRequestLinks, [link.lineId]: link } }),
  linkRfqSubmissions: (links) =>
    set({
      rfqSubmissionLinks: {
        ...get().rfqSubmissionLinks,
        ...Object.fromEntries(links.map((link) => [link.lineId, link])),
      },
    }),
  setRfq: (rfq) => set({ rfq }),
  setQuote: (quote) => set({ quote }),
  resetBomWorkflow: () =>
    set({
      step: 'input',
      text: '',
      matches: [],
      selectedExactIds: [],
      chosenAlternative: {},
      lineRouting: {},
      customerTargetPrices: {},
      designRequestLinks: {},
      rfqSubmissionLinks: {},
      rfq: null,
      quote: null,
    }),
  startFreshBom: () =>
    set({
      step: 'input',
      text: '',
      matches: [],
      selectedExactIds: [],
      chosenAlternative: {},
      lineRouting: {},
      customerTargetPrices: {},
      designRequestLinks: {},
      rfqSubmissionLinks: {},
    }),
}));
