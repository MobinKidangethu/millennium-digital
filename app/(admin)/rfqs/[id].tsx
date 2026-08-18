import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, radius, spacing, useToast, MDBadge, MDEmptyState, MDText } from '@/design-system';
import { useAdvanceRfqStatus, useRfq } from '@/features/rfq';
import { RFQ_STAGES, RFQ_STAGE_LABEL, RFQ_STATUS_TONE, rfqStageIndex } from '@/constants/rfqLifecycle';
import { RfqStatusTracker } from '@/components/RfqStatusTracker';
import { MDProductImage } from '@/components/MDProductImage';
import { formatDisplayPrice } from '@/utils';
import { useCurrencyStore } from '@/state';
import type { RfqStatus } from '@/types';

const SOURCE_LABEL: Record<string, string> = {
  bom: 'BOM Component Matching',
  'ai-search': 'AI Engineering Search',
  manual: 'Manual Request',
  cart: 'Cart',
};

const STATUS_FLOW: RfqStatus[] = RFQ_STAGES.map((s) => s.key);

export default function AdminRfqDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const { data: rfq, isLoading } = useRfq(id);
  const advanceStatus = useAdvanceRfqStatus();
  const displayCurrency = useCurrencyStore((s) => s.currency);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface }}>
        <ActivityIndicator color={colors.brand.primary} />
      </View>
    );
  }

  if (!rfq) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.surface }}>
        <MDEmptyState title="RFQ not found" actionLabel="Back to RFQs" onAction={() => router.push('/(admin)/rfqs')} />
      </View>
    );
  }

  const currentIndex = rfqStageIndex(rfq.status);
  const subtotal = rfq.lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ padding: spacing.xl, maxWidth: 900 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xl }}>
          <View>
            <MDText variant="h1">RFQ {rfq.rfqNumber}</MDText>
            <MDText variant="body" tone="secondary" style={{ marginTop: spacing.xs }}>
              {SOURCE_LABEL[rfq.source] ?? rfq.source} · Submitted{' '}
              {new Date(rfq.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
            </MDText>
          </View>
          <MDBadge label={RFQ_STAGE_LABEL[rfq.status]} tone={RFQ_STATUS_TONE[rfq.status]} />
        </View>

        <View style={{ marginBottom: spacing.xl }}>
          <MDText variant="h4" style={{ marginBottom: spacing.sm }}>
            Fulfillment Pipeline
          </MDText>
          <RfqStatusTracker status={rfq.status} />
        </View>

        {rfq.status !== 'cancelled' ? (
          <View style={{ marginBottom: spacing['2xl'], backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg }}>
            <MDText variant="h4" style={{ marginBottom: spacing.md }}>
              Update Status
            </MDText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {STATUS_FLOW.map((status, index) => {
                const active = status === rfq.status;
                const done = index < currentIndex;
                return (
                  <Pressable
                    key={status}
                    disabled={active || advanceStatus.isPending}
                    onPress={() =>
                      advanceStatus.mutate(
                        { id: rfq.id, status },
                        { onSuccess: () => toast.show(`RFQ marked as ${RFQ_STAGE_LABEL[status]}.`, 'success') },
                      )
                    }
                    style={{
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                      borderRadius: radius.pill,
                      borderWidth: 1,
                      borderColor: active || done ? colors.brand.primary : colors.border,
                      backgroundColor: active ? colors.brand.primary : done ? colors.brand.primarySoft : 'transparent',
                    }}
                  >
                    <MDText variant="bodySm" weight="600" style={{ color: active ? colors.gray[0] : done ? colors.brand.primary : colors.text.secondary }}>
                      {RFQ_STAGE_LABEL[status]}
                    </MDText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        <MDText variant="h4" style={{ marginBottom: spacing.md }}>
          Line Items
        </MDText>
        <View style={{ gap: spacing.md, marginBottom: spacing['2xl'] }}>
          {rfq.lines.map((line) => (
            <View key={line.productId} style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
              <View style={{ width: 48, height: 48 }}>
                <MDProductImage imagePath={line.product.image} alt={line.product.title} style={{ width: '100%', height: '100%' }} />
              </View>
              <View style={{ flex: 1 }}>
                <MDText variant="bodySm" weight="600">
                  {line.product.manufacturerPartNumber}
                </MDText>
                <MDText variant="caption" tone="tertiary">
                  {line.product.manufacturer} · Qty {line.quantity}
                </MDText>
              </View>
              <MDText variant="bodySm" weight="600">
                {formatDisplayPrice(line.product.price * line.quantity, line.product.currency, displayCurrency)}
              </MDText>
            </View>
          ))}
        </View>

        <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, maxWidth: 360 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <MDText variant="bodyMedium">Subtotal (base pricing)</MDText>
            <MDText variant="bodyMedium" weight="700">
              {formatDisplayPrice(subtotal, rfq.lines[0]?.product.currency ?? 'INR', displayCurrency)}
            </MDText>
          </View>
          <MDText variant="caption" tone="tertiary" style={{ marginTop: spacing.xs }}>
            Governed/approved pricing is shown to the buyer on the quote screen.
          </MDText>
        </View>
      </View>
    </ScrollView>
  );
}
