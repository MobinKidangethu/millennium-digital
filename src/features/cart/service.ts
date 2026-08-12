import { getProductById } from '@/features/products/service';
import { computeGovernedPricing, GOVERNED_PRICING_MIN_QTY } from '@/features/pricing/service';
import type { CartItem, CartLineView } from '@/types';

export async function resolveCartLines(items: CartItem[]): Promise<CartLineView[]> {
  const resolved = await Promise.all(
    items.map(async (item) => {
      const product = await getProductById(item.productId);
      if (!product) return null;
      if (item.quantity >= GOVERNED_PRICING_MIN_QTY) {
        const governedPricing = computeGovernedPricing(product, item.quantity);
        return {
          product,
          quantity: item.quantity,
          unitPrice: governedPricing.approvedUnitPrice,
          lineTotal: governedPricing.approvedLineTotal,
          governedPricing,
        } satisfies CartLineView;
      }
      return {
        product,
        quantity: item.quantity,
        unitPrice: product.price,
        lineTotal: product.price * item.quantity,
      } satisfies CartLineView;
    }),
  );
  return resolved.filter((line): line is CartLineView => line !== null);
}

export function computeSubtotal(lines: CartLineView[]): number {
  return lines.reduce((sum, line) => sum + line.lineTotal, 0);
}
