import { ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, MDText } from '@/design-system';
import { GOVERNANCE_STAGE_LABEL, GOVERNANCE_STAGE_ORDER } from '@/features/governance/service';
import type { GovernanceStage } from '@/types';

interface GovernanceTrackerProps {
  stage: GovernanceStage;
  compact?: boolean;
}

/**
 * Visualizes the Millennium Digital Maker-Checker governance pipeline:
 * Draft -> Submitted -> Maker Validated -> Checker Validated ->
 * Business Approved -> Published. Used on admin product review and can be
 * reused for pricing/supplier/release approvals (same GovernanceStage type).
 */
export function GovernanceTracker({ stage, compact }: GovernanceTrackerProps) {
  const currentIndex = GOVERNANCE_STAGE_ORDER.indexOf(stage);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs }}>
        {GOVERNANCE_STAGE_ORDER.map((step, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;
          const isLast = index === GOVERNANCE_STAGE_ORDER.length - 1;
          return (
            <View key={step} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ alignItems: 'center', width: compact ? 76 : 96 }}>
                <View
                  style={{
                    width: compact ? 22 : 26,
                    height: compact ? 22 : 26,
                    borderRadius: radius.pill,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: done ? colors.status.success : active ? colors.brand.primary : colors.gray[100],
                  }}
                >
                  {done ? (
                    <Ionicons name="checkmark" size={14} color={colors.gray[0]} />
                  ) : (
                    <MDText variant="caption" weight="700" style={{ color: active ? colors.gray[0] : colors.text.tertiary }}>
                      {index + 1}
                    </MDText>
                  )}
                </View>
                <MDText
                  variant="caption"
                  weight={active ? '700' : '400'}
                  tone={active ? 'primary' : done ? 'secondary' : 'tertiary'}
                  align="center"
                  style={{ marginTop: 4 }}
                  numberOfLines={2}
                >
                  {GOVERNANCE_STAGE_LABEL[step]}
                </MDText>
              </View>
              {!isLast ? (
                <View
                  style={{
                    width: compact ? 20 : 32,
                    height: 2,
                    backgroundColor: done ? colors.status.success : colors.gray[100],
                    marginBottom: 18,
                  }}
                />
              ) : null}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
