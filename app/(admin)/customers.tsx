import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { colors, radius, spacing, MDBadge, MDInput, MDSkeleton, MDTable, MDText, type MDTableColumn } from '@/design-system';
import { useCustomers, type CustomerWithStats } from '@/features/customers';
import { MDStatsCard } from '@/components/MDStatsCard';
import { formatDisplayPrice } from '@/utils';
import { useCurrencyStore } from '@/state';

export default function CustomerManagement() {
  const { data: customers, isLoading } = useCustomers();
  const [search, setSearch] = useState('');
  const displayCurrency = useCurrencyStore((s) => s.currency);

  const filtered = useMemo(() => {
    if (!customers) return [];
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) => c.fullName.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
  }, [customers, search]);

  const totalRevenue = (customers ?? []).reduce((sum, c) => sum + c.totalSpent, 0);

  const columns: MDTableColumn<CustomerWithStats>[] = [
    {
      key: 'name',
      label: 'Customer',
      width: 220,
      render: (c) => (
        <View>
          <MDText variant="bodySm" weight="600">
            {c.fullName}
          </MDText>
          <MDText variant="caption" tone="tertiary">
            {c.email}
          </MDText>
        </View>
      ),
    },
    { key: 'company', label: 'Company', width: 180, render: (c) => <MDText variant="bodySm">{c.company || '—'}</MDText> },
    { key: 'orders', label: 'Orders', width: 90, render: (c) => <MDText variant="bodySm">{c.orderCount}</MDText> },
    {
      key: 'spent',
      label: 'Total Spent',
      width: 140,
      render: (c) => <MDText variant="bodySm">{formatDisplayPrice(c.totalSpent, 'INR', displayCurrency)}</MDText>,
    },
    {
      key: 'joined',
      label: 'Joined',
      width: 130,
      render: (c) => <MDText variant="bodySm">{new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</MDText>,
    },
    { key: 'status', label: 'Status', width: 100, render: () => <MDBadge label="Active" tone="success" /> },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ padding: spacing.xl }}>
        <MDText variant="h1" style={{ marginBottom: spacing.xl }}>
          Customers
        </MDText>

        {isLoading ? (
          <MDSkeleton height={300} />
        ) : (
          <>
            <View style={{ flexDirection: 'row', gap: spacing.lg, marginBottom: spacing.xl, flexWrap: 'wrap' }}>
              <MDStatsCard label="Total Customers" value={String(customers?.length ?? 0)} icon="people-outline" />
              <MDStatsCard label="Total Revenue" value={formatDisplayPrice(totalRevenue, 'INR', displayCurrency)} icon="cash-outline" tone="success" />
            </View>

            <MDInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search by name or email…"
              style={{ maxWidth: 360, marginBottom: spacing.lg }}
            />

            <MDTable columns={columns} data={filtered} keyExtractor={(c) => c.id} emptyTitle="No customers found" />
          </>
        )}
      </View>
    </ScrollView>
  );
}
