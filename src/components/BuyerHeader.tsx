import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, Image, Pressable, ScrollView, View } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  layout,
  radius,
  spacing,
  useResponsive,
  webTransition,
  MDText,
  MDButton,
} from '@/design-system';
import {
  useCartStore,
  selectCartCount,
  useWishlistStore,
  useCompareStore,
  useAuthStore,
  useCartFeedbackStore,
} from '@/state';
import { GlobalSearchBar } from '@/components/GlobalSearchBar';
import { CurrencySwitcher } from '@/components/CurrencySwitcher';

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
  bumpToken,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  count?: number;
  /** Increments each time the underlying collection gains an item — triggers a bounce. */
  bumpToken?: number;
  onPress: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const bumpScale = useRef(new Animated.Value(1)).current;
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (bumpToken === undefined) return;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    bumpScale.setValue(1);
    Animated.sequence([
      Animated.timing(bumpScale, { toValue: 1.35, duration: 130, useNativeDriver: true }),
      Animated.spring(bumpScale, { toValue: 1, friction: 3.5, tension: 160, useNativeDriver: true }),
    ]).start();
  }, [bumpToken, bumpScale]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        webTransition,
        {
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: spacing.sm,
          position: 'relative',
          height: 36,
          borderRadius: radius.pill,
          backgroundColor: pressed ? colors.gray[200] : hovered ? colors.gray[100] : 'transparent',
          transform: [{ scale: pressed ? 0.92 : hovered ? 1.06 : 1 }],
        },
      ]}
    >
      <Animated.View style={{ transform: [{ scale: bumpScale }] }}>
        <Ionicons name={icon} size={22} color={hovered ? colors.brand.primary : colors.text.primary} />
      </Animated.View>
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

function SubNavTab({
  item,
  active,
  onPress,
}: {
  item: SubNavItem;
  active: boolean;
  onPress: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const tinted = active || hovered;

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={[
        webTransition,
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          height: '100%',
          borderBottomWidth: 2,
          borderBottomColor: active ? colors.brand.primary : hovered ? colors.brand.primarySoftBorder : 'transparent',
        },
      ]}
    >
      {item.icon ? (
        <Ionicons name={item.icon} size={13} color={tinted ? colors.brand.primary : colors.text.tertiary} />
      ) : null}
      <MDText variant="bodySm" weight="600" style={{ color: tinted ? colors.brand.primary : colors.text.secondary }}>
        {item.label}
      </MDText>
    </Pressable>
  );
}

function FadePressable({
  onPress,
  accessibilityLabel,
  style,
  children,
}: {
  onPress: () => void;
  accessibilityLabel: string;
  style?: object;
  children: ReactNode;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={({ pressed }) => [webTransition, { opacity: pressed ? 0.7 : hovered ? 0.85 : 1 }, style]}
    >
      {children}
    </Pressable>
  );
}

export function BuyerHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { isDesktopUp } = useResponsive();
  const cartCount = useCartStore(selectCartCount);
  const cartBumpToken = useCartFeedbackStore((s) => s.bumpToken);
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
        <FadePressable onPress={() => router.push('/(buyer)')} accessibilityLabel="Millennium Digital home">
          <Image
            source={require('../../assets/Millenium_Logo_new.png')}
            style={{ width: 92, height: 34 }}
            resizeMode="contain"
          />
        </FadePressable>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <CurrencySwitcher compact />
          <HeaderIconLink
            icon="sparkles-outline"
            label="Engineering Workspace"
            onPress={() => router.push('/(buyer)/engineering')}
          />
          <HeaderIconLink
            icon="cart-outline"
            label="Cart"
            count={cartCount}
            bumpToken={cartBumpToken}
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
          <FadePressable onPress={() => router.push('/(buyer)')} accessibilityLabel="Millennium Digital home">
            <Image
              source={require('../../assets/Millenium_Logo_new.png')}
              style={{ width: 160, height: 58 }}
              resizeMode="contain"
            />
          </FadePressable>

          <GlobalSearchBar style={{ flex: 1 }} />

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <CurrencySwitcher />
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
              bumpToken={cartBumpToken}
              onPress={() => router.push('/(buyer)/cart')}
            />
            {session ? (
              <FadePressable
                onPress={() => router.push('/(buyer)/account')}
                style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingLeft: spacing.md }}
                accessibilityLabel="Account"
              >
                <Ionicons name="person-circle-outline" size={24} color={colors.text.primary} />
                <MDText variant="bodySm" weight="600">
                  {session.user.fullName.split(' ')[0]}
                </MDText>
              </FadePressable>
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
        {SUB_NAV_ITEMS.map((item) => (
          <SubNavTab key={item.key} item={item} active={item.match(pathname ?? '')} onPress={() => router.push(item.href as never)} />
        ))}
      </ScrollView>
      </View>
    </View>
  );
}
