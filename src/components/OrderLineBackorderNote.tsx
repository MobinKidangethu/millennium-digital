import { useProduct } from '@/features/products';
import { BackorderNote } from './BackorderNote';

/**
 * Order line items (OrderLineItem) only store a snapshot — productId,
 * quantity, price at time of order — not live stock. Since there's no real
 * inventory decrement on order yet (see project inventory-sync note),
 * current availability is looked up live so the same backorder rule shown
 * at Add to Cart also shows up consistently on every order view (buyer
 * order history, admin order detail, seller orders).
 */
export function OrderLineBackorderNote({ productId, quantity }: { productId: number; quantity: number }) {
  const { data: product } = useProduct(productId);
  if (!product) return null;
  return <BackorderNote product={product} quantity={quantity} size="xs" />;
}
