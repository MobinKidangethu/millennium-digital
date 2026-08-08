import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, MDButton, MDEmptyState, MDSkeleton, MDText } from '@/design-system';
import { useProductsByIds } from '@/features/products';
import { useRecentlyViewedStore } from '@/state';
import { MDProductCard } from '@/components/MDProductCard';

export default function RecentlyViewed() {
  const router = useRouter();
  const productIds = useRecentlyViewedStore((s) => s.productIds);
  const clear = useRecentlyViewedStore((s) => s.clear);
  const { data: products, isLoading } = useProductsByIds(productIds);

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl }}>
        <MDText variant="h1">Recently Viewed</MDText>
        {products && products.length > 0 ? <MDButton label="Clear" variant="ghost" size="sm" onPress={clear} /> : null}
      </View>

      {isLoading ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <View key={i} style={{ width: '47%' }}>
              <MDSkeleton height={220} radius={16} />
            </View>
          ))}
        </View>
      ) : !products || products.length === 0 ? (
        <MDEmptyState
          icon={<Ionicons name="time-outline" size={40} color={colors.text.tertiary} />}
          title="Nothing viewed yet"
          description="Products you view will show up here for quick access later."
          actionLabel="Browse Products"
          onAction={() => router.push('/(buyer)/products')}
        />
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg }}>
          {products.map((product) => (
            <View key={product.id} style={{ width: '47%' }}>
              <MDProductCard product={product} />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
