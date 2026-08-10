import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  layout,
  radius,
  shadow,
  spacing,
  useResponsive,
  MDButton,
  MDSkeleton,
  MDText,
} from '@/design-system';
import {
  useCategories,
  useFeaturedProducts,
  useBestSellingProducts,
  useNewProducts,
  useProducts,
} from '@/features/products';
import { useManufacturers } from '@/features/manufacturers';
import { MDCategoryCard } from '@/components/MDCategoryCard';
import { CatalogIntelligencePanel } from '@/components/CatalogIntelligencePanel';
import { ManufacturerShowcase } from '@/components/ManufacturerShowcase';
import { SegmentCarousel } from '@/components/SegmentCarousel';
import { ProductRail } from '@/components/ProductRail';
import { Footer } from '@/components/Footer';
import { ProtoBadge } from '@/components/ProtoBadge';

const SUPPORT_GRID: { icon: keyof typeof Ionicons.glyphMap; title: string }[] = [
  { icon: 'headset-outline', title: 'Enterprise Support' },
  { icon: 'trending-up-outline', title: 'Governed Pricing' },
  { icon: 'navigate-outline', title: 'Order Tracking' },
  { icon: 'git-network-outline', title: 'Integration Ready' },
];

export default function Home() {
  const router = useRouter();
  const { isDesktopUp } = useResponsive();

  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: manufacturers } = useManufacturers();
  const { data: featured, isLoading: featuredLoading } = useFeaturedProducts();
  const { data: bestSellers, isLoading: bestSellersLoading } = useBestSellingProducts();
  const { data: newArrivals, isLoading: newArrivalsLoading } = useNewProducts();
  const { data: allProducts } = useProducts({});

  const rohsCount = allProducts ? allProducts.filter((p) => p.rohs).length : 0;
  const rohsPct = allProducts && allProducts.length ? Math.round((rohsCount / allProducts.length) * 100) : 0;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Hero */}
      <View style={{ backgroundColor: colors.surface, overflow: 'hidden' }}>
        <View
          style={{
            maxWidth: layout.maxContentWidth,
            width: '100%',
            alignSelf: 'center',
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.xl,
          }}
        >
          <SegmentCarousel />
        </View>
      </View>

      {/* Platform at a Glance */}
      <View style={{ backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <View
          style={{
            maxWidth: layout.maxContentWidth,
            width: '100%',
            alignSelf: 'center',
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.xl,
            flexDirection: isDesktopUp ? 'row' : 'column',
            gap: spacing.lg,
          }}
        >
          {[
            { icon: 'grid-outline' as const, value: `${categories?.length ?? 0}+`, label: 'Engineering Categories' },
            { icon: 'business-outline' as const, value: `${manufacturers?.length ?? 0}+`, label: 'Verified Manufacturers' },
            { icon: 'cube-outline' as const, value: `${allProducts?.length ?? 0}+`, label: 'Catalog Parts' },
          ].map((stat) => (
            <View
              key={stat.label}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                backgroundColor: colors.surfaceRaised,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.lg,
                padding: spacing.lg,
              }}
            >
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: radius.pill,
                  backgroundColor: colors.brand.primarySoft,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name={stat.icon} size={22} color={colors.brand.primary} />
              </View>
              <View>
                <MDText variant="h2">{stat.value}</MDText>
                <MDText variant="bodySm" tone="secondary">
                  {stat.label}
                </MDText>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={{ maxWidth: layout.maxContentWidth, width: '100%', alignSelf: 'center', padding: spacing.xl, paddingTop: spacing['3xl'] }}>
        {/* Manufacturer trust showcase */}
        {manufacturers && manufacturers.length > 0 ? (
          <View
            style={{
              flexDirection: isDesktopUp ? 'row' : 'column',
              alignItems: isDesktopUp ? 'center' : 'stretch',
              gap: spacing['2xl'],
              marginBottom: spacing['3xl'],
            }}
          >
            <View style={{ flex: 1 }}>
              <MDText variant="overline" tone="tertiary" style={{ marginBottom: spacing.xs }}>
                VERIFIED SUPPLY BASE
              </MDText>
              <MDText variant="h2" style={{ marginBottom: spacing.sm }}>
                Top Electronics Manufacturers on Millennium Digital
              </MDText>
              <MDText variant="body" tone="secondary" style={{ marginBottom: spacing.lg, maxWidth: 440 }}>
                Bringing genuine components from verified manufacturers and authorized distributors
                together on a single B2B platform.
              </MDText>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.lg }}>
                {[
                  { icon: 'business-outline' as const, value: `${manufacturers.length}+`, label: 'Manufacturers', accent: colors.brand.primary },
                  { icon: 'cube-outline' as const, value: `${allProducts?.length ?? 0}+`, label: 'Parts Sourced', accent: colors.teal[500] },
                  { icon: 'leaf-outline' as const, value: `${rohsPct}%`, label: 'RoHS Compliant', accent: colors.status.success },
                ].map((stat) => (
                  <View
                    key={stat.label}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.sm,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: radius.lg,
                      paddingVertical: spacing.sm,
                      paddingHorizontal: spacing.md,
                    }}
                  >
                    <View
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: radius.pill,
                        backgroundColor: `${stat.accent}1A`,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name={stat.icon} size={16} color={stat.accent} />
                    </View>
                    <View>
                      <MDText variant="bodyMedium" style={{ color: stat.accent }}>
                        {stat.value}
                      </MDText>
                      <MDText variant="caption" tone="tertiary">
                        {stat.label}
                      </MDText>
                    </View>
                  </View>
                ))}
              </View>

              <MDButton label="View All Manufacturers" variant="outline" onPress={() => router.push('/(buyer)/manufacturers')} />
            </View>
            <View style={{ flex: 1 }}>
              <ManufacturerShowcase manufacturers={manufacturers} />
            </View>
          </View>
        ) : null}

        {/* Engineering Workspace teaser */}
        <View style={{ marginBottom: spacing['3xl'] }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: spacing.lg, flexWrap: 'wrap', gap: spacing.sm }}>
            <View>
              <MDText variant="h2">Engineering Workspace</MDText>
              <MDText variant="body" tone="secondary" style={{ marginTop: spacing.xs }}>
                AI search, BOM matching, and direct design requests — beyond browse-and-buy.
              </MDText>
            </View>
            <Pressable onPress={() => router.push('/(buyer)/engineering')} style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
              <MDText variant="bodySm" weight="600" style={{ color: colors.brand.primary }}>
                View All Tools
              </MDText>
              <Ionicons name="chevron-forward" size={14} color={colors.brand.primary} />
            </Pressable>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg }}>
            {[
              { icon: 'sparkles-outline' as const, title: 'AI Engineering Search', desc: 'Plain-language requirement to matched parts.', href: '/(buyer)/ai-search' },
              { icon: 'document-attach-outline' as const, title: 'BOM & RFQ', desc: 'Upload a BOM, match components, request a quote.', href: '/(buyer)/bom' },
              { icon: 'construct-outline' as const, title: 'Design Request', desc: 'Send our engineering team a structured brief.', href: '/(buyer)/design-request' },
            ].map((item) => (
              <Pressable
                key={item.title}
                onPress={() => router.push(item.href as never)}
                style={{
                  width: isDesktopUp ? '31.5%' : '100%',
                  borderWidth: 1,
                  borderColor: colors.brand.primarySoftBorder,
                  backgroundColor: colors.brand.primarySoft,
                  borderRadius: radius.lg,
                  padding: spacing.lg,
                  gap: spacing.xs,
                }}
              >
                <Ionicons name={item.icon} size={22} color={colors.brand.primary} />
                <MDText variant="bodyMedium" style={{ marginTop: spacing.xs }}>
                  {item.title}
                </MDText>
                <MDText variant="caption" tone="secondary">
                  {item.desc}
                </MDText>
              </Pressable>
            ))}
          </View>
        </View>

        <ProductRail
          title="Featured Products"
          subtitle="Hand-picked components from our catalog"
          products={featured}
          isLoading={featuredLoading}
          viewAllHref="/(buyer)/products"
        />
        <ProductRail
          title="Best Sellers"
          subtitle="Popular components with proven demand"
          products={bestSellers}
          isLoading={bestSellersLoading}
          viewAllHref="/(buyer)/products"
        />
        <ProductRail
          title="New Arrivals"
          subtitle="Recently added to the catalog"
          products={newArrivals}
          isLoading={newArrivalsLoading}
          viewAllHref="/(buyer)/products"
        />

        {/* Shop by Category */}
        <View style={{ marginBottom: spacing['3xl'] }}>
          <MDText variant="h2" style={{ marginBottom: spacing.xs }}>
            Browse All Categories
          </MDText>
          <MDText variant="bodySm" tone="secondary" style={{ marginBottom: spacing.lg }}>
            Jump straight to a category to filter, compare, and source parts.
          </MDText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing.sm }}>
            {categoriesLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <View
                    key={i}
                    style={{ width: isDesktopUp ? '25%' : '50%', paddingHorizontal: spacing.sm, marginBottom: spacing.lg }}
                  >
                    <MDSkeleton height={168} />
                  </View>
                ))
              : categories?.map((category) => (
                  <View
                    key={category.slug}
                    style={{ width: isDesktopUp ? '25%' : '50%', paddingHorizontal: spacing.sm, marginBottom: spacing.lg }}
                  >
                    <MDCategoryCard category={category} />
                  </View>
                ))}
          </View>
        </View>

        {/* Supplier ecosystem split */}
        <View
          style={{
            flexDirection: isDesktopUp ? 'row' : 'column',
            gap: spacing.lg,
            marginBottom: spacing['3xl'],
            backgroundColor: colors.surface,
            borderRadius: radius.xl,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden',
          }}
        >
          <View style={{ flex: 1, padding: isDesktopUp ? spacing['2xl'] : spacing.xl, justifyContent: 'center' }}>
            <MDText variant="overline" tone="tertiary" style={{ marginBottom: spacing.xs }}>
              SUPPLIER ECOSYSTEM
            </MDText>
            <MDText variant="h2" style={{ marginBottom: spacing.sm }}>
              Selling Electronics Components? Join the Marketplace.
            </MDText>
            <MDText variant="body" tone="secondary" style={{ marginBottom: spacing.lg, maxWidth: 440 }}>
              Millennium Digital connects manufacturers and distributors directly with engineers and
              procurement teams already searching by part, spec, and AI-assisted requirement.
            </MDText>
            <View style={{ flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' }}>
              <MDButton label="Explore Supplier Network" onPress={() => router.push('/(buyer)/suppliers')} />
              <MDButton label="View Manufacturers" variant="outline" onPress={() => router.push('/(buyer)/manufacturers')} />
            </View>
          </View>
          <View
            style={{
              flex: 1,
              padding: isDesktopUp ? spacing['2xl'] : spacing.xl,
              backgroundColor: colors.gray[900],
              justifyContent: 'center',
              gap: spacing.md,
            }}
          >
            {[
              { icon: 'shield-checkmark-outline' as const, title: 'Maker-Checker Governance', desc: 'Every listing independently validated before publishing.' },
              { icon: 'document-text-outline' as const, title: 'Structured RFQ Pipeline', desc: 'Receive RFQs with full technical context, not a bare email.' },
              { icon: 'stats-chart-outline' as const, title: 'Performance Analytics', desc: 'Product-level visibility into RFQs, orders, and fulfillment.' },
            ].map((item) => (
              <View key={item.title} style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' }}>
                <Ionicons name={item.icon} size={18} color={colors.plum[300]} style={{ marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <MDText variant="bodySm" weight="700" style={{ color: colors.gray[0] }}>
                    {item.title}
                  </MDText>
                  <MDText variant="caption" style={{ color: colors.gray[400] }}>
                    {item.desc}
                  </MDText>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Technical value bento */}
        <View style={{ marginBottom: spacing['3xl'] }}>
          <MDText variant="h2" style={{ marginBottom: spacing.xs }}>
            Built for Engineering &amp; Procurement
          </MDText>
          <MDText variant="body" tone="secondary" style={{ marginBottom: spacing.xl, maxWidth: 560 }}>
            Millennium Digital is designed around how engineers and buyers actually evaluate components.
          </MDText>

          <View style={{ flexDirection: isDesktopUp ? 'row' : 'column', gap: spacing.lg, marginBottom: spacing.lg }}>
            <Pressable
              onPress={() => router.push('/(buyer)/ai-search')}
              style={{
                flex: isDesktopUp ? 2 : undefined,
                borderWidth: 1,
                borderColor: colors.brand.primarySoftBorder,
                backgroundColor: colors.brand.primarySoft,
                borderRadius: radius.lg,
                padding: spacing.xl,
                gap: spacing.sm,
                minHeight: 180,
                justifyContent: 'flex-end',
              }}
            >
              <Ionicons name="sparkles-outline" size={28} color={colors.brand.primary} />
              <MDText variant="h3">AI-Assisted Engineering Search</MDText>
              <MDText variant="bodySm" tone="secondary" style={{ maxWidth: 420, marginBottom: spacing.xs }}>
                Describe a requirement in plain language — get structured criteria and explainable matches
                from the real catalog, not a keyword guess.
              </MDText>
              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                {['Plain-language requirement', 'Structured criteria', 'Explainable matches'].map((step, i, arr) => (
                  <View key={step} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View
                      style={{
                        borderWidth: 1,
                        borderColor: colors.brand.primarySoftBorder,
                        backgroundColor: colors.gray[0],
                        borderRadius: radius.pill,
                        paddingHorizontal: spacing.sm,
                        paddingVertical: 4,
                      }}
                    >
                      <MDText variant="caption" weight="600" style={{ color: colors.brand.primary }}>
                        {step}
                      </MDText>
                    </View>
                    {i < arr.length - 1 ? (
                      <Ionicons name="arrow-forward" size={12} color={colors.brand.primary} />
                    ) : null}
                  </View>
                ))}
              </View>
            </Pressable>
            <View
              style={{
                flex: 1,
                borderRadius: radius.lg,
                padding: spacing.xl,
                gap: spacing.sm,
                minHeight: 180,
                justifyContent: 'flex-end',
                backgroundColor: colors.gray[900],
              }}
            >
              <Ionicons name="trending-up-outline" size={28} color={colors.gray[0]} />
              <MDText variant="h4" style={{ color: colors.gray[0] }}>
                Governed Pricing Transparency
              </MDText>
              <MDText variant="bodySm" style={{ color: colors.gray[400], marginBottom: spacing.xs }}>
                Every RFQ shows the base → volume → supplier → contract pricing steps that produced the
                final approved price.
              </MDText>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, height: 44 }}>
                {[
                  { label: 'Base', h: 44 },
                  { label: 'Volume', h: 36 },
                  { label: 'Supplier', h: 29 },
                  { label: 'Contract', h: 24 },
                  { label: 'Approved', h: 20 },
                ].map((step, i) => (
                  <View key={step.label} style={{ alignItems: 'center', gap: 4 }}>
                    <View
                      style={{
                        width: 20,
                        height: step.h,
                        borderRadius: radius.sm,
                        backgroundColor: i === 4 ? colors.teal[500] : 'rgba(255,255,255,0.22)',
                      }}
                    />
                  </View>
                ))}
              </View>
              <MDText variant="caption" style={{ color: colors.gray[500] }}>
                Illustrative example — see RFQ detail for real governed pricing
              </MDText>
            </View>
          </View>

          <CatalogIntelligencePanel
            categories={categories}
            manufacturers={manufacturers}
            rohsCount={rohsCount}
            rohsPct={rohsPct}
            totalCount={allProducts?.length ?? 0}
            isDesktopUp={isDesktopUp}
          />
        </View>

        {/* Built for Scale — live stats + target governance metrics */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.xl,
            padding: isDesktopUp ? spacing['2xl'] : spacing.xl,
            marginBottom: spacing['3xl'],
          }}
        >
          <MDText variant="h2" style={{ marginBottom: spacing.xs }}>
            Built for Scale
          </MDText>
          <MDText variant="body" tone="secondary" style={{ marginBottom: spacing.xl, maxWidth: 560 }}>
            Live catalog numbers today, alongside the governance targets this architecture is built to meet
            as it grows. Solid rings mark numbers measured from the live catalog; dashed rings mark forward
            governance targets.
          </MDText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg }}>
            {[
              { value: `${allProducts?.length ?? 0}+`, label: 'Catalog Parts', live: true, icon: 'cube-outline' as const, accent: colors.brand.primary },
              { value: `${manufacturers?.length ?? 0}+`, label: 'Verified Manufacturers', live: true, icon: 'business-outline' as const, accent: colors.teal[500] },
              { value: `${categories?.length ?? 0}+`, label: 'Categories', live: true, icon: 'grid-outline' as const, accent: colors.plum[400] },
              { value: `${rohsPct}%`, label: 'RoHS Compliant', live: true, icon: 'leaf-outline' as const, accent: colors.status.success },
              { value: '<5 min', label: 'ERP ↔ Web Stock Sync', live: false, icon: 'sync-outline' as const, accent: colors.amber[500] },
              { value: '>99%', label: 'SKU Load Accuracy', live: false, icon: 'checkmark-done-outline' as const, accent: colors.amber[600] },
            ].map((stat) => {
              const ringSize = 44;
              const ringStroke = 2;
              const ringR = (ringSize - ringStroke) / 2;
              const ringC = 2 * Math.PI * ringR;
              return (
                <View
                  key={stat.label}
                  style={{
                    width: isDesktopUp ? '15.5%' : '30%',
                    backgroundColor: colors.surfaceRaised,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: radius.lg,
                    padding: spacing.md,
                    gap: 6,
                  }}
                >
                  <View style={{ width: ringSize, height: ringSize, alignItems: 'center', justifyContent: 'center' }}>
                    <Svg width={ringSize} height={ringSize} style={{ position: 'absolute' }}>
                      <Circle
                        cx={ringSize / 2}
                        cy={ringSize / 2}
                        r={ringR}
                        stroke={stat.accent}
                        strokeWidth={ringStroke}
                        strokeDasharray={stat.live ? undefined : `${ringC / 24} ${ringC / 36}`}
                        fill="none"
                      />
                    </Svg>
                    <View
                      style={{
                        width: ringSize - 16,
                        height: ringSize - 16,
                        borderRadius: radius.pill,
                        backgroundColor: `${stat.accent}1A`,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name={stat.icon} size={15} color={stat.accent} />
                    </View>
                  </View>
                  <MDText variant="h3" style={{ color: stat.accent }}>
                    {stat.value}
                  </MDText>
                  <MDText variant="caption" tone="secondary">
                    {stat.label}
                  </MDText>
                  {!stat.live ? <ProtoBadge kind="target" label="Target" /> : null}
                </View>
              );
            })}
          </View>
        </View>

        {/* Final CTA split */}
        <View
          style={{
            flexDirection: isDesktopUp ? 'row' : 'column',
            gap: spacing.lg,
            marginBottom: spacing['2xl'],
          }}
        >
          <View
            style={{
              flex: isDesktopUp ? 2 : undefined,
              backgroundColor: colors.brand.primary,
              borderRadius: radius.xl,
              padding: isDesktopUp ? spacing['3xl'] : spacing.xl,
              alignItems: isDesktopUp ? 'flex-start' : 'center',
              justifyContent: 'center',
            }}
          >
            <MDText variant="h2" style={{ color: colors.gray[0] }} align={isDesktopUp ? 'left' : 'center'}>
              Find the Components You Need
            </MDText>
            <MDText
              variant="body"
              style={{ color: colors.plum[100], marginTop: spacing.xs, marginBottom: spacing.lg, maxWidth: 420 }}
              align={isDesktopUp ? 'left' : 'center'}
            >
              Search the full catalog, browse by category, or let AI find the right part for your design.
            </MDText>
            <View style={{ flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' }}>
              <MDButton
                label="Browse Catalog"
                variant="secondary"
                onPress={() => router.push('/(buyer)/products')}
              />
              <MDButton
                label="Search Now"
                variant="ghost"
                textColor={colors.gray[0]}
                style={{ borderWidth: 1, borderColor: colors.gray[0] }}
                onPress={() => router.push('/(buyer)/search')}
              />
            </View>
          </View>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: spacing.md,
              backgroundColor: colors.surface,
              borderRadius: radius.xl,
              borderWidth: 1,
              borderColor: colors.border,
              padding: spacing.lg,
            }}
          >
            {SUPPORT_GRID.map((item) => (
              <View key={item.title} style={{ width: '47%', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: radius.pill,
                    backgroundColor: colors.brand.primarySoft,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name={item.icon} size={20} color={colors.brand.primary} />
                </View>
                <MDText variant="caption" weight="700" align="center">
                  {item.title}
                </MDText>
              </View>
            ))}
          </View>
        </View>
      </View>

      <Footer />
    </ScrollView>
  );
}
