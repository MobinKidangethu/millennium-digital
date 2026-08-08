import { ActivityIndicator, ScrollView, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { colors, spacing, layout } from '@/design-system';
import { useCategory } from '@/features/categories';
import { ProductCatalogView } from '@/components/ProductCatalogView';
import { MDEmptyState } from '@/design-system';

export default function CategoryDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data: category, isLoading } = useCategory(slug);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.brand.primary} />
      </View>
    );
  }

  if (!category) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <MDEmptyState title="Category not found" description="This category may have been renamed or removed." />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ maxWidth: layout.maxContentWidth, width: '100%', alignSelf: 'center', padding: spacing.xl }}>
        <ProductCatalogView
          title={category.name}
          description={`${category.productCount} product${category.productCount === 1 ? '' : 's'} in this category.`}
          initialFilters={{ category: [category.name] }}
          hideCategoryFilter
        />
      </View>
    </ScrollView>
  );
}
