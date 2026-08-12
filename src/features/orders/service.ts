import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { delay } from '@/utils';
import { TAX_RATE } from '@/features/checkout/constants';
import type { Address, CartLineView, Order, OrderStatus, PaymentMethodSelection, ShippingMethodOption } from '@/types';

let ordersCache: Order[] | null = null;

async function loadOrders(): Promise<Order[]> {
  if (ordersCache) return ordersCache;
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.orders);
  ordersCache = raw ? JSON.parse(raw) : [];
  return ordersCache!;
}

async function saveOrders(orders: Order[]): Promise<void> {
  ordersCache = orders;
  await AsyncStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(orders));
}

function generateOrderNumber(): string {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `MD-${stamp}-${rand}`;
}

function estimateDelivery(etaDays: string): string {
  const match = etaDays.match(/(\d+)/g);
  const maxDays = match ? Number(match[match.length - 1]) : 7;
  const date = new Date();
  date.setDate(date.getDate() + maxDays);
  return date.toISOString();
}

export interface CreateOrderInput {
  userId: string;
  lines: CartLineView[];
  shippingAddress: Address;
  billingAddress: Address;
  shippingMethod: ShippingMethodOption;
  paymentMethod: PaymentMethodSelection;
  currency: string;
  /** Promo code discount carried from checkout (see PromoCodeField / promotionsService), if any. */
  discountTotal?: number;
  promoCode?: string;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  await delay(700);

  const subtotal = input.lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const discountTotal = input.discountTotal ? Math.min(input.discountTotal, subtotal) : 0;
  const total = Math.max(
    0,
    Math.round((subtotal + tax + input.shippingMethod.cost - discountTotal) * 100) / 100,
  );
  const placedAt = new Date().toISOString();

  const order: Order = {
    id: `order-${Date.now()}`,
    orderNumber: generateOrderNumber(),
    userId: input.userId,
    items: input.lines.map((l) => ({
      productId: l.product.id,
      manufacturer: l.product.manufacturer,
      manufacturerPartNumber: l.product.manufacturerPartNumber,
      title: l.product.title,
      image: l.product.image,
      price: l.unitPrice,
      quantity: l.quantity,
    })),
    subtotal,
    shippingCost: input.shippingMethod.cost,
    tax,
    ...(discountTotal > 0 ? { discountTotal, promoCode: input.promoCode } : {}),
    total,
    currency: input.currency,
    shippingAddress: input.shippingAddress,
    billingAddress: input.billingAddress,
    shippingMethod: input.shippingMethod,
    paymentMethod: input.paymentMethod,
    status: 'placed',
    timeline: [{ status: 'placed', label: 'Order Placed', timestamp: placedAt }],
    placedAt,
    estimatedDelivery: estimateDelivery(input.shippingMethod.etaDays),
  };

  const orders = await loadOrders();
  await saveOrders([order, ...orders]);
  return order;
}

export async function getOrders(userId: string): Promise<Order[]> {
  await delay(300);
  const orders = await loadOrders();
  return orders
    .filter((o) => o.userId === userId)
    .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  await delay(200);
  const orders = await loadOrders();
  return orders.find((o) => o.id === id);
}

/** Admin-facing: every order across every customer. */
export async function getAllOrders(): Promise<Order[]> {
  await delay(300);
  const orders = await loadOrders();
  return [...orders].sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  await delay(400);
  const orders = await loadOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx < 0) return;
  const order = orders[idx];
  const updated: Order = {
    ...order,
    status,
    timeline: [...order.timeline, { status, label: STATUS_LABEL[status], timestamp: new Date().toISOString() }],
  };
  const next = [...orders];
  next[idx] = updated;
  await saveOrders(next);
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  placed: 'Order Placed',
  processing: 'Processing',
  shipped: 'Shipped',
  'out-for-delivery': 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export async function cancelOrder(id: string): Promise<void> {
  await delay(400);
  const orders = await loadOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx < 0) return;
  const order = orders[idx];
  if (order.status !== 'placed' && order.status !== 'processing') {
    throw new Error('This order can no longer be cancelled.');
  }
  const updated: Order = {
    ...order,
    status: 'cancelled',
    timeline: [...order.timeline, { status: 'cancelled', label: STATUS_LABEL.cancelled, timestamp: new Date().toISOString() }],
  };
  const next = [...orders];
  next[idx] = updated;
  await saveOrders(next);
}
