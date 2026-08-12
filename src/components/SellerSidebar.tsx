import type { ReactNode } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, webTransition, useHoverPress, MDText } from '@/design-system';
import { useAuthStore } from '@/state';

interface NavItem {
  label: string;
  href: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export const SELLER_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/(seller)/dashboard', icon: 'grid-outline' },
  { label: 'My Products', href: '/(seller)/products', icon: 'cube-outline' },
  { label: 'Orders', href: '/(seller)/orders', icon: 'receipt-outline' },
  { label: 'RFQs', href: '/(seller)/rfqs', icon: 'document-text-outline' },
  { label: 'Brand Profile', href: '/(seller)/profile', icon: 'business-outline' },
];

function SellerNavItem({ item, active, onPress }: { item: NavItem; active: boolean; onPress: () => void }) {
  const { hovered, pressHandlers, hoverHandlers } = useHoverPress();

  return (
    <Pressable
      onPress={onPress}
      {...hoverHandlers}
      {...pressHandlers}
      style={[
        webTransition,
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          backgroundColor: active ? colors.gray[800] : hovered ? colors.gray[800] : 'transparent',
          opacity: !active && hovered ? 0.85 : 1,
          borderLeftWidth: 3,
          borderLeftColor: active ? colors.brand.accent : hovered ? colors.gray[600] : 'transparent',
        },
      ]}
    >
      <Ionicons name={item.icon} size={18} color={active || hovered ? colors.gray[0] : colors.gray[400]} />
      <MDText
        variant="bodySm"
        weight={active ? '700' : '400'}
        style={{ color: active || hovered ? colors.gray[0] : colors.gray[400] }}
      >
        {item.label}
      </MDText>
    </Pressable>
  );
}

function SellerFooterLink({
  icon,
  label,
  onPress,
  children,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  label?: string;
  onPress: () => void;
  children?: ReactNode;
}) {
  const { hovered, hoverHandlers } = useHoverPress();

  return (
    <Pressable
      onPress={onPress}
      {...hoverHandlers}
      style={[webTransition, { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, opacity: hovered ? 0.75 : 1 }]}
    >
      {children ?? (
        <>
          {icon ? <Ionicons name={icon} size={18} color={colors.gray[400]} /> : null}
          <MDText variant="bodySm" style={{ color: colors.gray[400] }}>
            {label}
          </MDText>
        </>
      )}
    </Pressable>
  );
}

export function SellerSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const session = useAuthStore((s) => s.session);
  const logout = useAuthStore((s) => s.logout);
  const brands = session?.user.sellerManufacturers ?? [];

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
              style={{ width: 170, height: 62 }}
              resizeMode="contain"
            />
          </View>
          <MDText variant="caption" style={{ color: colors.gray[500], marginTop: spacing.sm }}>
            Seller Console
          </MDText>
          {brands.length > 0 ? (
            <MDText variant="caption" weight="600" numberOfLines={1} style={{ color: colors.gray[300], marginTop: 2 }}>
              {brands.join(', ')}
            </MDText>
          ) : null}
        </View>

        <ScrollView>
          {SELLER_NAV_ITEMS.map((item) => (
            <SellerNavItem
              key={item.href}
              item={item}
              active={pathname.includes(item.href.replace('/(seller)', ''))}
              onPress={() => router.push(item.href as never)}
            />
          ))}
        </ScrollView>
      </View>

      <View style={{ paddingHorizontal: spacing.lg, gap: spacing.md }}>
        <SellerFooterLink onPress={() => router.push('/(seller)/profile')}>
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
              {session?.user.fullName?.[0] ?? 'S'}
            </MDText>
          </View>
          <View>
            <MDText variant="bodySm" weight="600" style={{ color: colors.gray[0] }}>
              {session?.user.company ?? session?.user.fullName ?? 'Seller'}
            </MDText>
            <MDText variant="caption" style={{ color: colors.gray[500] }}>
              {session?.user.email}
            </MDText>
          </View>
        </SellerFooterLink>
        <SellerFooterLink
          icon="log-out-outline"
          label="Log Out"
          onPress={() => {
            logout();
            router.replace('/(auth)/seller-login');
          }}
        />
      </View>
    </View>
  );
}
