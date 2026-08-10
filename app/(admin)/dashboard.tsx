import { ScrollView, View } from 'react-native';
import { colors, spacing, MDChart, MDSkeleton, MDText } from '@/design-system';
import { useDashboardStats } from '@/features/admin';
import { MDStatsCard } from '@/components/MDStatsCard';
import { formatDisplayPrice } from '@/utils';
import { useCurrencyStore } from '@/state';

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();
  const displayCurrency = useCurrencyStore((s) => s.currency);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ padding: spacing.xl }}>
        <MDText variant="h1" style={{ marginBottom: spacing.xs }}>
          Dashboard
        </MDText>
        <MDText variant="body" tone="secondary" style={{ marginBottom: spacing.xl }}>
          Overview of catalog, orders, and customers.
        </MDText>

        {isLoading || !stats ? (
          <MDSkeleton height={400} />
        ) : (
          <>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg, marginBottom: spacing.xl }}>
              <MDStatsCard label="Total Products" value={String(stats.totalProducts)} icon="cube-outline" />
              <MDStatsCard label="Active Products" value={String(stats.activeProducts)} icon="checkmark-circle-outline" tone="success" />
              <MDStatsCard label="Low Stock" value={String(stats.lowStock)} icon="alert-circle-outline" tone="warning" />
              <MDStatsCard label="Out of Stock" value={String(stats.outOfStock)} icon="close-circle-outline" tone="error" />
              <MDStatsCard label="Total Orders" value={String(stats.totalOrders)} icon="receipt-outline" />
              <MDStatsCard label="Pending Orders" value={String(stats.pendingOrders)} icon="time-outline" tone="warning" />
              <MDStatsCard label="Completed Orders" value={String(stats.completedOrders)} icon="checkmark-done-outline" tone="success" />
              <MDStatsCard label="Revenue" value={formatDisplayPrice(stats.revenue, stats.currency, displayCurrency)} icon="cash-outline" />
              <MDStatsCard label="Customers" value={String(stats.totalCustomers)} icon="people-outline" />
              <MDStatsCard label="Manufacturers" value={String(stats.totalManufacturers)} icon="business-outline" />
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xl }}>
              <View style={{ flex: 1, minWidth: 320, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: spacing.lg, backgroundColor: colors.surfaceRaised }}>
                <MDText variant="h4" style={{ marginBottom: spacing.lg }}>
                  Sales — Last 7 Days
                </MDText>
                <MDChart data={stats.salesTrend} formatValue={(v) => (v > 0 ? formatDisplayPrice(v, stats.currency, displayCurrency) : '')} />
              </View>

              <View style={{ flex: 1, minWidth: 320, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: spacing.lg, backgroundColor: colors.surfaceRaised }}>
                <MDText variant="h4" style={{ marginBottom: spacing.lg }}>
                  Top Categories
                </MDText>
                <MDChart data={stats.topCategories} barColor={colors.brand.accent} />
              </View>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}
