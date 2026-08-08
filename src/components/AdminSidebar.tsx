import { Image, Pressable, ScrollView, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, MDText } from '@/design-system';
import { useAuthStore } from '@/state';

interface NavItem {
  label: string;
  href: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/(admin)/dashboard', icon: 'grid-outline' },
  { label: 'Products', href: '/(admin)/products', icon: 'cube-outline' },
  { label: 'Inventory', href: '/(admin)/inventory', icon: 'file-tray-stacked-outline' },
  { label: 'Categories', href: '/(admin)/categories', icon: 'pricetags-outline' },
  { label: 'Manufacturers', href: '/(admin)/manufacturers', icon: 'business-outline' },
  { label: 'Customers', href: '/(admin)/customers', icon: 'people-outline' },
  { label: 'Orders', href: '/(admin)/orders', icon: 'receipt-outline' },
  { label: 'Analytics', href: '/(admin)/analytics', icon: 'stats-chart-outline' },
];

export function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const session = useAuthStore((s) => s.session);
  const logout = useAuthStore((s) => s.logout);

  return (
    <View
      style={{
        width: 240,
        backgroundColor: colors.gray[900],
        paddingVertical: spacing.xl,
        justifyContent: 'space-between',
      }}
    >
      <View>
        <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing['2xl'] }}>
          <View
            style={{
              backgroundColor: colors.gray[0],
              borderRadius: radius.sm,
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.md,
              alignSelf: 'flex-start',
            }}
          >
            <Image
              source={require('../../assets/Millenium_Logo_new.png')}
              style={{ width: 140, height: 25 }}
              resizeMode="contain"
            />
          </View>
          <MDText variant="caption" style={{ color: colors.gray[500], marginTop: spacing.sm }}>
            Enterprise Console
          </MDText>
        </View>

        <ScrollView>
          {NAV_ITEMS.map((item) => {
            const active = pathname.includes(item.href.replace('/(admin)', ''));
            return (
              <Pressable
                key={item.href}
                onPress={() => router.push(item.href as never)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.md,
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.md,
                  backgroundColor: active ? colors.gray[800] : 'transparent',
                  borderLeftWidth: 3,
                  borderLeftColor: active ? colors.brand.accent : 'transparent',
                }}
              >
                <Ionicons
                  name={item.icon}
                  size={18}
                  color={active ? colors.gray[0] : colors.gray[400]}
                />
                <MDText
                  variant="bodySm"
                  weight={active ? '700' : '400'}
                  style={{ color: active ? colors.gray[0] : colors.gray[400] }}
                >
                  {item.label}
                </MDText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={{ paddingHorizontal: spacing.lg, gap: spacing.md }}>
        <Pressable
          onPress={() => router.push('/(admin)/profile')}
          style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
        >
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: radius.pill,
              backgroundColor: colors.gray[700],
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MDText style={{ color: colors.gray[0] }} weight="700">
              {session?.user.fullName?.[0] ?? 'A'}
            </MDText>
          </View>
          <View>
            <MDText variant="bodySm" weight="600" style={{ color: colors.gray[0] }}>
              {session?.user.fullName ?? 'Admin'}
            </MDText>
            <MDText variant="caption" style={{ color: colors.gray[500] }}>
              {session?.user.email}
            </MDText>
          </View>
        </Pressable>
        <Pressable
          onPress={() => {
            logout();
            router.replace('/(auth)/admin-login');
          }}
          style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.gray[400]} />
          <MDText variant="bodySm" style={{ color: colors.gray[400] }}>
            Log Out
          </MDText>
        </Pressable>
      </View>
    </View>
  );
}
