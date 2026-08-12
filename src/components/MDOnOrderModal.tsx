import { View } from 'react-native';
import { colors, radius, spacing, MDModal, MDText } from '@/design-system';
import { getFactoryLeadTimeWeeks } from '@/utils';
import { ProtoBadge } from './ProtoBadge';
import type { Product } from '@/types';

interface MDOnOrderModalProps {
  visible: boolean;
  onClose: () => void;
  product: Product;
  shipNow: number;
  backordered: number;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}>
      <MDText variant="bodySm" tone="secondary">
        {label}
      </MDText>
      <MDText variant="bodySm" weight="600" style={{ flexShrink: 1, textAlign: 'right' }}>
        {value}
      </MDText>
    </View>
  );
}

/**
 * Explains a split order (some units ship now, the rest are back-ordered)
 * — shown from the "Details" link on the product detail page whenever the
 * requested quantity exceeds current stock. Factory Lead Time and the
 * back-order notification process are simulated (see ProtoBadge below);
 * there is no live ERP/supplier lead-time feed or outbound email system
 * behind this yet.
 */
export function MDOnOrderModal({ visible, onClose, product, shipNow, backordered }: MDOnOrderModalProps) {
  const leadTimeWeeks = getFactoryLeadTimeWeeks(product.id);
  const stock = product.availability ?? 0;

  return (
    <MDModal visible={visible} onClose={onClose} title="On Order" maxWidth={440}>
      <View style={{ gap: spacing.lg }}>
        <View style={{ gap: spacing.sm }}>
          <MDText variant="overline" tone="tertiary">
            Details
          </MDText>
          <View
            style={{
              gap: spacing.xs,
              padding: spacing.md,
              borderRadius: radius.md,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <DetailRow label="MD#:" value={product.mdPartNumber || '—'} />
            <DetailRow label="Mfr.'s Part No:" value={product.manufacturerPartNumber} />
            <DetailRow label="Description:" value={product.title} />
            <DetailRow label="Stock:" value={`${stock.toLocaleString()} Can Dispatch Immediately`} />
            <DetailRow label="Factory Lead Time:" value={`${leadTimeWeeks} Weeks`} />
          </View>
        </View>

        <View style={{ gap: spacing.sm }}>
          <MDText variant="overline" tone="tertiary">
            Back-Orders
          </MDText>
          <MDText variant="bodySm" tone="secondary">
            Your requested quantity is more than what we currently have on the shelf. {shipNow.toLocaleString()}{' '}
            unit{shipNow === 1 ? '' : 's'} will ship immediately from available stock, and the remaining{' '}
            {backordered.toLocaleString()} unit{backordered === 1 ? '' : 's'} will be back-ordered against the
            manufacturer's factory lead time above.
          </MDText>
          <MDText variant="bodySm" tone="secondary">
            You'll be notified by email as soon as the back-ordered units ship, and the two shipments won't incur
            any extra shipping charges.
          </MDText>
        </View>

        <ProtoBadge label="Prototype simulation — lead time & notification flow are demo data" />
      </View>
    </MDModal>
  );
}
