import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, MDBadge, MDButton, MDEmptyState, MDSkeleton, MDText } from '@/design-system';
import { useRfqs } from '@/features/rfq';
import { RFQ_STAGE_LABEL, RFQ_STATUS_TONE } from '@/constants/rfqLifecycle';
import { ProtoBadge } from '@/components/ProtoBadge';

const SOURCE_LABEL: Record<string, string> = {
  bom: 'BOM Component Matching',
  'ai-search': 'AI Engineering Search',
  manual: 'Manual Request',
  cart: 'Cart',
};

/**
 * Read-only fulfillment tracker for every RFQ the buyer has submitted —
 * distinct from "My RFQs" (quote negotiation/approval). Once an RFQ is
 * approved, its progress through sales/procurement/shipment/delivery is
 * driven by the Admin RFQ console and shows up here, mirroring how Order
 * History / Order Detail track a normal order's fulfillment.
 */
export default function RfqOrderStatus() {
  const router = useRouter();
  const { data: rfqs, isLoading } = useRfqs();

  return (
    <View>
      <MDText variant="h2" style={{ marginBottom: spacing.xs }}>
        RFQ Order Status
      </MDText>
      <View style={{ marginBottom: spacing.md }}>
        <ProtoBadge label="RFQ fulfillment pipeline — prototype simulation, advanced manually by Millennium Digital ops" />
      </View>

      {isLoading ? (
        <View style={{ gap: spacing.sm }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <MDSkeleton key={i} height={92} radius={12} />
          ))}
        </View>
      ) : !rfqs || rfqs.length === 0 ? (
        <MDEmptyState
          icon={<Ionicons name="git-network-outline" size={36} color={colors.text.tertiary} />}
          title="No RFQs in progress"
          description="Submit an RFQ from a BOM or AI Search and its fulfillment status will show up here."
          actionLabel="Start a BOM"
          onAction={() => router.push('/(buyer)/bom')}
        />
      ) : (
        <View style={{ gap: spacing.sm }}>
          {rfqs.map((rfq) => (
            <View
              key={rfq.id}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surface,
                borderRadius: radius.md,
                padding: spacing.md,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xs }}>
                <View>
                  <MDText variant="bodySm" weight="700">{rfq.rfqNumber}</MDText>
                  <MDText variant="caption" tone="tertiary">
                    {SOURCE_LABEL[rfq.source] ?? rfq.source} ·{' '}
                    {new Date(rfq.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    {' · '}
                    {rfq.lines.length} line item{rfq.lines.length === 1 ? '' : 's'}
                  </MDText>
                </View>
                <MDBadge label={RFQ_STAGE_LABEL[rfq.status]} tone={RFQ_STATUS_TONE[rfq.status]} />
              </View>

              <MDButton
                label="View Fulfillment Status"
                size="sm"
                variant="outline"
                onPress={() => router.push({ pathname: '/(buyer)/account/rfq-status/[id]', params: { id: rfq.id } })}
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
