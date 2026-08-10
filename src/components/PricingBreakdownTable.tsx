import { View } from 'react-native';
import { colors, radius, spacing, MDText } from '@/design-system';
import { formatDisplayPrice } from '@/utils';
import { useCurrencyStore } from '@/state';
import { ProtoBadge } from './ProtoBadge';
import type { PricingBreakdown } from '@/types';

export function PricingBreakdownTable({ pricing, showBadge = true }: { pricing: PricingBreakdown; showBadge?: boolean }) {
  const displayCurrency = useCurrencyStore((s) => s.currency);
  return (
    <View>
      {showBadge ? <ProtoBadge label="Demo pricing rules — not official commercial terms" /> : null}
      <View
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.md,
          overflow: 'hidden',
          marginTop: spacing.sm,
        }}
      >
        {pricing.steps.map((step, index) => (
          <View
            key={step.key}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.md,
              backgroundColor: index % 2 === 0 ? colors.surface : colors.surfaceRaised,
              gap: spacing.sm,
            }}
          >
            <View style={{ flex: 1 }}>
              <MDText variant="bodySm" weight="600">
                {step.label}
              </MDText>
              <MDText variant="caption" tone="tertiary" numberOfLines={1}>
                {step.description}
              </MDText>
            </View>
            {step.deltaPct != null ? (
              <MDText
                variant="caption"
                weight="600"
                style={{ color: step.deltaPct < 0 ? colors.status.success : colors.text.tertiary }}
              >
                {step.deltaPct > 0 ? '+' : ''}
                {step.deltaPct}%
              </MDText>
            ) : null}
            <MDText variant="bodySm" weight="700" style={{ minWidth: 84, textAlign: 'right' }}>
              {formatDisplayPrice(step.unitPriceAfter, pricing.currency, displayCurrency)}
            </MDText>
          </View>
        ))}
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: spacing.md,
          padding: spacing.md,
          backgroundColor: colors.brand.primarySoft,
          borderRadius: radius.md,
        }}
      >
        <View>
          <MDText variant="bodySm" weight="600" style={{ color: colors.brand.primary }}>
            Approved Unit Price × {pricing.quantity}
          </MDText>
          <MDText variant="caption" tone="secondary">
            Governed price after all applicable rules
          </MDText>
        </View>
        <MDText variant="h4" style={{ color: colors.brand.primary }}>
          {formatDisplayPrice(pricing.approvedLineTotal, pricing.currency, displayCurrency)}
        </MDText>
      </View>
    </View>
  );
}
