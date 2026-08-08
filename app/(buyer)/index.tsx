import { useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  layout,
  radius,
  spacing,
  useResponsive,
  MDButton,
  MDSearchBar,
  MDSkeleton,
  MDText,
} from '@/design-system';
import {
  useCategories,
  useFeaturedProducts,
  useBestSellingProducts,
  useNewProducts,
} from '@/features/products';
import { useManufacturers } from '@/features/manufacturers';
import { TRUST_ICONS } from '@/constants/trustIcons';
import { MDCategoryCard } from '@/components/MDCategoryCard';
import { MDManufacturerCard } from '@/components/MDManufacturerCard';
import { ProductRail } from '@/components/ProductRail';
import { Footer } from '@/components/Footer';

const TRUST_POINTS = [
  { icon: TRUST_ICONS.authorizedDistributor, label: 'Genuine Components' },
  { icon: TRUST_ICONS.manufacturers, label: 'Verified Manufacturers' },
  { icon: TRUST_ICONS.productsInStock, label: 'Real-Time Availability' },
  { icon: TRUST_ICONS.shippingAvailable, label: 'Secure Checkout' },
  { icon: TRUST_ICONS.sameDayShip, label: 'Technical Documentation' },
  { icon: TRUST_ICONS.technicalSupport, label: 'Enterprise Support' },
];

const TECHNICAL_VALUE_POINTS = [
  {
    icon: 'document-text-outline' as const,
    title: 'Verified Product Information',
    description: 'Every listing reflects real manufacturer and distributor data — not guesswork.',
  },
  {
    icon: 'download-outline' as const,
    title: 'Technical Datasheets',
    description: 'Access manufacturer datasheets directly from every product page.',
  },
  {
    icon: 'pulse-outline' as const,
    title: 'Availability Visibility',
    description: 'See live stock status and available quantity before you commit.',
  },
  {
    icon: 'business-outline' as const,
    title: 'Manufacturer Information',
    description: 'Clear manufacturer attribution and part traceability on every component.',
  },
  {
    icon: 'cart-outline' as const,
    title: 'Easy Procurement',
    description: 'Streamlined search, filtering, and checkout built for engineering workflows.',
  },
  {
    icon: 'receipt-outline' as const,
    title: 'Reliable Order Management',
    description: 'Track orders end-to-end, from confirmation through delivery.',
  },
];

export default function Home() {
  const router = useRouter();
  const { isDesktopUp } = useResponsive();
  const [heroQuery, setHeroQuery] = useState('');

  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: manufacturers, isLoading: manufacturersLoading } = useManufacturers();
  const { data: featured, isLoading: featuredLoading } = useFeaturedProducts();
  const { data: bestSellers, isLoading: bestSellersLoading } = useBestSellingProducts();
  const { data: newArrivals, isLoading: newArrivalsLoading } = useNewProducts();

  const submitHeroSearch = () => {
    if (!heroQuery.trim()) {
      router.push('/(buyer)/products');
      return;
    }
    router.push({ pathname: '/(buyer)/search', params: { q: heroQuery } });
  };

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
            paddingVertical: isDesktopUp ? spacing['4xl'] : spacing['3xl'],
          }}
        >
          <View
            style={{
              position: 'absolute',
              right: isDesktopUp ? -40 : -80,
              top: isDesktopUp ? 20 : -10,
              width: 420,
              height: 74,
              pointerEvents: 'none',
            }}
          >
            <Image
              source={require('../../assets/Millenium_Logo_new.png')}
              style={{
                width: '100%',
                height: '100%',
                opacity: 0.05,
                transform: [{ scale: 2.2 }],
              }}
              resizeMode="contain"
            />
          </View>

          <View style={{ maxWidth: 640 }}>
            <MDText variant={isDesktopUp ? 'display' : 'h1'}>
              Powering Innovation With Trusted Electronic Components
            </MDText>
            <MDText variant="bodyLg" tone="secondary" style={{ marginTop: spacing.md, marginBottom: spacing.xl }}>
              Genuine parts, verified manufacturers, and technical clarity — built for engineers
              and procurement teams who need to move fast with confidence.
            </MDText>

            <MDSearchBar
              value={heroQuery}
              onChangeText={setHeroQuery}
              onSubmit={submitHeroSearch}
              placeholder="Search part number, manufacturer, or keyword…"
              style={{ backgroundColor: colors.surfaceRaised, marginBottom: spacing.md }}
            />

            <View style={{ flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' }}>
              <MDButton label="Search Components" onPress={submitHeroSearch} />
              <MDButton
                label="Browse Full Catalog"
                variant="outline"
                onPress={() => router.push('/(buyer)/products')}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Trust strip */}
      <View style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            maxWidth: layout.maxContentWidth,
            alignSelf: 'center',
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.lg,
            gap: spacing['2xl'],
          }}
        >
          {TRUST_POINTS.map(({ icon: Icon, label }) => (
            <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Icon width={18} height={18} />
              <MDText variant="bodySm" weight="600" tone="secondary">
                {label}
              </MDText>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={{ maxWidth: layout.maxContentWidth, width: '100%', alignSelf: 'center', padding: spacing.xl, paddingTop: spacing['3xl'] }}>
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
          <MDText variant="h2" style={{ marginBottom: spacing.lg }}>
            Shop by Category
          </MDText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg }}>
            {categoriesLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <View key={i} style={{ width: isDesktopUp ? '15.5%' : '47%' }}>
                    <MDSkeleton height={128} />
                  </View>
                ))
              : categories?.map((category) => (
                  <View key={category.slug} style={{ width: isDesktopUp ? '15.5%' : '47%' }}>
                    <MDCategoryCard category={category} />
                  </View>
                ))}
          </View>
        </View>

        {/* Shop by Manufacturer */}
        <View style={{ marginBottom: spacing['3xl'] }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: spacing.lg,
            }}
          >
            <MDText variant="h2">Shop by Manufacturer</MDText>
            <Pressable
              onPress={() => router.push('/(buyer)/manufacturers')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}
            >
              <MDText variant="bodySm" weight="600" style={{ color: colors.brand.primary }}>
                View All
              </MDText>
              <Ionicons name="chevron-forward" size={14} color={colors.brand.primary} />
            </Pressable>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg }}>
            {manufacturersLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <View key={i} style={{ width: isDesktopUp ? '15.5%' : '47%' }}>
                    <MDSkeleton height={128} />
                  </View>
                ))
              : manufacturers?.slice(0, 6).map((manufacturer) => (
                  <View key={manufacturer.slug} style={{ width: isDesktopUp ? '15.5%' : '47%' }}>
                    <MDManufacturerCard manufacturer={manufacturer} />
                  </View>
                ))}
          </View>
        </View>

        {/* Technical value section */}
        <View style={{ marginBottom: spacing['3xl'] }}>
          <MDText variant="h2" style={{ marginBottom: spacing.xs }}>
            Built for Engineering & Procurement
          </MDText>
          <MDText variant="body" tone="secondary" style={{ marginBottom: spacing.xl, maxWidth: 560 }}>
            Millennium Digital is designed around how engineers and buyers actually evaluate
            components.
          </MDText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg }}>
            {TECHNICAL_VALUE_POINTS.map((point) => (
              <View
                key={point.title}
                style={{
                  width: isDesktopUp ? '31%' : '100%',
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: radius.lg,
                  padding: spacing.lg,
                  gap: spacing.sm,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: radius.md,
                    backgroundColor: colors.brand.primarySoft,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name={point.icon} size={20} color={colors.brand.primary} />
                </View>
                <MDText variant="bodyMedium">{point.title}</MDText>
                <MDText variant="bodySm" tone="secondary">
                  {point.description}
                </MDText>
              </View>
            ))}
          </View>
        </View>

        {/* Final CTA */}
        <View
          style={{
            backgroundColor: colors.brand.primary,
            borderRadius: radius.xl,
            padding: isDesktopUp ? spacing['3xl'] : spacing.xl,
            alignItems: isDesktopUp ? 'flex-start' : 'center',
            marginBottom: spacing['2xl'],
          }}
        >
          <MDText variant="h2" style={{ color: colors.gray[0] }} align={isDesktopUp ? 'left' : 'center'}>
            Find the Components You Need
          </MDText>
          <MDText
            variant="body"
            style={{ color: colors.plum[100], marginTop: spacing.xs, marginBottom: spacing.lg, maxWidth: 480 }}
            align={isDesktopUp ? 'left' : 'center'}
          >
            Search the full catalog or browse by category to get started.
          </MDText>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
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
      </View>

      <Footer />
    </ScrollView>
  );
}
