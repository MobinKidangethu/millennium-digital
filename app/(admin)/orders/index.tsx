import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radius, spacing, MDInput, MDSkeleton, MDTable, MDText, type MDTableColumn } from '@/design-system';
import { useAllOrders } from '@/features/orders';
import { useCustomers } from '@/features/customers';
import { MDOrderStatus } from '@/components/MDOrderStatus';
import { formatDisplayPrice } from '@/utils';
import { useCurrencyStore } from '@/state';
import type { Order, OrderStatus } from '@/types';

const STATUS_TABS: (OrderStatus | 'all')[] = ['all', 'placed', 'processing', 'shipped', 'out-for-delivery', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const router = useRouter();
  const { data: orders, isLoading } = useAllOrders();
  const { data: customers } = useCustomers();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const displayCurrency = useCurrencyStore((s) => s.currency);

  const customerById = useMemo(() => new Map((customers ?? []).map((c) => [c.id, c])), [customers]);

  const filtered = useMemo(() => {
    if (!orders) return [];
    let result = orders;
    if (statusFilter !== 'all') result = result.filter((o) => o.status === statusFilter);
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((o) => {
        const customer = customerById.get(o.userId);
        return o.orderNumber.toLowerCase().includes(q) || customer?.fullName.toLowerCase().includes(q) || customer?.email.toLowerCase().includes(q);
      });
    }
    return result;
  }, [orders, statusFilter, search, customerById]);

  const columns: MDTableColumn<Order>[] = [
    { key: 'order', label: 'Order', width: 160, render: (o) => <MDText variant="bodySm" weight="600">{o.orderNumber}</MDText> },
    {
      key: 'customer',
      label: 'Customer',
      width: 200,
      render: (o) => {
        const customer = customerById.get(o.userId);
        return (
          <View>
            <MDText variant="bodySm">{customer?.fullName ?? o.shippingAddress.fullName}</MDText>
            <MDText variant="caption" tone="tertiary">
              {customer?.email ?? '—'}
            </MDText>
          </View>
        );
      },
    },
    {
      key: 'date',
      label: 'Date',
      width: 120,
      render: (o) => <MDText variant="bodySm">{new Date(o.placedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</MDText>,
    },
    { key: 'items', label: 'Items', width: 70, render: (o) => <MDText variant="bodySm">{o.items.length}</MDText> },
    { key: 'total', label: 'Total', width: 120, render: (o) => <MDText variant="bodySm" weight="600">{formatDisplayPrice(o.total, o.currency, displayCurrency)}</MDText> },
    { key: 'status', label: 'Status', width: 150, render: (o) => <MDOrderStatus status={o.status} /> },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ padding: spacing.xl }}>
        <MDText variant="h1" style={{ marginBottom: spacing.xl }}>
          Orders
        </MDText>

        <MDInput value={search} onChangeText={setSearch} placeholder="Search by order number, customer, or email…" style={{ maxWidth: 420, marginBottom: spacing.lg }} />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.lg }}>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {STATUS_TABS.map((status) => (
              <Pressable
                key={status}
                onPress={() => setStatusFilter(status)}
                style={{
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderRadius: radius.pill,
                  backgroundColor: statusFilter === status ? colors.brand.primary : colors.surfaceRaised,
                  borderWidth: 1,
                  borderColor: statusFilter === status ? colors.brand.primary : colors.border,
                }}
              >
                <MDText variant="bodySm" weight="600" style={{ color: statusFilter === status ? colors.gray[0] : colors.text.secondary }}>
                  {status === 'all' ? 'All' : status.replace(/-/g, ' ')}
                </MDText>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {isLoading ? (
          <MDSkeleton height={400} />
        ) : (
          <MDTable
            columns={columns}
            data={filtered}
            keyExtractor={(o) => o.id}
            onRowPress={(o) => router.push({ pathname: '/(admin)/orders/[id]', params: { id: o.id } })}
            emptyTitle="No orders found"
          />
        )}
      </View>
    </ScrollView>
  );
}
