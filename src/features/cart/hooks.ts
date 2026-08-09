import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCartStore } from '@/state';
import { getProductById } from '@/features/products/service';
import { computeSubtotal } from './service';
import type { CartLineView, Product } from '@/types';

/**
 * Cart lines = cart items (id + live quantity, from the store) joined with
 * product data (fetched once per distinct set of product IDs). Quantity
 * edits are pure client-side state changes, so they must NOT re-trigger the
 * async product fetch (which simulates real network latency) — otherwise
 * every +/- click would flash the whole cart back to a loading state.
 * Only adding/removing a line changes the query key below.
 */
export function useCartLines() {
  const items = useCartStore((s) => s.items);
  const productIdsKey = Array.from(new Set(items.map((i) => i.productId)))
    .sort((a, b) => a - b)
    .join(',');

  const query = useQuery({
    queryKey: ['cart-products', productIdsKey],
    queryFn: async () => {
      const uniqueIds = Array.from(new Set(items.map((i) => i.productId)));
      const products = await Promise.all(uniqueIds.map((id) => getProductById(id)));
      const map = new Map<number, Product>();
      products.forEach((p) => {
        if (p) map.set(p.id, p);
      });
      return map;
    },
    enabled: items.length > 0,
    placeholderData: (previous) => previous,
  });

  const productMap = query.data;

  const lines = useMemo<CartLineView[]>(() => {
    if (!productMap) return [];
    return items
      .map((item) => {
        const product = productMap.get(item.productId);
        if (!product) return null;
        return { product, quantity: item.quantity, lineTotal: product.price * item.quantity } satisfies CartLineView;
      })
      .filter((line): line is CartLineView => line !== null);
  }, [items, productMap]);

  return {
    lines,
    subtotal: computeSubtotal(lines),
    // Only a genuine first-load (no product data resolved yet) should show
    // the page-level skeleton — never a quantity-only update.
    isLoading: items.length > 0 && !productMap,
  };
}
