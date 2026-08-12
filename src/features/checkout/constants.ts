import type { PaymentMethodType, ShippingMethodOption } from '@/types';

export const SHIPPING_METHODS: ShippingMethodOption[] = [
  {
    id: 'standard',
    label: 'Standard (5–7 Business Days)',
    description: 'Delivered in 5–7 business days',
    etaDays: '5–7 business days',
    cost: 0,
  },
  {
    id: 'express',
    label: 'Expedited (2–3 Business Days)',
    description: 'Delivered in 2–3 business days',
    etaDays: '2–3 business days',
    cost: 1503,
  },
  {
    id: 'priority',
    label: 'Overnight (Next Business Day)',
    description: 'Delivered next business day',
    etaDays: '1 business day',
    cost: 3507,
  },
];

export interface ShippingMethodDetail {
  incotermsNote: string;
  headline: string;
  body: string;
  carrierName: string;
  carrierNote: string;
}

/**
 * Demo/prototype logistics reference info shown under the selected shipping
 * method — one entry per SHIPPING_METHODS id, each with its own carrier and
 * ETA note consistent with that method's own delivery window. (Previously
 * all three tiers rendered the same fixed FedEx/UPS/DHL card list, which
 * meant e.g. "Overnight" showed a "12 to 14 days" UPS option — a genuine
 * content bug, not just cosmetic duplication.) Not a live carrier-rate
 * integration — see PROTOTYPE/PRODUCTION note in shipping.tsx.
 */
export const SHIPPING_METHOD_DETAILS: Record<string, ShippingMethodDetail> = {
  standard: {
    incotermsNote: 'Incoterms: FCA — Duty, customs and taxes collected at the time of delivery.',
    headline: 'International Shipping Charges',
    body: 'We ship Standard orders via UPS, FedEx or DHL economy service to most locations worldwide at special low prices.',
    carrierName: 'UPS / FedEx / DHL Economy Service',
    carrierNote: 'No handling fees — delivered in 5 to 7 business days from dispatch.',
  },
  express: {
    incotermsNote: 'Incoterms: FCA — Duty, customs and taxes collected at the time of delivery.',
    headline: 'Expedited Dispatch',
    body: 'Tracked, signature-required delivery via our expedited courier partner network.',
    carrierName: 'FedEx International Priority',
    carrierNote: 'Delivered in 2 to 3 business days from dispatch. Ships same day for orders placed before 2:00 PM local time.',
  },
  priority: {
    incotermsNote: 'Incoterms: FCA — Duty, customs and taxes collected at the time of delivery.',
    headline: 'Priority Air Courier',
    body: 'Guaranteed next-business-day delivery for eligible postal codes via priority air courier.',
    carrierName: 'DHL International Express',
    carrierNote: 'Order before 12:00 PM local time to qualify for next-business-day delivery.',
  },
};

export interface PaymentMethodOption {
  type: PaymentMethodType;
  label: string;
  description: string;
  icon: string;
}

export const PAYMENT_METHOD_OPTIONS: PaymentMethodOption[] = [
  { type: 'credit-card', label: 'Credit Card', description: 'Visa, Mastercard, Amex', icon: 'card-outline' },
  { type: 'debit-card', label: 'Debit Card', description: 'All major banks', icon: 'card-outline' },
  { type: 'upi', label: 'UPI', description: 'Pay via any UPI app', icon: 'phone-portrait-outline' },
  { type: 'net-banking', label: 'Net Banking', description: 'Direct bank transfer', icon: 'business-outline' },
  {
    type: 'purchase-order',
    label: 'Purchase Order',
    description: 'Enterprise accounts with an approved PO',
    icon: 'document-text-outline',
  },
];

export const TAX_RATE = 0.18;
