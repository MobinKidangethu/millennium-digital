import { useQuery } from '@tanstack/react-query';
import { useCartStore } from '@/state';
import { computeSubtotal, resolveCartLines } from './service';

export function useCartLines() {
  const items = useCartStore((s) => s.items);
  const itemsKey = items.map((i) => `${i.productId}:${i.quantity}`).join(',');

  const query = useQuery({
    queryKey: ['cart-lines', itemsKey],
    queryFn: () => resolveCartLines(items),
  });

  const lines = query.data ?? [];
  return {
    lines,
    subtotal: computeSubtotal(lines),
    isLoading: query.isLoading,
  };
}
