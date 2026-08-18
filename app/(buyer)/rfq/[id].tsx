import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  layout,
  radius,
  spacing,
  useToast,
  MDBadge,
  MDButton,
  MDCard,
  MDEmptyState,
  MDText,
} from '@/design-system';
import { rfqService } from '@/features/rfq';
import { useBomWorkflowStore, useCurrencyStore } from '@/state';
import { ProtoBadge } from '@/components/ProtoBadge';
import { PricingBreakdownTable } from '@/components/PricingBreakdownTable';
import { MDManufacturerLogo } from '@/components/MDManufacturerLogo';
import { ProductPreviewVideo } from '@/components/ProductPreviewVideo';
import { RFQ_STAGES, RFQ_STAGE_LABEL, RFQ_STATUS_TONE } from '@/constants/rfqLifecycle';
import { formatDisplayPrice } from '@/utils';
import type { RfqStatus } from '@/types';

const SOURCE_LABEL: Record<string, string> = {
  bom: 'BOM Component Matching',
  'ai-search': 'AI Engineering Search',
  manual: 'Manual Request',
  cart: 'Cart',
};

/**
 * This screen's job is quote generation + the buyer's first approval gate,
 * so it only renders the first two RFQ_STAGES (see
 * src/constants/rfqLifecycle.ts). Everything after — sales identification
 * through delivery, plus the second "approve for shipment" gate that
 * unlocks the dedicated RFQ Cart/Checkout — is tracked on the dedicated
 * Account -> RFQ Order Status screen.
 */
const APPROVAL_STAGES = RFQ_STAGES.slice(0, 2);

export default function RfqDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const rfq = useBomWorkflowStore((s) => s.rfq);
  const quote = useBomWorkflowStore((s) => s.quote);
  const setQuote = useBomWorkflowStore((s) => s.setQuote);
  const setRfq = useBomWorkflowStore((s) => s.setRfq);
  const displayCurrency = useCurrencyStore((s) => s.currency);
  const [generating, setGenerating] = useState(false);
  const [approved, setApproved] = useState(false);

  const matches = rfq?.id === id;

  useEffect(() => {
    if (matches && rfq && !quote) {
      setGenerating(true);
      rfqService.generateQuote(rfq).then(setQuote).finally(() => setGenerating(false));
    }
  }, [matches, rfq, quote, setQuote]);

  if (!matches || !rfq) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <MDEmptyState
          icon={<Ionicons name="document-text-outline" size={40} color={colors.text.tertiary} />}
          title="This RFQ session has ended"
          description="RFQs in this prototype live for the current session. Start a new one from AI Search or the BOM workflow."
          actionLabel="Start AI Search"
          onAction={() => router.push('/(buyer)/ai-search')}
        />
      </View>
    );
  }

  const currentStepIndex = approved ? 1 : 0;
  const currentStatus: RfqStatus = approved ? 'customer_approval' : 'submitted';

  const handleApprove = () => {
    if (!quote || !rfq) return;
    setApproved(true);
    rfqService.advanceRfqStatus(rfq.id, 'customer_approval').then(() => setRfq({ ...rfq, status: 'customer_approval' }));
    toast.show('Quote approved — our sales team will now identify and procure the components.', 'success');
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ maxWidth: 880, width: '100%', alignSelf: 'center', padding: spacing.xl }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xs }}>
          <View>
            <MDText variant="h1">RFQ {rfq.rfqNumber}</MDText>
            <MDText variant="body" tone="secondary" style={{ marginTop: spacing.xs }}>
              Source: {SOURCE_LABEL[rfq.source]} · {rfq.lines.length} line item{rfq.lines.length === 1 ? '' : 's'}
            </MDText>
          </View>
          <MDBadge label={RFQ_STAGE_LABEL[currentStatus]} tone={RFQ_STATUS_TONE[currentStatus]} size="md" />
        </View>
        <ProtoBadge label="RFQ + quote generation — prototype simulation of supplier/commercial pricing systems" />

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xl, marginBottom: spacing.xl, flexWrap: 'wrap' }}>
          {APPROVAL_STAGES.map((stage, index) => {
            const done = index < currentStepIndex;
            const active = index === currentStepIndex;
            return (
              <View key={stage.key} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.xs,
                    borderRadius: radius.pill,
                    backgroundColor: done || active ? colors.brand.primary : colors.gray[100],
                  }}
                >
                  <MDText variant="caption" weight="700" style={{ color: done || active ? colors.gray[0] : colors.text.tertiary }}>
                    {index + 1}. {stage.label}
                  </MDText>
                </View>
                {index < APPROVAL_STAGES.length - 1 ? (
                  <View style={{ width: 16, height: 2, backgroundColor: done ? colors.brand.primary : colors.gray[100], marginHorizontal: 4 }} />
                ) : null}
              </View>
            );
          })}
        </View>

        {generating || !quote ? (
          <View style={{ alignItems: 'center', paddingVertical: spacing['3xl'] }}>
            <ActivityIndicator color={colors.brand.primary} />
            <MDText variant="bodySm" tone="tertiary" style={{ marginTop: spacing.md }}>
              Generating supplier quote and applying pricing governance rules…
            </MDText>
          </View>
        ) : (
          <View style={{ gap: spacing.lg }}>
            {!approved ? <ProductPreviewVideo /> : null}

            {quote.lines.map((line) => (
              <MDCard key={line.productId} padding="lg">
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <MDManufacturerLogo manufacturer={line.product.manufacturer} width={80} height={18} />
                    <MDText variant="bodyMedium">{line.product.manufacturerPartNumber}</MDText>
                    <MDText variant="caption" tone="tertiary">
                      Qty {line.quantity} · {line.product.productType}
                    </MDText>
                  </View>
                  <MDText variant="h4">{formatDisplayPrice(line.pricing.approvedLineTotal, quote.currency, displayCurrency)}</MDText>
                </View>
                <PricingBreakdownTable pricing={line.pricing} showBadge={false} />
              </MDCard>
            ))}

            <MDCard padding="lg" style={{ backgroundColor: colors.gray[900] }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <MDText variant="bodyMedium" style={{ color: colors.gray[0] }}>
                    Quote Subtotal
                  </MDText>
                  <MDText variant="caption" style={{ color: colors.gray[400] }}>
                    Valid until {new Date(quote.validUntil).toLocaleDateString()} · {quote.quoteNumber}
                  </MDText>
                </View>
                <MDText variant="h2" style={{ color: colors.gray[0] }}>
                  {formatDisplayPrice(quote.subtotal, quote.currency, displayCurrency)}
                </MDText>
              </View>
            </MDCard>

            <View style={{ flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' }}>
              {!approved ? (
                <MDButton label="Approve Quote" onPress={handleApprove} iconLeft={<Ionicons name="checkmark-circle-outline" size={16} color={colors.gray[0]} />} />
              ) : (
                <MDButton
                  label="Track Fulfillment Status"
                  iconLeft={<Ionicons name="git-network-outline" size={16} color={colors.gray[0]} />}
                  onPress={() => router.push({ pathname: '/(buyer)/account/rfq-status/[id]', params: { id: rfq.id } })}
                />
              )}
              <MDButton label="Back to AI Search" variant="outline" onPress={() => router.push('/(buyer)/ai-search')} />
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
