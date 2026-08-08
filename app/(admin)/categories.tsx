import { ScrollView, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { colors, radius, spacing, MDSkeleton, MDSwitch, MDText } from '@/design-system';
import { useCategories, productKeys } from '@/features/products';
import { useCatalogMetaStore } from '@/state';
import { MDCategoryIcon } from '@/components/MDCategoryIcon';

export default function CategoryManagement() {
  const queryClient = useQueryClient();
  const { data: categories, isLoading } = useCategories({ includeDisabled: true });
  const toggleCategory = useCatalogMetaStore((s) => s.toggleCategory);

  const handleToggle = (name: string) => {
    toggleCategory(name);
    queryClient.invalidateQueries({ queryKey: productKeys.categories });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ padding: spacing.xl }}>
        <MDText variant="h1" style={{ marginBottom: spacing.xs }}>
          Categories
        </MDText>
        <MDText variant="body" tone="secondary" style={{ marginBottom: spacing.xl }}>
          Categories are derived automatically from the product catalog — adding a product with a
          new category name creates it here. Disable a category to hide it from buyer browsing
          without removing its products.
        </MDText>

        {isLoading ? (
          <MDSkeleton height={300} />
        ) : (
          <View style={{ gap: spacing.sm }}>
            {categories?.map((category) => (
              <View
                key={category.slug}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: radius.lg,
                  padding: spacing.lg,
                  backgroundColor: colors.surfaceRaised,
                  opacity: category.disabled ? 0.6 : 1,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: radius.pill,
                      backgroundColor: colors.brand.primarySoft,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <MDCategoryIcon category={category.name} size={20} />
                  </View>
                  <View>
                    <MDText variant="bodyMedium">{category.name}</MDText>
                    <MDText variant="caption" tone="tertiary">
                      {category.productCount} product{category.productCount === 1 ? '' : 's'}
                    </MDText>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <MDText variant="caption" tone="secondary">
                    {category.disabled ? 'Hidden' : 'Visible'}
                  </MDText>
                  <MDSwitch value={!category.disabled} onValueChange={() => handleToggle(category.name)} accessibilityLabel={`Toggle ${category.name}`} />
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
