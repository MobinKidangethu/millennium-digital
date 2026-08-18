import { ActivityIndicator, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, useToast, MDBadge, MDButton, MDEmptyState, MDText } from '@/design-system';
import { useAdvanceRfqStatus, useRfq } from '@/features/rfq';
import { RFQ_STAGE_LABEL, RFQ_STATUS_TONE } from '@/constants/rfqLifecycle';
import { RfqStatusTracker } from '@/components/RfqStatusTracker';
import { MDProductImage } from '@/components/MDProductImage';
import { ProtoBadge } from '@/components/ProtoBadge';
import { formatDisplayPrice } from '@/utils';
import { useCurrencyStore } from '@/state';

const SOURCE_LABEL: Record<string, string> = {
  bom: 'BOM Component Matching',
  'ai-search': 'AI Engineering Search',
  manual: 'Manual Request',
  cart: 'Cart',
};

export default function RfqOrderStatusDetail() {
  const router = useRouter();
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: rfq, isLoading } = useRfq(id);
  const advanceStatus = useAdvanceRfqStatus();
  const displayCurrency = useCurrencyStore((s) => s.currency);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.brand.primary} />
      </View>
    );
  }

  if (!rfq) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <MDEmptyState title="RFQ not found" actionLabel="View RFQ Order Status" onAction={() => router.push('/(buyer)/account/rfq-status')} />
      </View>
    );
  }

  return (
    <View style={{ maxWidth: 720, width: '100%' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.lg }}>
        <View>
          <MDText variant="h2">RFQ {rfq.rfqNumber}</MDText>
          <MDText variant="bodySm" tone="secondary" style={{ marginTop: 2 }}>
            {SOURCE_LABEL[rfq.source] ?? rfq.source} · Submitted{' '}
            {new Date(rfq.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
          </MDText>
        </View>
        <MDBadge label={RFQ_STAGE_LABEL[rfq.status]} tone={RFQ_STATUS_TONE[rfq.status]} />
      </View>

      <View style={{ marginBottom: spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
          <MDText variant="h4">Fulfillment Pipeline</MDText>
          <ProtoBadge label="Prototype simulation — advanced manually by Millennium Digital ops" />
        </View>
        <RfqStatusTracker status={rfq.status} />
      </View>

      {rfq.status === 'ready_to_ship' ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
            padding: spacing.lg,
            borderRadius: radius.lg,
            backgroundColor: colors.status.warningSoft,
            marginBottom: spacing.lg,
            flexWrap: 'wrap',
          }}
        >
          <Ionicons name="cube-outline" size={22} color={colors.status.warningStrong} />
          <View style={{ flex: 1, minWidth: 200 }}>
            <MDText variant="bodyMedium" weight="700" style={{ color: colors.status.warningStrong }}>
              Your components are procured — ready to ship
            </MDText>
            <MDText variant="caption" tone="secondary" style={{ marginTop: 2 }}>
              Approve shipment to move this RFQ into its own checkout and get it moving.
            </MDText>
          </View>
          <MDButton
            label="Approve for Shipment"
            loading={advanceStatus.isPending}
            onPress={() =>
              advanceStatus.mutate(
                { id: rfq.id, status: 'shipment_approved' },
                { onSuccess: () => toast.show('Shipment approved — proceed to the RFQ cart to place your order.', 'success') },
              )
            }
          />
        </View>
      ) : null}

      {rfq.status === 'shipment_approved' ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
            padding: spacing.lg,
            borderRadius: radius.lg,
            backgroundColor: colors.status.successSoft,
            marginBottom: spacing.lg,
            flexWrap: 'wrap',
          }}
        >
          <Ionicons name="checkmark-circle-outline" size={22} color={colors.status.successStrong} />
          <View style={{ flex: 1, minWidth: 200 }}>
            <MDText variant="bodyMedium" weight="700" style={{ color: colors.status.successStrong }}>
              Shipment approved
            </MDText>
            <MDText variant="caption" tone="secondary" style={{ marginTop: 2 }}>
              Proceed to the RFQ cart to confirm address, shipping, and payment — separate from your regular cart.
            </MDText>
          </View>
          <MDButton
            label="Proceed to RFQ Cart"
            iconLeft={<Ionicons name="cart-outline" size={16} color={colors.gray[0]} />}
            onPress={() => router.push({ pathname: '/(buyer)/rfq-cart/[id]', params: { id: rfq.id } })}
          />
        </View>
      ) : null}

      {rfq.status !== 'cancelled' ? (
        <View style={{ marginBottom: spacing.lg }}>
          <MDText variant="h4" style={{ marginBottom: spacing.md }}>
            Status Timeline
          </MDText>
          <View>
            {rfq.timeline.map((entry, index) => (
              <View key={index} style={{ flexDirection: 'row', gap: spacing.md }}>
                <View style={{ alignItems: 'center' }}>
                  <View style={{ width: 14, height: 14, borderRadius: radius.pill, backgroundColor: colors.brand.primary }} />
                  {index < rfq.timeline.length - 1 ? (
                    <View style={{ width: 2, flex: 1, backgroundColor: colors.border, minHeight: 24 }} />
                  ) : null}
                </View>
                <View style={{ paddingBottom: spacing.lg }}>
                  <MDText variant="bodySm" weight="600">
                    {entry.label}
                  </MDText>
                  <MDText variant="caption" tone="tertiary">
                    {new Date(entry.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </MDText>
                </View>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <MDText variant="h4" style={{ marginBottom: spacing.sm }}>
        Line Items
      </MDText>
      <View style={{ gap: spacing.sm, marginBottom: spacing.xl }}>
        {rfq.lines.map((line) => (
          <View key={line.productId} style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
            <View style={{ width: 56, height: 56 }}>
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

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        <MDButton label="View Quote" variant="outline" onPress={() => router.push({ pathname: '/(buyer)/rfq/[id]', params: { id: rfq.id } })} />
        <MDButton label="Contact Support" variant="ghost" onPress={() => router.push('/(buyer)/help')} />
      </View>
    </View>
  );
}
