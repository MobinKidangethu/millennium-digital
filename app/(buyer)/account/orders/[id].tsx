import { ActivityIndicator, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, MDButton, MDEmptyState, MDText, useToast } from '@/design-system';
import { useCancelOrder, useOrder, useReorder } from '@/features/orders';
import { MDOrderStatus } from '@/components/MDOrderStatus';
import { MDProductImage } from '@/components/MDProductImage';
import { LogisticsTracker } from '@/components/LogisticsTracker';
import { ProtoBadge } from '@/components/ProtoBadge';
import { formatDisplayPrice } from '@/utils';
import { useCurrencyStore } from '@/state';

export default function OrderDetail() {
  const router = useRouter();
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: order, isLoading } = useOrder(id);
  const cancelOrder = useCancelOrder();
  const reorder = useReorder();
  const displayCurrency = useCurrencyStore((s) => s.currency);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.brand.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <MDEmptyState title="Order not found" actionLabel="View Order History" onAction={() => router.push('/(buyer)/account/orders')} />
      </View>
    );
  }

  const canCancel = order.status === 'placed' || order.status === 'processing';

  return (
    <View style={{ maxWidth: 720, width: '100%' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.lg }}>
          <View>
            <MDText variant="h2">Order #{order.orderNumber}</MDText>
            <MDText variant="bodySm" tone="secondary" style={{ marginTop: 2 }}>
              Placed {new Date(order.placedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
            </MDText>
          </View>
          <MDOrderStatus status={order.status} />
        </View>

        <View style={{ marginBottom: spacing.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
            <MDText variant="h4">Shipment Tracking</MDText>
            <ProtoBadge label="Logistics tracking — prototype simulation" />
          </View>
          <LogisticsTracker status={order.status} />
        </View>

        {order.status !== 'cancelled' ? (
          <View style={{ marginBottom: spacing.lg }}>
            <MDText variant="h4" style={{ marginBottom: spacing.md }}>
              Order Timeline
            </MDText>
            <View>
              {order.timeline.map((entry, index) => (
                <View key={index} style={{ flexDirection: 'row', gap: spacing.md }}>
                  <View style={{ alignItems: 'center' }}>
                    <View
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: radius.pill,
                        backgroundColor: colors.brand.primary,
                      }}
                    />
                    {index < order.timeline.length - 1 ? (
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
          Items
        </MDText>
        <View style={{ gap: spacing.sm, marginBottom: spacing.lg }}>
          {order.items.map((item) => (
            <View key={item.productId} style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
              <View style={{ width: 56, height: 56 }}>
                <MDProductImage imagePath={item.image} alt={item.title} style={{ width: '100%', height: '100%' }} />
              </View>
              <View style={{ flex: 1 }}>
                <MDText variant="bodySm" weight="600">
                  {item.manufacturerPartNumber}
                </MDText>
                <MDText variant="caption" tone="tertiary">
                  {item.manufacturer} · Qty {item.quantity}
                </MDText>
              </View>
              <MDText variant="bodySm" weight="600">
                {formatDisplayPrice(item.price * item.quantity, order.currency, displayCurrency)}
              </MDText>
            </View>
          ))}
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.lg, marginBottom: spacing.lg }}>
          <View style={{ flex: 1 }}>
            <MDText variant="h4" style={{ marginBottom: spacing.xs }}>
              Shipping
            </MDText>
            <MDText variant="bodySm">{order.shippingAddress.fullName}</MDText>
            <MDText variant="bodySm" tone="secondary">
              {order.shippingAddress.line1}, {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
              {order.shippingAddress.postalCode}
            </MDText>
            <MDText variant="bodySm" tone="tertiary" style={{ marginTop: spacing.xs }}>
              {order.shippingMethod.label}
            </MDText>
          </View>
          <View style={{ flex: 1 }}>
            <MDText variant="h4" style={{ marginBottom: spacing.xs }}>
              Payment
            </MDText>
            <MDText variant="bodySm">{order.paymentMethod.label}</MDText>
            {order.paymentMethod.reference ? (
              <MDText variant="bodySm" tone="secondary">
                {order.paymentMethod.reference}
              </MDText>
            ) : null}
          </View>
        </View>

        <View
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.lg,
            padding: spacing.lg,
            gap: spacing.sm,
            marginBottom: spacing.xl,
          }}
        >
          <SummaryRow label="Subtotal" value={formatDisplayPrice(order.subtotal, order.currency, displayCurrency)} />
          <SummaryRow label="Shipping" value={order.shippingCost === 0 ? 'Free' : formatDisplayPrice(order.shippingCost, order.currency, displayCurrency)} />
          <SummaryRow label="Tax" value={formatDisplayPrice(order.tax, order.currency, displayCurrency)} />
          <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm }}>
            <SummaryRow label="Total" value={formatDisplayPrice(order.total, order.currency, displayCurrency)} bold />
          </View>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          <MDButton
            label="Reorder"
            variant="outline"
            onPress={() => {
              reorder(order);
              toast.show('Items added to your cart.', 'success');
            }}
          />
          <MDButton label="Download Invoice" variant="outline" onPress={() => toast.show('Invoice sent to your email.', 'success')} />
          {canCancel ? (
            <MDButton
              label="Cancel Order"
              variant="danger"
              loading={cancelOrder.isPending}
              onPress={() =>
                cancelOrder.mutate(order.id, {
                  onSuccess: () => toast.show('Order cancelled.', 'neutral'),
                  onError: (e) => toast.show((e as Error).message, 'error'),
                })
              }
            />
          ) : null}
          <MDButton label="Contact Support" variant="ghost" onPress={() => router.push('/(buyer)/help')} />
        </View>
      </View>
  );
}


function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <MDText variant={bold ? 'bodyMedium' : 'bodySm'} tone={bold ? 'primary' : 'secondary'}>
        {label}
      </MDText>
      <MDText variant={bold ? 'bodyMedium' : 'bodySm'} weight={bold ? '700' : '400'}>
        {value}
      </MDText>
    </View>
  );
}
