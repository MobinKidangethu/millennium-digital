import { create } from 'zustand';
import type { Address, PaymentMethodSelection, ShippingMethodOption } from '@/types';

/**
 * Same shape as useCheckoutStore (src/state/checkoutStore.ts) but a fully
 * separate instance, used only by the dedicated RFQ Cart/Checkout journey
 * (app/(buyer)/rfq-cart, app/(buyer)/rfq-checkout). Keeping it separate
 * means an in-progress normal-order checkout and an in-progress RFQ
 * checkout can never clobber each other's address/shipping/payment
 * selections, and an RFQ never touches the normal buyer cart/checkout state.
 */
interface RfqCheckoutState {
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

export const useRfqCheckoutStore = create<RfqCheckoutState>()((set) => ({
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
