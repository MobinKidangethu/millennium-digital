import { ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, MDText } from '@/design-system';
import { RFQ_STAGES, rfqStageIndex } from '@/constants/rfqLifecycle';
import type { RfqStatus } from '@/types';

/**
 * Horizontal fulfillment stepper for an RFQ's full lifecycle — same
 * node/connector visual language as LogisticsTracker (src/components/
 * LogisticsTracker.tsx) so the two read as one family, extended with the
 * pre-order sales/procurement stages an RFQ needs before it ships.
 * PROTOTYPE: stages are advanced manually (buyer approval + Admin RFQ
 * console), not driven by a live sales/ERP system — see ProtoBadge on the
 * screens that render this.
 */
export function RfqStatusTracker({ status }: { status: RfqStatus }) {
  if (status === 'cancelled') {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, backgroundColor: colors.status.errorSoft, borderRadius: radius.md }}>
        <Ionicons name="close-circle-outline" size={18} color={colors.status.errorStrong} />
        <MDText variant="bodySm" style={{ color: colors.status.errorStrong }}>
          This RFQ was cancelled.
        </MDText>
      </View>
    );
  }

  const currentIndex = rfqStageIndex(status);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', paddingVertical: spacing.sm }}>
        {RFQ_STAGES.map((stage, index) => {
          const done = index <= currentIndex;
          const active = index === currentIndex;
          const isLast = index === RFQ_STAGES.length - 1;
          return (
            <View key={stage.key} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View style={{ alignItems: 'center', width: 100 }}>
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
                  numberOfLines={3}
                  style={{ marginTop: 4 }}
                >
                  {stage.label}
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
