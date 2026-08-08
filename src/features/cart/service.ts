import { getProductById } from '@/features/products/service';
import type { CartItem, CartLineView } from '@/types';

export async function resolveCartLines(items: CartItem[]): Promise<CartLineView[]> {
  const resolved = await Promise.all(
    items.map(async (item) => {
      const product = await getProductById(item.productId);
      if (!product) return null;
      return {
        product,
        quantity: item.quantity,
        lineTotal: product.price * item.quantity,
      } satisfies CartLineView;
    }),
  );
  return resolved.filter((line): line is CartLineView => line !== null);
}

export function computeSubtotal(lines: CartLineView[]): number {
  return lines.reduce((sum, line) => sum + line.lineTotal, 0);
}
