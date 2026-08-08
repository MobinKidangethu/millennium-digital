import { useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  layout,
  spacing,
  useResponsive,
  MDText,
  MDButton,
  MDSearchBar,
} from '@/design-system';
import { useCategories } from '@/features/categories';
import { useCartStore, selectCartCount, useWishlistStore, useCompareStore, useAuthStore } from '@/state';

function HeaderIconLink({
  icon,
  label,
  count,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  count?: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={{ alignItems: 'center', paddingHorizontal: spacing.sm, position: 'relative' }}
    >
      <Ionicons name={icon} size={22} color={colors.text.primary} />
      {count ? (
        <View
          style={{
            position: 'absolute',
            top: -4,
            right: -2,
            backgroundColor: colors.brand.primary,
            borderRadius: 999,
            minWidth: 16,
            height: 16,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 3,
          }}
        >
          <MDText style={{ color: colors.gray[0], fontSize: 10 }} weight="700">
            {count > 99 ? '99+' : count}
          </MDText>
        </View>
      ) : null}
    </Pressable>
  );
}

export function BuyerHeader() {
  const router = useRouter();
  const { isDesktopUp } = useResponsive();
  const [query, setQuery] = useState('');
  const { data: categories } = useCategories();
  const cartCount = useCartStore(selectCartCount);
  const wishlistCount = useWishlistStore((s) => s.productIds.length);
  const compareCount = useCompareStore((s) => s.productIds.length);
  const session = useAuthStore((s) => s.session);

  const submitSearch = () => {
    if (!query.trim()) return;
    router.push({ pathname: '/(buyer)/search', params: { q: query } });
  };

  if (!isDesktopUp) {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.lg,
          height: 56,
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Pressable onPress={() => router.push('/(buyer)')} accessibilityLabel="Millennium Digital home">
          <Image
            source={require('../../assets/Millenium_Logo_new.png')}
            style={{ width: 132, height: 23 }}
            resizeMode="contain"
          />
        </Pressable>
        <HeaderIconLink
          icon="cart-outline"
          label="Cart"
          count={cartCount}
          onPress={() => router.push('/(buyer)/cart')}
        />
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xl,
          maxWidth: layout.maxContentWidth,
          width: '100%',
          alignSelf: 'center',
          paddingHorizontal: spacing.xl,
          height: layout.headerHeight,
        }}
      >
        <Pressable onPress={() => router.push('/(buyer)')} accessibilityLabel="Millennium Digital home">
          <Image
            source={require('../../assets/Millenium_Logo_new.png')}
            style={{ width: 176, height: 31 }}
            resizeMode="contain"
          />
        </Pressable>

        <MDSearchBar
          value={query}
          onChangeText={setQuery}
          onSubmit={submitSearch}
          style={{ flex: 1, maxWidth: 560 }}
        />

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <HeaderIconLink
            icon="git-compare-outline"
            label="Compare products"
            count={compareCount}
            onPress={() => router.push('/(buyer)/compare')}
          />
          <HeaderIconLink
            icon="heart-outline"
            label="Wishlist"
            count={wishlistCount}
            onPress={() => router.push('/(buyer)/wishlist')}
          />
          <HeaderIconLink
            icon="cart-outline"
            label="Cart"
            count={cartCount}
            onPress={() => router.push('/(buyer)/cart')}
          />
          {session ? (
            <Pressable
              onPress={() => router.push('/(buyer)/account')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingLeft: spacing.md }}
              accessibilityLabel="Account"
            >
              <Ionicons name="person-circle-outline" size={24} color={colors.text.primary} />
              <MDText variant="bodySm" weight="600">
                {session.user.fullName.split(' ')[0]}
              </MDText>
            </Pressable>
          ) : (
            <MDButton
              label="Log In"
              size="sm"
              variant="outline"
              style={{ marginLeft: spacing.md }}
              onPress={() => router.push('/(auth)/login')}
            />
          )}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ borderTopWidth: 1, borderTopColor: colors.border }}
        contentContainerStyle={{
          maxWidth: layout.maxContentWidth,
          alignSelf: 'center',
          paddingHorizontal: spacing.xl,
          gap: spacing.xl,
          height: 44,
          alignItems: 'center',
        }}
      >
        <Pressable onPress={() => router.push('/(buyer)/products')}>
          <MDText variant="bodySm" weight="600" tone="secondary">
            All Products
          </MDText>
        </Pressable>
        {categories?.map((category) => (
          <Pressable
            key={category.slug}
            onPress={() => router.push({ pathname: '/(buyer)/category/[slug]', params: { slug: category.slug } })}
          >
            <MDText variant="bodySm" tone="secondary">
              {category.name}
            </MDText>
          </Pressable>
        ))}
        <Pressable onPress={() => router.push('/(buyer)/manufacturers')}>
          <MDText variant="bodySm" tone="secondary">
            Manufacturers
          </MDText>
        </Pressable>
      </ScrollView>
    </View>
  );
}
