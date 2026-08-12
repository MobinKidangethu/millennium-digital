import { useState } from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, MDText } from '@/design-system';
import { computeBackorderSplit } from '@/utils';
import { MDOnOrderModal } from './MDOnOrderModal';
import type { Product } from '@/types';

/**
 * Shared "N ship now · M back-ordered" indicator — same backorder rule used
 * on the product detail page (see src/utils/backorder.ts), reused anywhere
 * a specific ordered quantity is shown against a product: cart lines, and
 * order line items across buyer/admin/seller order views. Renders nothing
 * when the line isn't actually back-ordered.
 */
export function BackorderNote({ product, quantity, size = 'sm' }: { product: Product; quantity: number; size?: 'sm' | 'xs' }) {
  const [open, setOpen] = useState(false);
  const split = computeBackorderSplit(quantity, product.availability ?? 0);

  if (!split.hasBackorder) return null;

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2, flexWrap: 'wrap' }}
      >
        <Ionicons name="warning-outline" size={size === 'xs' ? 11 : 12} color={colors.status.warningStrong} />
        <MDText variant="caption" weight="600" style={{ color: colors.status.warningStrong }}>
          {split.shipNow.toLocaleString()} ship now · {split.backordered.toLocaleString()} back-ordered
        </MDText>
        <MDText
          variant="caption"
          weight="700"
          style={{ color: colors.status.warningStrong, textDecorationLine: 'underline' }}
        >
          Details
        </MDText>
      </Pressable>
      <MDOnOrderModal
        visible={open}
        onClose={() => setOpen(false)}
        product={product}
        shipNow={split.shipNow}
        backordered={split.backordered}
      />
    </>
  );
}
