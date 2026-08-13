import { Image, Linking, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, layout, radius, spacing, useResponsive, useHoverPress, webTransition, MDText } from '@/design-system';

const CONTACT_PHONE = '+91 8411005847';
const CONTACT_EMAIL = 'info@millenniumsemi.com';

// General store landing pages (not a specific app listing — there is no
// published Millennium Digital app to link to, so these point to the
// real, live Google Play / App Store homepages rather than a fabricated
// listing URL).
const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps';
const APP_STORE_URL = 'https://www.apple.com/app-store/';

function StoreBadge({
  icon,
  eyebrow,
  title,
  onPress,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  eyebrow: string;
  title: string;
  onPress: () => void;
}) {
  const { hovered, hoverHandlers } = useHoverPress();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={`${eyebrow} ${title}`}
      {...hoverHandlers}
      style={[
        webTransition,
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          backgroundColor: hovered ? colors.gray[700] : colors.gray[800],
          borderWidth: 1,
          borderColor: colors.gray[700],
          borderRadius: radius.md,
          paddingVertical: spacing.xs,
          paddingHorizontal: spacing.md,
        },
      ]}
    >
      <MaterialCommunityIcons name={icon} size={22} color={colors.gray[0]} />
      <View>
        <MDText variant="caption" style={{ color: colors.gray[400] }}>
          {eyebrow}
        </MDText>
        <MDText variant="bodySm" weight="700" style={{ color: colors.gray[0] }}>
          {title}
        </MDText>
      </View>
    </Pressable>
  );
}

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
      { label: 'Seller Sign In', href: '/(auth)/seller-login' },
      { label: 'Admin', href: '/(auth)/admin-login' },
    ],
  },
];

function FooterLinkItem({ link, onPress }: { link: FooterLink; onPress: () => void }) {
  const { hovered, hoverHandlers } = useHoverPress();

  return (
    <Pressable onPress={onPress} {...hoverHandlers} style={webTransition}>
      <MDText variant="bodySm" style={{ color: hovered ? colors.gray[0] : colors.gray[400] }}>
        {link.label}
      </MDText>
    </Pressable>
  );
}

function FooterContactItem({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const { hovered, hoverHandlers } = useHoverPress();

  return (
    <Pressable
      onPress={onPress}
      {...hoverHandlers}
      style={[webTransition, { flexDirection: 'row', alignItems: 'center', gap: spacing.xs }]}
    >
      <Ionicons name={icon} size={14} color={hovered ? colors.gray[0] : colors.gray[400]} />
      <MDText variant="bodySm" style={{ color: hovered ? colors.gray[0] : colors.gray[400] }}>
        {label}
      </MDText>
    </Pressable>
  );
}

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
                style={{ width: 168, height: 61 }}
                resizeMode="contain"
              />
            </View>
            <MDText variant="bodySm" style={{ color: colors.gray[400] }}>
              Genuine electronic components, verified manufacturers, and technical clarity for
              engineers and procurement teams.
            </MDText>
            <View style={{ gap: spacing.xs, marginTop: spacing.xs }}>
              <FooterContactItem
                icon="call-outline"
                label={CONTACT_PHONE}
                onPress={() => Linking.openURL(`tel:${CONTACT_PHONE.replace(/\s+/g, '')}`)}
              />
              <FooterContactItem
                icon="mail-outline"
                label={CONTACT_EMAIL}
                onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)}
              />
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm }}>
              <StoreBadge
                icon="google-play"
                eyebrow="GET IT ON"
                title="Google Play"
                onPress={() => Linking.openURL(GOOGLE_PLAY_URL)}
              />
              <StoreBadge
                icon="apple"
                eyebrow="Download on the"
                title="App Store"
                onPress={() => Linking.openURL(APP_STORE_URL)}
              />
            </View>
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
                  <FooterLinkItem key={link.label} link={link} onPress={() => router.push(link.href as never)} />
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
