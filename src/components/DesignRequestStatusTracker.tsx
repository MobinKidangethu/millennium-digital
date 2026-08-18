import { ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, MDText } from '@/design-system';
import { DESIGN_REQUEST_STAGES, designRequestStageIndex } from '@/constants/designRequestLifecycle';
import type { DesignRequestStatus } from '@/types';

/**
 * Horizontal stepper for a Design Request's review pipeline — same
 * node/connector visual language as RfqStatusTracker/LogisticsTracker so
 * all three read as one family.
 */
export function DesignRequestStatusTracker({ status }: { status: DesignRequestStatus }) {
  const currentIndex = designRequestStageIndex(status);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', paddingVertical: spacing.sm }}>
        {DESIGN_REQUEST_STAGES.map((stage, index) => {
          const done = index <= currentIndex;
          const active = index === currentIndex;
          const isLast = index === DESIGN_REQUEST_STAGES.length - 1;
          return (
            <View key={stage.key} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View style={{ alignItems: 'center', width: 120 }}>
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
