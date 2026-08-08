import { Image, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, layout, spacing, useResponsive, MDText } from '@/design-system';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const COLUMNS: FooterColumn[] = [
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/(buyer)/legal/about' },
      { label: 'Contact', href: '/(buyer)/legal/contact' },
      { label: 'Help Center', href: '/(buyer)/help' },
    ],
  },
  {
    title: 'Shop',
    links: [
      { label: 'All Products', href: '/(buyer)/products' },
      { label: 'Categories', href: '/(buyer)/category' },
      { label: 'Manufacturers', href: '/(buyer)/manufacturers' },
    ],
  },
  {
    title: 'Orders',
    links: [
      { label: 'Order History', href: '/(buyer)/account/orders' },
      { label: 'Shipping', href: '/(buyer)/legal/shipping' },
      { label: 'Returns', href: '/(buyer)/legal/returns' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/(buyer)/legal/privacy' },
      { label: 'Terms of Service', href: '/(buyer)/legal/terms' },
      { label: 'Seller / Admin', href: '/(auth)/admin-login' },
    ],
  },
];

export function Footer() {
  const router = useRouter();
  const { isDesktopUp } = useResponsive();

  return (
    <View style={{ backgroundColor: colors.gray[900], paddingVertical: spacing['3xl'] }}>
      <View
        style={{
          maxWidth: layout.maxContentWidth,
          width: '100%',
          alignSelf: 'center',
          paddingHorizontal: spacing.xl,
        }}
      >
        <View
          style={{
            flexDirection: isDesktopUp ? 'row' : 'column',
            justifyContent: 'space-between',
            gap: spacing['2xl'],
            marginBottom: spacing['2xl'],
          }}
        >
          <View style={{ maxWidth: 280, gap: spacing.md }}>
            <View style={{ backgroundColor: colors.gray[0], borderRadius: 8, padding: spacing.sm, alignSelf: 'flex-start' }}>
              <Image
                source={require('../../assets/Millenium_Logo_new.png')}
                style={{ width: 150, height: 26 }}
                resizeMode="contain"
              />
            </View>
            <MDText variant="bodySm" style={{ color: colors.gray[400] }}>
              Genuine electronic components, verified manufacturers, and technical clarity for
              engineers and procurement teams.
            </MDText>
          </View>

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: spacing['2xl'],
              flex: isDesktopUp ? undefined : 1,
            }}
          >
            {COLUMNS.map((column) => (
              <View key={column.title} style={{ minWidth: 140, gap: spacing.sm }}>
                <MDText variant="bodySm" weight="700" style={{ color: colors.gray[0] }}>
                  {column.title}
                </MDText>
                {column.links.map((link) => (
                  <Pressable key={link.label} onPress={() => router.push(link.href as never)}>
                    <MDText variant="bodySm" style={{ color: colors.gray[400] }}>
                      {link.label}
                    </MDText>
                  </Pressable>
                ))}
              </View>
            ))}
          </View>
        </View>

        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.gray[800],
            paddingTop: spacing.lg,
          }}
        >
          <MDText variant="caption" style={{ color: colors.gray[500] }}>
            © {new Date().getFullYear()} Millennium Digital. All rights reserved.
          </MDText>
        </View>
      </View>
    </View>
  );
}
