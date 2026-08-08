import { Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, useResponsive, MDSkeleton, MDText } from '@/design-system';
import type { Product } from '@/types';
import { MDProductCard } from './MDProductCard';

interface ProductRailProps {
  title: string;
  subtitle?: string;
  products: Product[] | undefined;
  isLoading?: boolean;
  viewAllHref?: string;
}

export function ProductRail({ title, subtitle, products, isLoading, viewAllHref }: ProductRailProps) {
  const router = useRouter();
  const { isDesktopUp } = useResponsive();
  const cardWidth = isDesktopUp ? 260 : 200;

  if (!isLoading && (!products || products.length === 0)) return null;

  return (
    <View style={{ marginBottom: spacing['3xl'] }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: spacing.lg,
        }}
      >
        <View>
          <MDText variant="h2">{title}</MDText>
          {subtitle ? (
            <MDText variant="body" tone="secondary" style={{ marginTop: spacing.xs }}>
              {subtitle}
            </MDText>
          ) : null}
        </View>
        {viewAllHref ? (
          <Pressable
            onPress={() => router.push(viewAllHref as never)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}
          >
            <MDText variant="bodySm" weight="600" style={{ color: colors.brand.primary }}>
              View All
            </MDText>
            <Ionicons name="chevron-forward" size={14} color={colors.brand.primary} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.lg }}>
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <View key={i} style={{ width: cardWidth, gap: spacing.sm }}>
                <MDSkeleton height={148} radius={16} />
                <MDSkeleton height={14} width="60%" />
                <MDSkeleton height={14} width="90%" />
              </View>
            ))
          : products?.map((product) => (
              <View key={product.id} style={{ width: cardWidth }}>
                <MDProductCard product={product} />
              </View>
            ))}
      </ScrollView>
    </View>
  );
}
