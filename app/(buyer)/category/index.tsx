import { ScrollView, View } from 'react-native';
import { colors, spacing, layout, useResponsive, MDText, MDSkeleton } from '@/design-system';
import { useCategories } from '@/features/categories';
import { MDCategoryCard } from '@/components/MDCategoryCard';

export default function CategoryListing() {
  const { data: categories, isLoading } = useCategories();
  const { isDesktopUp, isTabletUp } = useResponsive();
  const columns = isDesktopUp ? 4 : isTabletUp ? 3 : 2;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ maxWidth: layout.maxContentWidth, width: '100%', alignSelf: 'center', padding: spacing.xl }}>
        <MDText variant="h1">Shop by Category</MDText>
        <MDText variant="body" tone="secondary" style={{ marginTop: spacing.xs, marginBottom: spacing.xl }}>
          Browse the Millennium Digital catalog by product category.
        </MDText>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg }}>
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <View key={i} style={{ width: `${100 / columns - 3}%` }}>
                  <MDSkeleton height={140} />
                </View>
              ))
            : categories?.map((category) => (
                <View key={category.slug} style={{ width: `${100 / columns - 3}%` }}>
                  <MDCategoryCard category={category} />
                </View>
              ))}
        </View>
      </View>
    </ScrollView>
  );
}
