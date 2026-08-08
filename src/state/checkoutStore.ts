import { create } from 'zustand';
import type { Address, PaymentMethodSelection, ShippingMethodOption } from '@/types';

interface CheckoutState {
  shippingAddress: Address | null;
  billingAddress: Address | null;
  billingSameAsShipping: boolean;
  shippingMethod: ShippingMethodOption | null;
  paymentMethod: PaymentMethodSelection | null;
  setShippingAddress: (address: Address) => void;
  setBillingAddress: (address: Address | null) => void;
  setBillingSameAsShipping: (value: boolean) => void;
  setShippingMethod: (method: ShippingMethodOption) => void;
  setPaymentMethod: (method: PaymentMethodSelection) => void;
  reset: () => void;
}

export const useCheckoutStore = create<CheckoutState>()((set) => ({
  shippingAddress: null,
  billingAddress: null,
  billingSameAsShipping: true,
  shippingMethod: null,
  paymentMethod: null,
  setShippingAddress: (address) => set({ shippingAddress: address }),
  setBillingAddress: (address) => set({ billingAddress: address }),
  setBillingSameAsShipping: (value) => set({ billingSameAsShipping: value }),
  setShippingMethod: (method) => set({ shippingMethod: method }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  reset: () =>
    set({
      shippingAddress: null,
      billingAddress: null,
      billingSameAsShipping: true,
      shippingMethod: null,
      paymentMethod: null,
    }),
}));
