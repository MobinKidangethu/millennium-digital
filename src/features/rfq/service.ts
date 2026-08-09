import AsyncStorage from '@react-native-async-storage/async-storage';
import { delay } from '@/utils';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { computeGovernedPricing } from '@/features/pricing/service';
import type { Product, Quote, QuoteLine, Rfq, RfqLineItem, RfqSource } from '@/types';

/**
 * PROTOTYPE / DEMO RFQ + Quote generation.
 *
 * The active RFQ a buyer is working through (BOM/AI Search → RFQ → quote →
 * cart) still lives in bomWorkflowStore for the current session, unchanged.
 * Alongside that, every created RFQ is also appended to a lightweight
 * AsyncStorage-backed history list (getRfqs()) purely so "My RFQs" in the
 * account section has something real to show — it does not replace or feed
 * back into the single-slot workflow store. Target production architecture
 * routes createRfq()/generateQuote() through an RFQService + QuoteService
 * backed by supplier commercial systems, with the same shape.
 */

let rfqCounter = 0;
let quoteCounter = 0;
let historyCache: Rfq[] | null = null;

async function loadHistory(): Promise<Rfq[]> {
  if (historyCache) return historyCache;
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.rfqs);
  historyCache = raw ? JSON.parse(raw) : [];
  return historyCache!;
}

async function saveHistory(list: Rfq[]): Promise<void> {
  historyCache = list;
  await AsyncStorage.setItem(STORAGE_KEYS.rfqs, JSON.stringify(list));
}

export async function getRfqs(): Promise<Rfq[]> {
  await delay(250);
  const list = await loadHistory();
  return [...list].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

function generateRfqNumber(): string {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  return `RFQ-${stamp}-${String(++rfqCounter).padStart(3, '0')}`;
}

function generateQuoteNumber(): string {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  return `QT-${stamp}-${String(++quoteCounter).padStart(3, '0')}`;
}

export interface RfqLineInput {
  product: Product;
  quantity: number;
}

export async function createRfq(lines: RfqLineInput[], source: RfqSource): Promise<Rfq> {
  await delay(500);
  const rfqLines: RfqLineItem[] = lines.map((l) => ({ productId: l.product.id, product: l.product, quantity: l.quantity }));
  const rfq: Rfq = {
    id: `rfq-${Date.now()}`,
    rfqNumber: generateRfqNumber(),
    source,
    status: 'submitted',
    createdAt: new Date().toISOString(),
    lines: rfqLines,
  };

  const history = await loadHistory();
  await saveHistory([rfq, ...history]);

  return rfq;
}

export async function generateQuote(rfq: Rfq): Promise<Quote> {
  await delay(900);
  const currency = rfq.lines[0]?.product.currency ?? 'INR';
  const lines: QuoteLine[] = rfq.lines.map((l) => ({
    productId: l.productId,
    product: l.product,
    quantity: l.quantity,
    pricing: computeGovernedPricing(l.product, l.quantity),
  }));
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 14);

  return {
    id: `quote-${Date.now()}`,
    quoteNumber: generateQuoteNumber(),
    rfqId: rfq.id,
    createdAt: new Date().toISOString(),
    validUntil: validUntil.toISOString(),
    lines,
    currency,
    subtotal: lines.reduce((sum, l) => sum + l.pricing.approvedLineTotal, 0),
  };
}
