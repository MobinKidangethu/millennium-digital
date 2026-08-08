import type { PaymentMethodType, ShippingMethodOption } from '@/types';

export const SHIPPING_METHODS: ShippingMethodOption[] = [
  {
    id: 'standard',
    label: 'Standard Shipping',
    description: 'Delivered in 5–7 business days',
    etaDays: '5–7 business days',
    cost: 0,
  },
  {
    id: 'express',
    label: 'Express Shipping',
    description: 'Delivered in 2–3 business days',
    etaDays: '2–3 business days',
    cost: 149,
  },
  {
    id: 'priority',
    label: 'Priority Shipping',
    description: 'Delivered next business day',
    etaDays: '1 business day',
    cost: 349,
  },
];

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
  { type: 'wallet', label: 'Wallet', description: 'Digital wallet balance', icon: 'wallet-outline' },
  {
    type: 'purchase-order',
    label: 'Purchase Order',
    description: 'Enterprise accounts with an approved PO',
    icon: 'document-text-outline',
  },
];

export const TAX_RATE = 0.18;
