import { Pressable, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, layout, spacing, MDText } from '@/design-system';
import { useCartStore, selectCartCount, useWishlistStore } from '@/state';

interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  match: (pathname: string) => boolean;
}

const ITEMS: NavItem[] = [
  {
    key: 'home',
    label: 'Home',
    href: '/(buyer)',
    icon: 'home-outline',
    activeIcon: 'home',
    match: (p) => p === '/' || p === '/(buyer)',
  },
  {
    key: 'categories',
    label: 'Categories',
    href: '/(buyer)/category',
    icon: 'grid-outline',
    activeIcon: 'grid',
    match: (p) => p.includes('/category') || p.includes('/products'),
  },
  {
    key: 'search',
    label: 'Search',
    href: '/(buyer)/search',
    icon: 'search-outline',
    activeIcon: 'search',
    match: (p) => p.includes('/search'),
  },
  {
    key: 'wishlist',
    label: 'Wishlist',
    href: '/(buyer)/wishlist',
    icon: 'heart-outline',
    activeIcon: 'heart',
    match: (p) => p.includes('/wishlist'),
  },
  {
    key: 'cart',
    label: 'Cart',
    href: '/(buyer)/cart',
    icon: 'cart-outline',
    activeIcon: 'cart',
    match: (p) => p.includes('/cart'),
  },
  {
    key: 'account',
    label: 'Account',
    href: '/(buyer)/account',
    icon: 'person-outline',
    activeIcon: 'person',
    match: (p) => p.includes('/account'),
  },
];

export function MobileBottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const cartCount = useCartStore(selectCartCount);
  const wishlistCount = useWishlistStore((s) => s.productIds.length);

  const badgeFor = (key: string) => {
    if (key === 'cart') return cartCount;
    if (key === 'wishlist') return wishlistCount;
    return 0;
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: colors.background,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingBottom: insets.bottom,
        height: layout.mobileNavHeight + insets.bottom,
      }}
    >
      {ITEMS.map((item) => {
        const active = item.match(pathname);
        const badge = badgeFor(item.key);
        return (
          <Pressable
            key={item.key}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            onPress={() => router.push(item.href as never)}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 }}
          >
            <View>
              <Ionicons
                name={active ? item.activeIcon : item.icon}
                size={22}
                color={active ? colors.brand.primary : colors.text.tertiary}
              />
              {badge ? (
                <View
                  style={{
                    position: 'absolute',
                    top: -3,
                    right: -8,
                    backgroundColor: colors.brand.primary,
                    borderRadius: 999,
                    minWidth: 14,
                    height: 14,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 3,
                  }}
                >
                  <MDText style={{ color: colors.gray[0], fontSize: 9 }} weight="700">
                    {badge > 9 ? '9+' : badge}
                  </MDText>
                </View>
              ) : null}
            </View>
            <MDText
              variant="caption"
              style={{
                color: active ? colors.brand.primary : colors.text.tertiary,
                fontSize: 10,
              }}
              weight={active ? '700' : '400'}
            >
              {item.label}
            </MDText>
          </Pressable>
        );
      })}
    </View>
  );
}
