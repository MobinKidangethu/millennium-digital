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
import { useBomWorkflowStore, useCartStore } from '@/state';
import { ProtoBadge } from '@/components/ProtoBadge';
import { PricingBreakdownTable } from '@/components/PricingBreakdownTable';
import { MDManufacturerLogo } from '@/components/MDManufacturerLogo';
import { formatPrice } from '@/utils';

const SOURCE_LABEL: Record<string, string> = {
  bom: 'BOM Component Matching',
  'ai-search': 'AI Engineering Search',
  manual: 'Manual Request',
  cart: 'Cart',
};

const STEPS = ['Submitted', 'Quote Generated', 'Pricing Governed', 'Approved'] as const;

export default function RfqDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const rfq = useBomWorkflowStore((s) => s.rfq);
  const quote = useBomWorkflowStore((s) => s.quote);
  const setQuote = useBomWorkflowStore((s) => s.setQuote);
  const addToCart = useCartStore((s) => s.addItem);
  const [generating, setGenerating] = useState(false);
  const [approved, setApproved] = useState(false);

  const matches = rfq?.id === id;

  useEffect(() => {
    if (matches && rfq && !quote) {
      setGenerating(true);
      rfqService
        .generateQuote(rfq)
        .then(setQuote)
        .finally(() => setGenerating(false));
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

  const currentStepIndex = approved ? 3 : quote ? 2 : 1;

  const handleApprove = () => {
    if (!quote) return;
    quote.lines.forEach((line) => addToCart(line.productId, line.quantity));
    setApproved(true);
    toast.show('Approved items added to cart at governed pricing.', 'success');
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
          <MDBadge label={approved ? 'Approved' : quote ? 'Quoted' : 'Submitted'} tone={approved ? 'success' : 'brand'} size="md" />
        </View>
        <ProtoBadge label="RFQ + quote generation — prototype simulation of supplier/commercial pricing systems" />

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xl, marginBottom: spacing.xl, flexWrap: 'wrap' }}>
          {STEPS.map((step, index) => {
            const done = index < currentStepIndex;
            const active = index === currentStepIndex;
            return (
              <View key={step} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.xs,
                    borderRadius: radius.pill,
                    backgroundColor: done || active ? colors.brand.primary : colors.gray[100],
                  }}
                >
                  <MDText variant="caption" weight="700" style={{ color: done || active ? colors.gray[0] : colors.text.tertiary }}>
                    {index + 1}. {step}
                  </MDText>
                </View>
                {index < STEPS.length - 1 ? (
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
                  <MDText variant="h4">{formatPrice(line.pricing.approvedLineTotal, quote.currency)}</MDText>
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
                  {formatPrice(quote.subtotal, quote.currency)}
                </MDText>
              </View>
            </MDCard>

            <View style={{ flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' }}>
              {!approved ? (
                <MDButton label="Approve & Add to Cart" onPress={handleApprove} iconLeft={<Ionicons name="checkmark-circle-outline" size={16} color={colors.gray[0]} />} />
              ) : (
                <MDButton label="Proceed to Cart" onPress={() => router.push('/(buyer)/cart')} iconLeft={<Ionicons name="cart-outline" size={16} color={colors.gray[0]} />} />
              )}
              <MDButton label="Back to AI Search" variant="outline" onPress={() => router.push('/(buyer)/ai-search')} />
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
