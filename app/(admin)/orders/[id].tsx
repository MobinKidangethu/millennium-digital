import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, radius, spacing, useToast, MDEmptyState, MDText } from '@/design-system';
import { useOrder, useUpdateOrderStatus } from '@/features/orders';
import { MDOrderStatus } from '@/components/MDOrderStatus';
import { MDProductImage } from '@/components/MDProductImage';
import { formatPrice } from '@/utils';
import type { OrderStatus } from '@/types';

const STATUS_FLOW: OrderStatus[] = ['placed', 'processing', 'shipped', 'out-for-delivery', 'delivered'];

export default function AdminOrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const { data: order, isLoading } = useOrder(id);
  const updateStatus = useUpdateOrderStatus();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface }}>
        <ActivityIndicator color={colors.brand.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.surface }}>
        <MDEmptyState title="Order not found" actionLabel="Back to Orders" onAction={() => router.push('/(admin)/orders')} />
      </View>
    );
  }

  const currentIndex = STATUS_FLOW.indexOf(order.status);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ padding: spacing.xl, maxWidth: 900 }}>
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
          <View style={{ marginBottom: spacing['2xl'], backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg }}>
            <MDText variant="h4" style={{ marginBottom: spacing.md }}>
              Update Status
            </MDText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {STATUS_FLOW.map((status, index) => {
                const active = status === order.status;
                const done = index < currentIndex;
                return (
                  <Pressable
                    key={status}
                    disabled={active || updateStatus.isPending}
                    onPress={() =>
                      updateStatus.mutate(
                        { id: order.id, status },
                        { onSuccess: () => toast.show(`Order marked as ${status.replace(/-/g, ' ')}.`, 'success') },
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
                      {status.replace(/-/g, ' ')}
                    </MDText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        <MDText variant="h4" style={{ marginBottom: spacing.md }}>
          Items
        </MDText>
        <View style={{ gap: spacing.md, marginBottom: spacing['2xl'] }}>
          {order.items.map((item) => (
            <View key={item.productId} style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
              <View style={{ width: 48, height: 48 }}>
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

        <View style={{ flexDirection: 'row', gap: spacing.xl, marginBottom: spacing['2xl'], flexWrap: 'wrap' }}>
          <View style={{ flex: 1, minWidth: 240 }}>
            <MDText variant="h4" style={{ marginBottom: spacing.xs }}>
              Shipping
            </MDText>
            <MDText variant="bodySm">{order.shippingAddress.fullName}</MDText>
            <MDText variant="bodySm" tone="secondary">
              {order.shippingAddress.line1}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
            </MDText>
            <MDText variant="bodySm" tone="tertiary" style={{ marginTop: spacing.xs }}>
              {order.shippingMethod.label}
            </MDText>
          </View>
          <View style={{ flex: 1, minWidth: 240 }}>
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

        <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm, maxWidth: 360 }}>
          <SummaryRow label="Subtotal" value={formatPrice(order.subtotal, order.currency)} />
          <SummaryRow label="Shipping" value={order.shippingCost === 0 ? 'Free' : formatPrice(order.shippingCost, order.currency)} />
          <SummaryRow label="Tax" value={formatPrice(order.tax, order.currency)} />
          <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm }}>
            <SummaryRow label="Total" value={formatPrice(order.total, order.currency)} bold />
          </View>
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
