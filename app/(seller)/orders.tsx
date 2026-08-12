import { useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { colors, radius, spacing, MDBadge, MDPagination, MDSkeleton, MDTable, MDText, type MDTableColumn } from '@/design-system';
import { useSellerOrders, type SellerOrderView } from '@/features/sellers';
import { useAuthStore } from '@/state';
import { formatDisplayPrice } from '@/utils';
import { MDEmptyState } from '@/design-system';
import { OrderLineBackorderNote } from '@/components/OrderLineBackorderNote';
import { Ionicons } from '@expo/vector-icons';

const PAGE_SIZE = 10;

const STATUS_TONE: Record<string, 'success' | 'brand' | 'neutral' | 'warning' | 'error'> = {
  placed: 'brand',
  processing: 'brand',
  shipped: 'warning',
  'out-for-delivery': 'warning',
  delivered: 'success',
  cancelled: 'error',
};

export default function SellerOrders() {
  const session = useAuthStore((s) => s.session);
  const manufacturers = session?.user.sellerManufacturers ?? [];
  const { data: orderViews, isLoading } = useSellerOrders(manufacturers);
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(orderViews.length / PAGE_SIZE));
  const pagedOrderViews = useMemo(
    () => orderViews.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [orderViews, page],
  );

  useEffect(() => {
    setPage(1);
  }, [orderViews.length]);

  const columns: MDTableColumn<SellerOrderView>[] = [
    {
      key: 'order',
      label: 'Order',
      width: 160,
      render: (v) => (
        <View>
          <MDText variant="bodySm" weight="600">
            {v.order.orderNumber}
          </MDText>
          <MDText variant="caption" tone="tertiary">
            {new Date(v.order.placedAt).toLocaleDateString()}
          </MDText>
        </View>
      ),
    },
    {
      key: 'buyer',
      label: 'Ship To',
      width: 180,
      render: (v) => <MDText variant="bodySm">{v.order.shippingAddress.fullName}</MDText>,
    },
    {
      key: 'items',
      label: 'Your Items',
      width: 220,
      render: (v) => (
        <View style={{ gap: 2 }}>
          {v.myItems.map((item, i) => (
            <View key={`${item.productId}-${i}`}>
              <MDText variant="caption" numberOfLines={1}>
                {item.manufacturerPartNumber} × {item.quantity}
              </MDText>
              <OrderLineBackorderNote productId={item.productId} quantity={item.quantity} />
            </View>
          ))}
        </View>
      ),
    },
    {
      key: 'total',
      label: 'Your Revenue',
      width: 120,
      render: (v) => <MDText variant="bodySm" weight="600">{formatDisplayPrice(v.myTotal, v.order.currency, v.order.currency)}</MDText>,
    },
    {
      key: 'status',
      label: 'Order Status',
      width: 140,
      render: (v) => <MDBadge label={v.order.status} tone={STATUS_TONE[v.order.status] ?? 'neutral'} />,
    },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ padding: spacing.xl }}>
        <MDText variant="h1" style={{ marginBottom: spacing.xs }}>
          Orders
        </MDText>
        <MDText variant="bodySm" tone="secondary" style={{ marginBottom: spacing.lg, maxWidth: 640 }}>
          Orders containing at least one of your products — revenue shown is your line items only, not the
          full order total.
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
            Fulfillment status is managed by Millennium Digital operations in this prototype — this view is
            read-only. Per-seller fulfillment control is a production roadmap item.
          </MDText>
        </View>

        {isLoading ? (
          <MDSkeleton height={400} />
        ) : orderViews.length === 0 ? (
          <MDEmptyState
            icon={<Ionicons name="receipt-outline" size={40} color={colors.text.tertiary} />}
            title="No orders yet"
            description="Orders containing your products will appear here."
          />
        ) : (
          <>
            <MDTable columns={columns} data={pagedOrderViews} keyExtractor={(v) => v.order.id} emptyTitle="No orders" />
            <MDPagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </View>
    </ScrollView>
  );
}
