import { useState } from 'react';
import { Image, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow, spacing, MDCard, MDText } from '@/design-system';
import type { Category } from '@/types';
import { resolveCategoryVisual } from '@/constants/categoryImages';
import { MDCategoryIcon } from './MDCategoryIcon';
import { resolveCategoryIcon } from '@/utils';

interface MDCategoryCardProps {
  category: Category;
}

/** Ionicon fallback for categories without a custom SVG in assets/icons/categories/ (e.g. "Power", added after the Mouser catalog merge). */
function fallbackIconName(categoryName: string): keyof typeof Ionicons.glyphMap {
  const key = categoryName.trim().toLowerCase();
  if (key === 'power') return 'flash-outline';
  return 'apps-outline';
}

export function MDCategoryCard({ category }: MDCategoryCardProps) {
  const router = useRouter();
  const [imageFailed, setImageFailed] = useState(false);
  const { imageUrl, accent } = resolveCategoryVisual(category.name);
  const hasCustomIcon = !!resolveCategoryIcon(category.name);
  const showImage = !!imageUrl && !imageFailed;

  return (
    <MDCard
      onPress={() =>
        router.push({ pathname: '/(buyer)/category/[slug]', params: { slug: category.slug } })
      }
      padding={0}
      elevation="sm"
      style={{ overflow: 'hidden' }}
    >
      <View style={{ height: 96, backgroundColor: `${accent}1A` }}>
        {showImage ? (
          <Image
            source={{ uri: imageUrl }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
            onError={() => setImageFailed(true)}
            accessibilityLabel={category.name}
          />
        ) : null}
      </View>

      <View style={{ alignItems: 'center', marginTop: -22 }}>
        <View
          style={[
            {
              width: 44,
              height: 44,
              borderRadius: radius.pill,
              backgroundColor: colors.gray[0],
              borderWidth: 2,
              borderColor: accent,
              alignItems: 'center',
              justifyContent: 'center',
            },
            shadow.sm,
          ]}
        >
          {hasCustomIcon ? (
            <MDCategoryIcon category={category.name} size={20} color={accent} />
          ) : (
            <Ionicons name={fallbackIconName(category.name)} size={20} color={accent} />
          )}
        </View>
      </View>

      <View style={{ padding: spacing.md, paddingTop: spacing.xs, alignItems: 'center', gap: 2 }}>
        <MDText variant="bodyMedium" align="center" numberOfLines={2}>
          {category.name}
        </MDText>
        <MDText variant="caption" tone="tertiary">
          {category.productCount} product{category.productCount === 1 ? '' : 's'}
        </MDText>
      </View>
    </MDCard>
  );
}
