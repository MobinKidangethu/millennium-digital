import { ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, MDBadge, MDEmptyState, MDSkeleton, MDTable, MDText, type MDTableColumn } from '@/design-system';
import { useSellerRfqs, type SellerRfqView } from '@/features/sellers';
import { useAuthStore } from '@/state';

const STATUS_TONE: Record<string, 'success' | 'brand' | 'neutral' | 'warning' | 'error'> = {
  draft: 'neutral',
  submitted: 'brand',
  quoted: 'warning',
  approved: 'success',
};

export default function SellerRfqs() {
  const session = useAuthStore((s) => s.session);
  const manufacturers = session?.user.sellerManufacturers ?? [];
  const { data: rfqViews, isLoading } = useSellerRfqs(manufacturers);

  const columns: MDTableColumn<SellerRfqView>[] = [
    {
      key: 'rfq',
      label: 'RFQ',
      width: 160,
      render: (v) => (
        <View>
          <MDText variant="bodySm" weight="600">
            {v.rfq.rfqNumber}
          </MDText>
          <MDText variant="caption" tone="tertiary">
            {new Date(v.rfq.createdAt).toLocaleDateString()}
          </MDText>
        </View>
      ),
    },
    {
      key: 'lines',
      label: 'Your Requested Items',
      width: 260,
      render: (v) => (
        <View style={{ gap: 2 }}>
          {v.myLines.map((line, i) => (
            <MDText key={`${line.productId}-${i}`} variant="caption" numberOfLines={1}>
              {line.product.manufacturerPartNumber} × {line.quantity}
            </MDText>
          ))}
        </View>
      ),
    },
    { key: 'source', label: 'Source', width: 120, render: (v) => <MDText variant="bodySm">{v.rfq.source}</MDText> },
    {
      key: 'status',
      label: 'Status',
      width: 120,
      render: (v) => <MDBadge label={v.rfq.status} tone={STATUS_TONE[v.rfq.status] ?? 'neutral'} />,
    },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ padding: spacing.xl }}>
        <MDText variant="h1" style={{ marginBottom: spacing.xs }}>
          RFQs
        </MDText>
        <MDText variant="bodySm" tone="secondary" style={{ marginBottom: spacing.lg, maxWidth: 640 }}>
          Buyer requests for quotation that include at least one of your products.
        </MDText>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            backgroundColor: colors.status.warningSoft,
            borderRadius: radius.md,
            padding: spacing.md,
            marginBottom: spacing.lg,
          }}
        >
          <Ionicons name="information-circle-outline" size={16} color={colors.status.warningStrong} />
          <MDText variant="caption" style={{ color: colors.status.warningStrong, flex: 1 }}>
            Pricing and quote generation are handled by Millennium Digital's governed pricing engine in this
            prototype — this view is read-only. Direct seller quote response is a production roadmap item.
          </MDText>
        </View>

        {isLoading ? (
          <MDSkeleton height={400} />
        ) : rfqViews.length === 0 ? (
          <MDEmptyState
            icon={<Ionicons name="document-text-outline" size={40} color={colors.text.tertiary} />}
            title="No RFQs yet"
            description="RFQs that include your products will appear here."
          />
        ) : (
          <MDTable columns={columns} data={rfqViews} keyExtractor={(v) => v.rfq.id} emptyTitle="No RFQs" />
        )}
      </View>
    </ScrollView>
  );
}
