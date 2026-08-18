import { useMemo } from 'react';
import { View } from 'react-native';
import { colors, radius, spacing, MDCard, MDText } from '@/design-system';
import { computeGovernedPricing } from '@/features/pricing/service';
import { MDManufacturerLogo } from '@/components/MDManufacturerLogo';
import { formatDisplayPrice } from '@/utils';
import { useCurrencyStore } from '@/state';
import type { Rfq } from '@/types';

/**
 * Governed-pricing order summary for the dedicated RFQ Cart/Checkout
 * journey — recomputes pricing straight from the persisted Rfq record via
 * computeGovernedPricing (src/features/pricing/service.ts, the same engine
 * rfqService.generateQuote uses) rather than depending on the ephemeral
 * session Quote in bomWorkflowStore, so it works after a reload or when
 * revisiting an RFQ days later. Shared by app/(buyer)/rfq-cart/[id].tsx and
 * app/(buyer)/rfq-checkout/[id].tsx.
 */
export function RfqOrderSummary({ rfq }: { rfq: Rfq }) {
  const displayCurrency = useCurrencyStore((s) => s.currency);

  const { lines, currency, subtotal } = useMemo(() => {
    const priced = rfq.lines.map((line) => ({
      ...line,
      pricing: computeGovernedPricing(line.product, line.quantity),
    }));
    return {
      lines: priced,
      currency: priced[0]?.pricing.currency ?? 'INR',
      subtotal: priced.reduce((sum, l) => sum + l.pricing.approvedLineTotal, 0),
    };
  }, [rfq.lines]);

  return (
    <MDCard padding="lg" style={{ marginBottom: spacing.lg }}>
      <MDText variant="h4" style={{ marginBottom: spacing.md }}>
        RFQ {rfq.rfqNumber}
      </MDText>
      <View style={{ gap: spacing.md, marginBottom: spacing.md }}>
        {lines.map((line) => (
          <View key={line.productId} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <MDManufacturerLogo manufacturer={line.product.manufacturer} width={64} height={16} />
            <View style={{ flex: 1 }}>
              <MDText variant="bodySm" weight="600">
                {line.product.manufacturerPartNumber}
              </MDText>
              <MDText variant="caption" tone="tertiary">
                Qty {line.quantity} · {line.product.productType}
              </MDText>
            </View>
            <MDText variant="bodySm" weight="700">
              {formatDisplayPrice(line.pricing.approvedLineTotal, currency, displayCurrency)}
            </MDText>
          </View>
        ))}
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: spacing.md,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <MDText variant="bodyMedium" weight="700">
          Governed Subtotal
        </MDText>
        <MDText variant="h4">{formatDisplayPrice(subtotal, currency, displayCurrency)}</MDText>
      </View>
    </MDCard>
  );
}
