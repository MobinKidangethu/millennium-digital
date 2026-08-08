import { ActivityIndicator, Pressable, View } from 'react-native';
import { Redirect, Stack, usePathname, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, layout, spacing, useResponsive, MDText } from '@/design-system';
import { useAuthStore } from '@/state';

const NAV_ITEMS = [
  { label: 'Profile', href: '/(buyer)/account', icon: 'person-outline' as const, match: (p: string) => p === '/account' || p === '/' },
  { label: 'Addresses', href: '/(buyer)/account/addresses', icon: 'location-outline' as const, match: (p: string) => p.includes('/addresses') },
  { label: 'Order History', href: '/(buyer)/account/orders', icon: 'receipt-outline' as const, match: (p: string) => p.includes('/orders') },
  { label: 'Wishlist', href: '/(buyer)/wishlist', icon: 'heart-outline' as const, match: () => false },
  { label: 'Compare', href: '/(buyer)/compare', icon: 'git-compare-outline' as const, match: () => false },
  { label: 'Recently Viewed', href: '/(buyer)/account/recently-viewed', icon: 'time-outline' as const, match: (p: string) => p.includes('/recently-viewed') },
  { label: 'Notifications', href: '/(buyer)/account/notifications', icon: 'notifications-outline' as const, match: (p: string) => p.includes('/notifications') },
  { label: 'Security', href: '/(buyer)/account/security', icon: 'shield-checkmark-outline' as const, match: (p: string) => p.includes('/security') },
];

export default function AccountLayout() {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const session = useAuthStore((s) => s.session);
  const { isDesktopUp } = useResponsive();
  const pathname = usePathname();
  const router = useRouter();

  if (!hasHydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.brand.primary} />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          flexDirection: isDesktopUp ? 'row' : 'column',
          maxWidth: layout.maxContentWidth,
          width: '100%',
          alignSelf: 'center',
          padding: spacing.xl,
          gap: spacing['2xl'],
          flex: 1,
        }}
      >
        {isDesktopUp ? (
          <View style={{ width: 220 }}>
            {NAV_ITEMS.map((item) => {
              const active = item.match(pathname);
              return (
                <Pressable
                  key={item.label}
                  onPress={() => router.push(item.href as never)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.sm,
                    paddingVertical: spacing.sm,
                    paddingHorizontal: spacing.md,
                    borderRadius: 10,
                    backgroundColor: active ? colors.brand.primarySoft : 'transparent',
                    marginBottom: 2,
                  }}
                >
                  <Ionicons name={item.icon} size={18} color={active ? colors.brand.primary : colors.text.secondary} />
                  <MDText variant="bodySm" weight={active ? '700' : '400'} style={{ color: active ? colors.brand.primary : colors.text.primary }}>
                    {item.label}
                  </MDText>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <View style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }} />
        </View>
      </View>
    </View>
  );
}
