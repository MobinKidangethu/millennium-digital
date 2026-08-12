import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { colors, radius, spacing, layout, useResponsive, MDText } from '@/design-system';
import { useCategories } from '@/features/categories';
import { MDCategoryIcon } from '@/components/MDCategoryIcon';
import { ProductCatalogView } from '@/components/ProductCatalogView';

const ALL_KEY = '__all__';

export default function ProductCatalog() {
  const { isDesktopUp } = useResponsive();
  const { data: categories } = useCategories();
  const [selected, setSelected] = useState<string>(ALL_KEY);

  const active = selected;
  const isAll = active === ALL_KEY;

  const titleBlock = (
    <View style={{ marginBottom: spacing.lg }}>
      <MDText variant="overline" tone="tertiary" style={{ marginBottom: spacing.xs }}>
        ENGINEERING COMPONENT DISCOVERY
      </MDText>
      <MDText variant="h1">Products</MDText>
      <MDText variant="body" tone="secondary" style={{ marginTop: spacing.xs }}>
        Browse the Millennium Digital catalog by category, then refine with technical filters.
      </MDText>
    </View>
  );

  const categoryBar = (
    <View
      style={{
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        backgroundColor: colors.surface,
        padding: spacing.sm,
      }}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
        <CategoryPill label="All Products" active={isAll} onPress={() => setSelected(ALL_KEY)} />
        {categories?.map((category) => (
          <CategoryPill
            key={category.slug}
            label={category.name}
            count={category.productCount}
            icon={category.name}
            active={!isAll && active === category.name}
            onPress={() => setSelected(category.name)}
          />
        ))}
      </ScrollView>
    </View>
  );

  const catalog = (
    <ProductCatalogView
      key={active}
      title={isAll ? 'All Products' : active}
      description={isAll ? 'The full Millennium Digital catalog.' : `Components in the ${active} category.`}
      initialFilters={isAll ? {} : { category: [active] }}
      hideCategoryFilter={!isAll}
      layout="flow"
    />
  );

  // Desktop: the title scrolls away like normal page content, but the
  // category bar ("menu" for browsing categories) locks to the top of the
  // scroll region once it reaches it (position: sticky), staying visible
  // while filters + the product grid keep scrolling underneath in the same
  // continuous page scroll. Mobile keeps the simpler plain flow (no sticky
  // bar — there's less vertical real estate to justify pinning it).
  if (isDesktopUp) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View
            style={{
              maxWidth: layout.maxContentWidth,
              width: '100%',
              alignSelf: 'center',
              paddingHorizontal: spacing.xl,
              paddingTop: spacing.xl,
            }}
          >
            {titleBlock}
          </View>

          <View
            style={
              {
                position: 'sticky',
                top: 0,
                zIndex: 5,
                backgroundColor: colors.background,
                paddingBottom: spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              } as any
            }
          >
            <View
              style={{
                maxWidth: layout.maxContentWidth,
                width: '100%',
                alignSelf: 'center',
                paddingHorizontal: spacing.xl,
                paddingTop: spacing.sm,
              }}
            >
              {categoryBar}
            </View>
          </View>

          <View
            style={{
              maxWidth: layout.maxContentWidth,
              width: '100%',
              alignSelf: 'center',
              paddingHorizontal: spacing.xl,
              paddingTop: spacing.xl,
              paddingBottom: spacing.xl,
            }}
          >
            {catalog}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ maxWidth: layout.maxContentWidth, width: '100%', alignSelf: 'center', padding: spacing.xl }}>
        {titleBlock}
        <View style={{ marginBottom: spacing.xl }}>{categoryBar}</View>
        {catalog}
      </View>
    </ScrollView>
  );
}

function CategoryPill({
  label,
  count,
  icon,
  active,
  onPress,
}: {
  label: string;
  count?: number;
  icon?: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: radius.md,
        backgroundColor: active ? colors.brand.primary : 'transparent',
      }}
    >
      {icon ? (
        <MDCategoryIcon category={icon} size={16} color={active ? colors.gray[0] : colors.text.secondary} />
      ) : null}
      <MDText variant="bodySm" weight="600" style={{ color: active ? colors.gray[0] : colors.text.secondary }}>
        {label}
      </MDText>
      {count != null ? (
        <MDText variant="caption" style={{ color: active ? colors.gray[0] : colors.text.tertiary }}>
          {count}
        </MDText>
      ) : null}
    </Pressable>
  );
}
