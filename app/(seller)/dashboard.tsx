import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { useRouter } from 'expo-router';
import { colors, radius, spacing, useResponsive, MDButton, MDCard, MDChart, MDText, type ChartDatum } from '@/design-system';
import { useSellerOrders, useSellerProducts, useSellerRfqs } from '@/features/sellers';
import { useAuthStore, useGovernanceStore } from '@/state';
import { formatDisplayPrice } from '@/utils';
import { MDStatsCard } from '@/components/MDStatsCard';

export default function SellerDashboard() {
  const router = useRouter();
  const { isDesktopUp } = useResponsive();
  const session = useAuthStore((s) => s.session);
  const manufacturers = session?.user.sellerManufacturers ?? [];
  const { data: products, isLoading: productsLoading } = useSellerProducts(manufacturers);
  const { data: orderViews, isLoading: ordersLoading } = useSellerOrders(manufacturers);
  const { data: rfqViews, isLoading: rfqsLoading } = useSellerRfqs(manufacturers);
  const getRecord = useGovernanceStore((s) => s.getRecord);

  const isLoading = productsLoading || ordersLoading || rfqsLoading;

  const stats = useMemo(() => {
    const published = products.filter((p) => p.isPublished).length;
    const pendingReview = products.filter((p) => {
      const stage = getRecord('product', String(p.id)).stage;
      return stage !== 'draft' && stage !== 'published';
    }).length;
    const drafts = products.filter((p) => getRecord('product', String(p.id)).stage === 'draft').length;

    const nonCancelled = orderViews.filter((v) => v.order.status !== 'cancelled');
    const revenue = nonCancelled.reduce((sum, v) => sum + v.myTotal, 0);
    const openRfqs = rfqViews.filter((v) => v.rfq.status === 'submitted').length;

    return { published, pendingReview, drafts, revenue, openRfqs, orderCount: nonCancelled.length };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, orderViews, rfqViews]);

  const currency = orderViews[0]?.order.currency ?? 'INR';

  const revenueTrend: ChartDatum[] = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - i));
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      const dayTotal = orderViews
        .filter((v) => v.order.status !== 'cancelled')
        .filter((v) => {
          const placed = new Date(v.order.placedAt);
          return placed >= date && placed < nextDate;
        })
        .reduce((sum, v) => sum + v.myTotal, 0);
      return { label: date.toLocaleDateString(undefined, { weekday: 'short' }), value: dayTotal };
    });
  }, [orderViews]);

  const topProducts: ChartDatum[] = useMemo(() => {
    const byPart = new Map<string, number>();
    for (const view of orderViews) {
      if (view.order.status === 'cancelled') continue;
      for (const item of view.myItems) {
        byPart.set(item.manufacturerPartNumber, (byPart.get(item.manufacturerPartNumber) ?? 0) + item.quantity);
      }
    }
    return Array.from(byPart.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, value]) => ({ label, value }));
  }, [orderViews]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ padding: spacing.xl }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs, flexWrap: 'wrap', gap: spacing.sm }}>
          <MDText variant="h1">Seller Dashboard</MDText>
          <MDButton label="Add Product" onPress={() => router.push('/(seller)/products/new')} />
        </View>
        <MDText variant="bodySm" tone="secondary" style={{ marginBottom: spacing.xl }}>
          {manufacturers.join(', ') || 'Your brand'} — revenue and performance reflect order/RFQ history stored in this prototype session.
        </MDText>

        <View
          style={{
            flexDirection: isDesktopUp ? 'row' : 'column',
            alignItems: 'center',
            gap: spacing.lg,
            backgroundColor: colors.gray[900],
            borderRadius: radius.xl,
            padding: isDesktopUp ? spacing.xl : spacing.lg,
            marginBottom: spacing.xl,
          }}
        >
          <ExpoImage
            source={require('../../assets/buyer-seller-connection.gif')}
            style={{ width: 160, height: 107 }}
            contentFit="contain"
            accessibilityLabel="Millennium Digital connecting buyers and sellers"
          />
          <View style={{ flex: 1, gap: 4, alignItems: isDesktopUp ? 'flex-start' : 'center' }}>
            <MDText variant="h4" style={{ color: colors.gray[0] }} align={isDesktopUp ? 'left' : 'center'}>
              You're on the supply side of the ecosystem
            </MDText>
            <MDText variant="bodySm" style={{ color: colors.gray[400], maxWidth: 480 }} align={isDesktopUp ? 'left' : 'center'}>
              Every product you publish reaches verified buyers directly — seamless discovery, reliable fulfillment, trusted governance.
            </MDText>
          </View>
        </View>

        {isLoading ? null : (
          <>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.xl }}>
              <MDStatsCard label="Revenue (your items)" value={formatDisplayPrice(stats.revenue, currency, currency)} icon="cash-outline" tone="success" />
              <MDStatsCard label="Orders containing your items" value={String(stats.orderCount)} icon="receipt-outline" />
              <MDStatsCard label="Open RFQs" value={String(stats.openRfqs)} icon="document-text-outline" tone="warning" />
              <MDStatsCard label="Published products" value={String(stats.published)} icon="checkmark-circle-outline" tone="success" />
              <MDStatsCard label="Awaiting review" value={String(stats.pendingReview)} icon="hourglass-outline" tone="warning" />
              <MDStatsCard label="Drafts" value={String(stats.drafts)} icon="create-outline" />
            </View>

            <View style={{ flexDirection: isDesktopUp ? 'row' : 'column', gap: spacing.lg }}>
              <MDCard padding="lg" style={{ flex: 1 }}>
                <MDText variant="h4" style={{ marginBottom: spacing.md }}>
                  Revenue — Last 7 Days
                </MDText>
                {revenueTrend.every((d) => d.value === 0) ? (
                  <MDText variant="bodySm" tone="tertiary">
                    No orders for your products yet in this window.
                  </MDText>
                ) : (
                  <MDChart data={revenueTrend} formatValue={(v) => formatDisplayPrice(v, currency, currency)} />
                )}
              </MDCard>

              <MDCard padding="lg" style={{ flex: 1 }}>
                <MDText variant="h4" style={{ marginBottom: spacing.md }}>
                  Top Products by Units Sold
                </MDText>
                {topProducts.length === 0 ? (
                  <MDText variant="bodySm" tone="tertiary">
                    No sales recorded yet for your products.
                  </MDText>
                ) : (
                  <MDChart data={topProducts} barColor={colors.teal[500]} />
                )}
              </MDCard>
            </View>

            {products.length === 0 ? (
              <View
                style={{
                  marginTop: spacing.xl,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: radius.lg,
                  padding: spacing.xl,
                  backgroundColor: colors.surfaceRaised,
                  alignItems: 'flex-start',
                }}
              >
                <MDText variant="h4" style={{ marginBottom: spacing.xs }}>
                  List your first product
                </MDText>
                <MDText variant="bodySm" tone="secondary" style={{ marginBottom: spacing.md, maxWidth: 480 }}>
                  You don't have any listings yet. Add a product to start selling — it goes live after
                  Maker-Checker review.
                </MDText>
                <MDButton label="Add Product" onPress={() => router.push('/(seller)/products/new')} />
              </View>
            ) : null}
          </>
        )}
      </View>
    </ScrollView>
  );
}
