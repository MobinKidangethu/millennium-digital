import { useMemo } from 'react';
import { useProductsAdmin } from '@/features/products';
import { useAllOrders } from '@/features/orders';
import { useRfqs } from '@/features/rfq';
import type { Order, OrderLineItem, Rfq, RfqLineItem } from '@/types';

/**
 * Seller-scoped read views over the platform-wide product/order/RFQ data —
 * filtered client-side by the seller's authorized manufacturer/brand
 * name(s) (session.user.sellerManufacturers). A production SellerService
 * would push this filter server-side; the shape here is designed so that
 * swap doesn't change any UI consuming these hooks.
 */

export function useSellerProducts(manufacturers: string[]) {
  const query = useProductsAdmin({});
  const key = manufacturers.join('|');
  const data = useMemo(
    () => query.data?.filter((p) => manufacturers.includes(p.manufacturer)) ?? [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query.data, key],
  );
  return { ...query, data };
}

export interface SellerOrderView {
  order: Order;
  myItems: OrderLineItem[];
  myTotal: number;
}

export function useSellerOrders(manufacturers: string[]) {
  const query = useAllOrders();
  const key = manufacturers.join('|');
  const data = useMemo<SellerOrderView[]>(() => {
    if (!query.data) return [];
    return query.data
      .map((order) => {
        const myItems = order.items.filter((i) => manufacturers.includes(i.manufacturer));
        return { order, myItems, myTotal: myItems.reduce((sum, i) => sum + i.price * i.quantity, 0) };
      })
      .filter((v) => v.myItems.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data, key]);
  return { ...query, data };
}

export interface SellerRfqView {
  rfq: Rfq;
  myLines: RfqLineItem[];
}

export function useSellerRfqs(manufacturers: string[]) {
  const query = useRfqs();
  const key = manufacturers.join('|');
  const data = useMemo<SellerRfqView[]>(() => {
    if (!query.data) return [];
    return query.data
      .map((rfq) => ({ rfq, myLines: rfq.lines.filter((l) => manufacturers.includes(l.product.manufacturer)) }))
      .filter((v) => v.myLines.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data, key]);
  return { ...query, data };
}
