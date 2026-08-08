import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { colors, spacing, MDChart, MDSkeleton, MDText } from '@/design-system';
import { useAnalytics } from '@/features/admin';

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View
      style={{
        flex: 1,
        minWidth: 320,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
        padding: spacing.lg,
        backgroundColor: colors.surfaceRaised,
      }}
    >
      <MDText variant="h4" style={{ marginBottom: spacing.lg }}>
        {title}
      </MDText>
      {children}
    </View>
  );
}

export default function Analytics() {
  const { data, isLoading } = useAnalytics();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ padding: spacing.xl }}>
        <MDText variant="h1" style={{ marginBottom: spacing.xs }}>
          Analytics
        </MDText>
        <MDText variant="body" tone="secondary" style={{ marginBottom: spacing.xl }}>
          Key trends across orders, products, and inventory.
        </MDText>

        {isLoading || !data ? (
          <MDSkeleton height={400} />
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xl }}>
            <ChartCard title="Orders — Last 7 Days">
              <MDChart data={data.salesTrend} />
            </ChartCard>

            <ChartCard title="Inventory Status">
              <MDChart
                data={data.inventoryStatus}
                barColor={colors.status.success}
              />
            </ChartCard>

            {data.topProducts.length > 0 ? (
              <ChartCard title="Top Selling Products">
                <MDChart data={data.topProducts} barColor={colors.brand.accent} />
              </ChartCard>
            ) : null}

            {data.ordersByStatus.length > 0 ? (
              <ChartCard title="Orders by Status">
                <MDChart data={data.ordersByStatus} barColor={colors.plum[400]} />
              </ChartCard>
            ) : null}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
