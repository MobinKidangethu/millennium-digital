import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, MDButton, MDEmptyState, MDPagination, MDSkeleton, MDText, useToast } from '@/design-system';
import { useAuthStore, useCurrencyStore } from '@/state';
import { useOrders, useReorder } from '@/features/orders';
import { MDOrderStatus } from '@/components/MDOrderStatus';
import { formatDisplayPrice } from '@/utils';

const PAGE_SIZE = 10;

export default function OrderHistory() {
  const router = useRouter();
  const toast = useToast();
  const session = useAuthStore((s) => s.session);
  const { data: orders, isLoading } = useOrders(session?.user.id);
  const reorder = useReorder();
  const displayCurrency = useCurrencyStore((s) => s.currency);
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil((orders?.length ?? 0) / PAGE_SIZE));
  const pagedOrders = useMemo(
    () => (orders ?? []).slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [orders, page],
  );

  useEffect(() => {
    setPage(1);
  }, [orders?.length]);

  return (
    <View>
      <MDText variant="h2" style={{ marginBottom: spacing.md }}>
        Order History
      </MDText>

      {isLoading ? (
        <View style={{ gap: spacing.sm }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <MDSkeleton key={i} height={96} radius={12} />
          ))}
        </View>
      ) : !orders || orders.length === 0 ? (
        <MDEmptyState
          icon={<Ionicons name="receipt-outline" size={36} color={colors.text.tertiary} />}
          title="No orders yet"
          description="Once you place an order, it will show up here with full tracking details."
          actionLabel="Browse Products"
          onAction={() => router.push('/(buyer)/products')}
        />
      ) : (
        <View style={{ gap: spacing.sm }}>
          {pagedOrders.map((order) => (
            <View
              key={order.id}
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
                  <MDText variant="bodySm" weight="700">Order #{order.orderNumber}</MDText>
                  <MDText variant="caption" tone="tertiary">
                    Placed {new Date(order.placedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    {' · '}
                    {order.items.length} item{order.items.length === 1 ? '' : 's'}
                  </MDText>
                </View>
                <MDOrderStatus status={order.status} />
              </View>

              <MDText variant="bodySm" weight="700" style={{ marginBottom: spacing.sm }}>
                {formatDisplayPrice(order.total, order.currency, displayCurrency)}
              </MDText>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
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
          <MDPagination page={page} totalPages={totalPages} onChange={setPage} />
        </View>
      )}
    </View>
  );
}
