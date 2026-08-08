export type PaymentMethodType =
  | 'credit-card'
  | 'debit-card'
  | 'upi'
  | 'net-banking'
  | 'wallet'
  | 'purchase-order';

export interface PaymentMethodSelection {
  type: PaymentMethodType;
  label: string;
  /** last 4 digits / UPI id / PO number — masked display only, never a real credential */
  reference?: string;
}

export interface ShippingMethodOption {
  id: string;
  label: string;
  description: string;
  etaDays: string;
  cost: number;
}

export type OrderStatus =
  | 'placed'
  | 'processing'
  | 'shipped'
  | 'out-for-delivery'
  | 'delivered'
  | 'cancelled';

export interface OrderLineItem {
  productId: number;
  manufacturer: string;
  manufacturerPartNumber: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
}

export interface OrderTimelineEntry {
  status: OrderStatus;
  label: string;
  timestamp: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderLineItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  currency: string;
  shippingAddress: import('./user').Address;
  billingAddress: import('./user').Address;
  shippingMethod: ShippingMethodOption;
  paymentMethod: PaymentMethodSelection;
  status: OrderStatus;
  timeline: OrderTimelineEntry[];
  placedAt: string;
  estimatedDelivery: string;
}
