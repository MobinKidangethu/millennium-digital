import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, View } from 'react-native';
import { Redirect, Stack, usePathname, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, useResponsive, MDBottomSheet, MDText } from '@/design-system';
import { AdminSidebar, ADMIN_NAV_ITEMS } from '@/components/AdminSidebar';
import { useAuthStore } from '@/state';

function AdminMobileHeader({ onOpenMenu }: { onOpenMenu: () => void }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        height: 56,
        backgroundColor: colors.gray[900],
      }}
    >
      <Pressable onPress={onOpenMenu} accessibilityLabel="Open menu">
        <Ionicons name="menu" size={24} color={colors.gray[0]} />
      </Pressable>
      <Image
        source={require('../../assets/Millenium_Logo_new.png')}
        style={{ width: 130, height: 23 }}
        resizeMode="contain"
      />
      <View style={{ width: 24 }} />
    </View>
  );
}

export default function AdminLayout() {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const session = useAuthStore((s) => s.session);
  const { isDesktopUp } = useResponsive();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  if (!hasHydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gray[900] }}>
        <ActivityIndicator color={colors.gray[0]} />
      </View>
    );
  }

  if (!session || session.user.role !== 'admin') {
    return <Redirect href="/(auth)/admin-login" />;
  }

  return (
    <View style={{ flex: 1, flexDirection: isDesktopUp ? 'row' : 'column', backgroundColor: colors.surface }}>
      {isDesktopUp ? (
        <AdminSidebar />
      ) : (
        <>
          <AdminMobileHeader onOpenMenu={() => setMenuOpen(true)} />
          <MDBottomSheet visible={menuOpen} onClose={() => setMenuOpen(false)} title="Menu">
            <View style={{ paddingBottom: spacing.lg }}>
              {ADMIN_NAV_ITEMS.map((item) => {
                const active = pathname.includes(item.href.replace('/(admin)', ''));
                return (
                  <Pressable
                    key={item.href}
                    onPress={() => {
                      setMenuOpen(false);
                      router.push(item.href as never);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.md,
                      paddingVertical: spacing.md,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
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
          </MDBottomSheet>
        </>
      )}
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </View>
  );
}
