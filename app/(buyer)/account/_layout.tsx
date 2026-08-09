import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { Redirect, Stack, usePathname, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, layout, radius, spacing, useResponsive, MDText } from '@/design-system';
import { useAuthStore } from '@/state';
import { ACCOUNT_NAV_GROUPS } from '@/constants/accountNav';

function AccountNavGroups() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingRight: spacing.sm, paddingBottom: spacing.xl }}
      showsVerticalScrollIndicator={false}
    >
      {ACCOUNT_NAV_GROUPS.map((group) => {
        const isCollapsed = !!collapsed[group.key];
        return (
          <View key={group.key} style={{ marginBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: spacing.xs }}>
            <Pressable
              onPress={() => setCollapsed((c) => ({ ...c, [group.key]: !c[group.key] }))}
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 }}
              accessibilityRole="button"
              accessibilityLabel={`${group.label} section`}
            >
              <MDText variant="overline" tone="tertiary">
                {group.label.toUpperCase()}
              </MDText>
              <Ionicons
                name="chevron-down"
                size={13}
                color={colors.text.tertiary}
                style={{ transform: [{ rotate: isCollapsed ? '-90deg' : '0deg' }] }}
              />
            </Pressable>

            {!isCollapsed ? (
              <View>
                {group.items.map((item) => {
                  const active = item.match(pathname);
                  return (
                    <Pressable
                      key={item.label}
                      onPress={() => router.push(item.href as never)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: spacing.sm,
                        paddingVertical: 7,
                        paddingHorizontal: spacing.sm,
                        borderRadius: radius.sm,
                        backgroundColor: active ? colors.brand.primarySoft : 'transparent',
                        marginBottom: 1,
                      }}
                    >
                      <Ionicons name={item.icon} size={16} color={active ? colors.brand.primary : colors.text.secondary} />
                      <MDText
                        variant="bodySm"
                        weight={active ? '700' : '400'}
                        style={{ color: active ? colors.brand.primary : colors.text.primary }}
                      >
                        {item.label}
                      </MDText>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </View>
        );
      })}

      <Pressable
        onPress={() => router.push('/(auth)/seller-register')}
        style={{
          marginTop: 2,
          borderWidth: 1,
          borderColor: colors.brand.primarySoftBorder,
          backgroundColor: colors.brand.primarySoft,
          borderRadius: radius.md,
          padding: spacing.sm,
        }}
      >
        <MDText variant="caption" weight="700" style={{ color: colors.brand.primary, marginBottom: 2 }}>
          Sell on Millennium Digital
        </MDText>
        <MDText variant="caption" tone="secondary">
          Apply to list your catalogue as a verified supplier.
        </MDText>
      </Pressable>
    </ScrollView>
  );
}

export default function AccountLayout() {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const session = useAuthStore((s) => s.session);
  const { isDesktopUp } = useResponsive();

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
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.lg,
          gap: spacing.xl,
          flex: 1,
          minHeight: 0,
        }}
      >
        {isDesktopUp ? (
          <View style={{ width: 208, minHeight: 0 }}>
            <AccountNavGroups />
          </View>
        ) : null}

        <ScrollView style={{ flex: 1, minHeight: 0 }} contentContainerStyle={{ paddingBottom: spacing['2xl'] }}>
          <Stack screenOptions={{ headerShown: false }} />
        </ScrollView>
      </View>
    </View>
  );
}
