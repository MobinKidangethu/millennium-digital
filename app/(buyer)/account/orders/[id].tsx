import { ActivityIndicator, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, MDButton, MDEmptyState, MDText, useToast } from '@/design-system';
import { useCancelOrder, useOrder, useReorder } from '@/features/orders';
import { MDOrderStatus } from '@/components/MDOrderStatus';
import { MDProductImage } from '@/components/MDProductImage';
import { formatPrice } from '@/utils';

export default function OrderDetail() {
  const router = useRouter();
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: order, isLoading } = useOrder(id);
  const cancelOrder = useCancelOrder();
  const reorder = useReorder();

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
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ maxWidth: 720, width: '100%', alignSelf: 'center', padding: spacing.xl }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xl }}>
          <View>
            <MDText variant="h1">Order #{order.orderNumber}</MDText>
            <MDText variant="body" tone="secondary" style={{ marginTop: spacing.xs }}>
              Placed {new Date(order.placedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
            </MDText>
          </View>
          <MDOrderStatus status={order.status} />
        </View>

        {order.status !== 'cancelled' ? (
          <View style={{ marginBottom: spacing['2xl'] }}>
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

        <MDText variant="h4" style={{ marginBottom: spacing.md }}>
          Items
        </MDText>
        <View style={{ gap: spacing.md, marginBottom: spacing['2xl'] }}>
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
                {formatPrice(item.price * item.quantity, order.currency)}
              </MDText>
            </View>
          ))}
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.xl, marginBottom: spacing['2xl'] }}>
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
          <SummaryRow label="Subtotal" value={formatPrice(order.subtotal, order.currency)} />
          <SummaryRow label="Shipping" value={order.shippingCost === 0 ? 'Free' : formatPrice(order.shippingCost, order.currency)} />
          <SummaryRow label="Tax" value={formatPrice(order.tax, order.currency)} />
          <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm }}>
            <SummaryRow label="Total" value={formatPrice(order.total, order.currency)} bold />
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
    </ScrollView>
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
