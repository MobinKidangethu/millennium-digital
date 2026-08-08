import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radius, spacing, MDCard, MDText } from '@/design-system';
import type { Category } from '@/types';
import { MDCategoryIcon } from './MDCategoryIcon';

interface MDCategoryCardProps {
  category: Category;
}

export function MDCategoryCard({ category }: MDCategoryCardProps) {
  const router = useRouter();

  return (
    <MDCard
      onPress={() =>
        router.push({ pathname: '/(buyer)/category/[slug]', params: { slug: category.slug } })
      }
      style={{ flex: 1, alignItems: 'center', gap: spacing.sm }}
      elevation="sm"
    >
      <View
        style={[
          {
            width: 48,
            height: 48,
            borderRadius: radius.pill,
            backgroundColor: colors.brand.primarySoft,
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}
      >
        <MDCategoryIcon category={category.name} size={24} />
      </View>
      <MDText variant="bodyMedium" align="center" numberOfLines={2}>
        {category.name}
      </MDText>
      <MDText variant="caption" tone="tertiary">
        {category.productCount} product{category.productCount === 1 ? '' : 's'}
      </MDText>
    </MDCard>
  );
}
