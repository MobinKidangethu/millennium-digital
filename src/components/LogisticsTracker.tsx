import { ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, MDText } from '@/design-system';
import type { OrderStatus } from '@/types';

const STEPS = ['Order Placed', 'Payment Confirmed', 'Supplier Processing', 'Packed', 'Shipped', 'In Transit', 'Delivered'] as const;

/** Index of the last completed logistics step for a given order status. */
const STATUS_STEP: Record<OrderStatus, number> = {
  placed: 1,
  processing: 3,
  shipped: 4,
  'out-for-delivery': 5,
  delivered: 6,
  cancelled: -1,
};

/**
 * Derived, presentational logistics view over the existing OrderStatus
 * model — no new data is invented. PROTOTYPE: a real Logistics/WMS
 * integration would drive each of these steps from live carrier events.
 */
export function LogisticsTracker({ status }: { status: OrderStatus }) {
  if (status === 'cancelled') {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, backgroundColor: colors.status.errorSoft, borderRadius: radius.md }}>
        <Ionicons name="close-circle-outline" size={18} color={colors.status.errorStrong} />
        <MDText variant="bodySm" style={{ color: colors.status.errorStrong }}>
          This order was cancelled before fulfillment.
        </MDText>
      </View>
    );
  }

  const currentIndex = STATUS_STEP[status];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', paddingVertical: spacing.sm }}>
        {STEPS.map((step, index) => {
          const done = index <= currentIndex;
          const active = index === currentIndex;
          const isLast = index === STEPS.length - 1;
          return (
            <View key={step} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View style={{ alignItems: 'center', width: 84 }}>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: radius.pill,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: done ? colors.brand.primary : colors.gray[100],
                  }}
                >
                  {done ? (
                    <Ionicons name={active ? 'ellipse' : 'checkmark'} size={active ? 8 : 13} color={colors.gray[0]} />
                  ) : (
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.gray[400] }} />
                  )}
                </View>
                <MDText
                  variant="caption"
                  weight={active ? '700' : '400'}
                  tone={done ? 'primary' : 'tertiary'}
                  align="center"
                  numberOfLines={2}
                  style={{ marginTop: 4 }}
                >
                  {step}
                </MDText>
              </View>
              {!isLast ? <View style={{ width: 20, height: 2, backgroundColor: done && index < currentIndex ? colors.brand.primary : colors.gray[100], marginTop: 11 }} /> : null}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
