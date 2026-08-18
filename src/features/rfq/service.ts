import AsyncStorage from '@react-native-async-storage/async-storage';
import { delay } from '@/utils';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { computeGovernedPricing } from '@/features/pricing/service';
import { RFQ_STAGE_LABEL } from '@/constants/rfqLifecycle';
import type { Address, PaymentMethodSelection, Product, Quote, QuoteLine, Rfq, RfqLineItem, RfqSource, RfqStatus, ShippingMethodOption } from '@/types';

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
  const createdAt = new Date().toISOString();
  const rfq: Rfq = {
    id: `rfq-${Date.now()}`,
    rfqNumber: generateRfqNumber(),
    source,
    status: 'submitted',
    timeline: [{ status: 'submitted', label: RFQ_STAGE_LABEL.submitted, timestamp: createdAt }],
    createdAt,
    lines: rfqLines,
  };

  const history = await loadHistory();
  await saveHistory([rfq, ...history]);

  return rfq;
}

export async function getRfqById(id: string): Promise<Rfq | undefined> {
  await delay(200);
  const history = await loadHistory();
  return history.find((r) => r.id === id);
}

/**
 * Advances an RFQ to the next fulfillment stage and appends a timeline
 * entry — same shape as updateOrderStatus in features/orders/service.ts.
 * Driven by the buyer-facing quote/approval screen for the early stages and
 * by the Admin RFQ console (sales/procurement/logistics) for the rest.
 */
export async function advanceRfqStatus(id: string, status: RfqStatus): Promise<void> {
  await delay(400);
  const history = await loadHistory();
  const idx = history.findIndex((r) => r.id === id);
  if (idx < 0) return;
  const rfq = history[idx];
  const updated: Rfq = {
    ...rfq,
    status,
    timeline: [...rfq.timeline, { status, label: RFQ_STAGE_LABEL[status], timestamp: new Date().toISOString() }],
  };
  const next = [...history];
  next[idx] = updated;
  await saveHistory(next);
}

export interface PlaceRfqOrderInput {
  shippingAddress: Address;
  billingAddress: Address;
  shippingMethod: ShippingMethodOption;
  paymentMethod: PaymentMethodSelection;
}

/**
 * Completes the dedicated RFQ Cart/Checkout journey (app/(buyer)/rfq-cart,
 * app/(buyer)/rfq-checkout) — captures the buyer's fulfillment details onto
 * the RFQ record itself and advances it to 'processing', in one write.
 * Deliberately separate from features/orders/service.ts#createOrder: an
 * RFQ order is never added to useCartStore and never creates a normal
 * Order row — it stays tracked purely on this RFQ's own timeline through
 * shipped/delivered (see RFQ_STAGES in src/constants/rfqLifecycle.ts).
 */
export async function placeRfqOrder(id: string, input: PlaceRfqOrderInput): Promise<Rfq> {
  await delay(600);
  const history = await loadHistory();
  const idx = history.findIndex((r) => r.id === id);
  if (idx < 0) throw new Error('RFQ not found.');
  const rfq = history[idx];
  const status: RfqStatus = 'processing';
  const updated: Rfq = {
    ...rfq,
    ...input,
    status,
    timeline: [...rfq.timeline, { status, label: RFQ_STAGE_LABEL[status], timestamp: new Date().toISOString() }],
  };
  const next = [...history];
  next[idx] = updated;
  await saveHistory(next);
  return updated;
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
