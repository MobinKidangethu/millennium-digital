import { Image, Pressable, ScrollView, View } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  layout,
  spacing,
  useResponsive,
  MDText,
  MDButton,
} from '@/design-system';
import { useCartStore, selectCartCount, useWishlistStore, useCompareStore, useAuthStore } from '@/state';
import { GlobalSearchBar } from '@/components/GlobalSearchBar';

interface SubNavItem {
  key: string;
  label: string;
  href: string;
  icon?: keyof typeof Ionicons.glyphMap;
  match: (pathname: string) => boolean;
}

const SUB_NAV_ITEMS: SubNavItem[] = [
  {
    key: 'products',
    label: 'Products',
    href: '/(buyer)/products',
    match: (p) => p.includes('/products') || p.includes('/category'),
  },
  {
    key: 'engineering',
    label: 'Engineering Workspace',
    href: '/(buyer)/engineering',
    icon: 'sparkles-outline',
    match: (p) => p.includes('/engineering'),
  },
  {
    key: 'manufacturers',
    label: 'Manufacturers',
    href: '/(buyer)/manufacturers',
    match: (p) => p.includes('/manufacturers'),
  },
];

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
  const pathname = usePathname();
  const { isDesktopUp } = useResponsive();
  const cartCount = useCartStore(selectCartCount);
  const wishlistCount = useWishlistStore((s) => s.productIds.length);
  const compareCount = useCompareStore((s) => s.productIds.length);
  const session = useAuthStore((s) => s.session);

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
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <HeaderIconLink
            icon="sparkles-outline"
            label="Engineering Workspace"
            onPress={() => router.push('/(buyer)/engineering')}
          />
          <HeaderIconLink
            icon="cart-outline"
            label="Cart"
            count={cartCount}
            onPress={() => router.push('/(buyer)/cart')}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <View style={{ flexDirection: 'row', justifyContent: 'center', width: '100%' }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xl,
            width: '100%',
            maxWidth: layout.maxContentWidth,
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

          <GlobalSearchBar style={{ flex: 1 }} />

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
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          width: '100%',
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ width: '100%', maxWidth: layout.maxContentWidth }}
        contentContainerStyle={{
          paddingHorizontal: spacing.xl,
          gap: spacing.xl,
          height: 44,
          alignItems: 'center',
        }}
      >
        {SUB_NAV_ITEMS.map((item) => {
          const active = item.match(pathname ?? '');
          return (
            <Pressable
              key={item.key}
              onPress={() => router.push(item.href as never)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                height: '100%',
                borderBottomWidth: 2,
                borderBottomColor: active ? colors.brand.primary : 'transparent',
              }}
            >
              {item.icon ? (
                <Ionicons name={item.icon} size={13} color={active ? colors.brand.primary : colors.text.tertiary} />
              ) : null}
              <MDText
                variant="bodySm"
                weight="600"
                style={{ color: active ? colors.brand.primary : colors.text.secondary }}
              >
                {item.label}
              </MDText>
            </Pressable>
          );
        })}
      </ScrollView>
      </View>
    </View>
  );
}
