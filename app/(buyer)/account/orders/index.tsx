import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, layout, radius, spacing, MDButton, MDEmptyState, MDSkeleton, MDText, useToast } from '@/design-system';
import { useAuthStore } from '@/state';
import { useOrders, useReorder } from '@/features/orders';
import { MDOrderStatus } from '@/components/MDOrderStatus';
import { formatPrice } from '@/utils';

export default function OrderHistory() {
  const router = useRouter();
  const toast = useToast();
  const session = useAuthStore((s) => s.session);
  const { data: orders, isLoading } = useOrders(session?.user.id);
  const reorder = useReorder();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ maxWidth: layout.maxContentWidth, width: '100%', alignSelf: 'center', padding: spacing.xl }}>
        <MDText variant="h1" style={{ marginBottom: spacing.xl }}>
          Order History
        </MDText>

        {isLoading ? (
          <View style={{ gap: spacing.md }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <MDSkeleton key={i} height={120} radius={16} />
            ))}
          </View>
        ) : !orders || orders.length === 0 ? (
          <MDEmptyState
            icon={<Ionicons name="receipt-outline" size={40} color={colors.text.tertiary} />}
            title="No orders yet"
            description="Once you place an order, it will show up here with full tracking details."
            actionLabel="Browse Products"
            onAction={() => router.push('/(buyer)/products')}
          />
        ) : (
          <View style={{ gap: spacing.md }}>
            {orders.map((order) => (
              <View
                key={order.id}
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: radius.lg,
                  padding: spacing.lg,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm }}>
                  <View>
                    <MDText variant="bodyMedium">Order #{order.orderNumber}</MDText>
                    <MDText variant="caption" tone="tertiary">
                      Placed {new Date(order.placedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      {' · '}
                      {order.items.length} item{order.items.length === 1 ? '' : 's'}
                    </MDText>
                  </View>
                  <MDOrderStatus status={order.status} />
                </View>

                <MDText variant="bodyMedium" weight="700" style={{ marginBottom: spacing.md }}>
                  {formatPrice(order.total, order.currency)}
                </MDText>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                  <MDButton
                    label="View Order"
                    size="sm"
                    variant="outline"
                    onPress={() => router.push({ pathname: '/(buyer)/account/orders/[id]', params: { id: order.id } })}
                  />
                  <MDButton
                    label="Reorder"
                    size="sm"
                    variant="outline"
                    onPress={() => {
                      reorder(order);
                      toast.show('Items added to your cart.', 'success');
                    }}
                  />
                  <MDButton
                    label="Download Invoice"
                    size="sm"
                    variant="ghost"
                    onPress={() => toast.show('Invoice sent to your email.', 'success')}
                  />
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
