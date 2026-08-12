import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, Image, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, useResponsive, MDBadge, MDText, MDIconButton } from '@/design-system';

type PanelTone = 'brand' | 'graphite' | 'teal';

interface AuthPanelConfig {
  tone?: PanelTone;
  eyebrow?: string;
  headline?: string;
  description?: string;
  slides?: string[];
  badge?: string;
  /** Optional mascot illustration (require()'d PNG) shown on the brand panel. */
  character?: number;
}

interface AuthScreenShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  showBack?: boolean;
  panel?: AuthPanelConfig;
}

const DEFAULT_SLIDES = [
  'Genuine parts from verified manufacturers',
  'AI-assisted engineering search & BOM matching',
  'Governed pricing, RFQs, and order tracking — in one place',
];

const TONE_STYLES: Record<PanelTone, { bg: string; accent: string; textSoft: string; chipBg: string }> = {
  brand: { bg: colors.brand.primary, accent: colors.plum[200], textSoft: colors.plum[100], chipBg: colors.gray[0] },
  graphite: { bg: colors.gray[900], accent: colors.gray[400], textSoft: colors.gray[400], chipBg: colors.gray[0] },
  teal: { bg: colors.teal[700], accent: colors.teal[200], textSoft: colors.teal[100], chipBg: colors.gray[0] },
};

function PanelSlides({ slides, tone }: { slides: string[]; tone: PanelTone }) {
  const [index, setIndex] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;
  const palette = TONE_STYLES[tone];

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
        setIndex((i) => (i + 1) % slides.length);
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }).start();
      });
    }, 4200);
    return () => clearInterval(timer);
  }, [slides.length, opacity]);

  return (
    <View style={{ minHeight: 44 }}>
      <Animated.View style={{ opacity, flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}>
        <Ionicons name="checkmark-circle" size={18} color={palette.accent} style={{ marginTop: 2 }} />
        <MDText variant="bodyLg" style={{ color: colors.gray[0], flex: 1 }}>
          {slides[index]}
        </MDText>
      </Animated.View>
      {slides.length > 1 ? (
        <View style={{ flexDirection: 'row', gap: 6, marginTop: spacing.lg }}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === index ? 22 : 6,
                height: 6,
                borderRadius: radius.pill,
                backgroundColor: i === index ? colors.gray[0] : 'rgba(255,255,255,0.3)',
              }}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function BrandPanel({ panel }: { panel: Required<Omit<AuthPanelConfig, 'badge' | 'character'>> & { badge?: string; character?: number } }) {
  const palette = TONE_STYLES[panel.tone];

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg, padding: spacing['2xl'], justifyContent: 'space-between', overflow: 'hidden' }}>
      {/* Decorative circles */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: -60,
          right: -60,
          width: 220,
          height: 220,
          borderRadius: 999,
          backgroundColor: 'rgba(255,255,255,0.06)',
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          bottom: 40,
          left: -50,
          width: 160,
          height: 160,
          borderRadius: 999,
          backgroundColor: 'rgba(255,255,255,0.05)',
        }}
      />

      <View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing['2xl'] }}>
          <View style={{ backgroundColor: palette.chipBg, borderRadius: radius.sm, paddingVertical: spacing.xs, paddingHorizontal: spacing.md }}>
            <Image
              source={require('../../assets/Millenium_Logo_new.png')}
              style={{ width: 170, height: 62 }}
              resizeMode="contain"
              accessibilityLabel="Millennium Digital"
            />
          </View>
          {panel.badge ? <MDBadge label={panel.badge} tone="neutral" /> : null}
        </View>

        <MDText variant="overline" style={{ color: palette.accent, marginBottom: spacing.sm }}>
          {panel.eyebrow}
        </MDText>
        <MDText variant="h1" style={{ color: colors.gray[0], marginBottom: spacing.md }}>
          {panel.headline}
        </MDText>
        <MDText variant="body" style={{ color: palette.textSoft, maxWidth: 380 }}>
          {panel.description}
        </MDText>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: spacing.md }}>
        <View style={{ flex: 1, maxWidth: panel.character ? 190 : undefined }}>
          <PanelSlides slides={panel.slides} tone={panel.tone} />
        </View>
        {panel.character ? (
          <Image
            source={panel.character}
            accessibilityLabel=""
            style={{ width: 176, height: 328, marginBottom: -8 }}
            resizeMode="contain"
          />
        ) : null}
      </View>
    </View>
  );
}

function CompactPanelBand({ panel }: { panel: Required<Omit<AuthPanelConfig, 'badge' | 'character'>> & { badge?: string; character?: number } }) {
  const palette = TONE_STYLES[panel.tone];
  return (
    <View style={{ backgroundColor: palette.bg, paddingHorizontal: spacing.xl, paddingVertical: spacing.xl, overflow: 'hidden' }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: spacing.md }}>
        <View style={{ flex: 1 }}>
          <View style={{ backgroundColor: palette.chipBg, borderRadius: radius.sm, paddingVertical: 6, paddingHorizontal: spacing.md, alignSelf: 'flex-start', marginBottom: spacing.md }}>
            <Image
              source={require('../../assets/Millenium_Logo_new.png')}
              style={{ width: 150, height: 55 }}
              resizeMode="contain"
              accessibilityLabel="Millennium Digital"
            />
          </View>
          <MDText variant="overline" style={{ color: palette.accent, marginBottom: 4 }}>
            {panel.eyebrow}
          </MDText>
          <MDText variant="h3" style={{ color: colors.gray[0] }}>
            {panel.headline}
          </MDText>
        </View>
        {panel.character ? (
          <Image
            source={panel.character}
            accessibilityLabel=""
            style={{ width: 88, height: 164, marginBottom: -spacing.xl }}
            resizeMode="contain"
          />
        ) : null}
      </View>
    </View>
  );
}

export function AuthScreenShell({ title, subtitle, children, footer, showBack, panel }: AuthScreenShellProps) {
  const { isDesktopUp } = useResponsive();
  const router = useRouter();

  const resolvedPanel = {
    tone: panel?.tone ?? 'brand',
    eyebrow: panel?.eyebrow ?? 'MILLENNIUM DIGITAL',
    headline: panel?.headline ?? 'Source components with confidence.',
    description:
      panel?.description ??
      'A connected digital commerce platform for electronics and semiconductor procurement.',
    slides: panel?.slides ?? DEFAULT_SLIDES,
    badge: panel?.badge,
    character: panel?.character,
  } satisfies Required<Omit<AuthPanelConfig, 'badge' | 'character'>> & { badge?: string; character?: number };

  return (
    <View style={{ flex: 1, flexDirection: isDesktopUp ? 'row' : 'column', backgroundColor: colors.background }}>
      {isDesktopUp ? (
        <View style={{ width: '42%', maxWidth: 520 }}>
          <BrandPanel panel={resolvedPanel} />
        </View>
      ) : (
        <CompactPanelBand panel={resolvedPanel} />
      )}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing.xl,
        }}
      >
        <View style={{ width: '100%', maxWidth: 420, paddingVertical: spacing.xl }}>
          {showBack ? (
            <MDIconButton
              accessibilityLabel="Go back"
              onPress={() => router.back()}
              style={{ marginBottom: spacing.md, alignSelf: 'flex-start' }}
            >
              <Ionicons name="arrow-back" size={20} color={colors.text.primary} />
            </MDIconButton>
          ) : null}

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 2 }}>
            <Image
              source={require('../../assets/millennium-icon-mark.png')}
              style={{ width: 32, height: 20 }}
              resizeMode="contain"
              accessibilityLabel="Millennium Digital"
            />
            <MDText variant="h2">{title}</MDText>
          </View>
          {subtitle ? (
            <MDText variant="body" tone="secondary" style={{ marginTop: spacing.xs, marginBottom: spacing.xl }}>
              {subtitle}
            </MDText>
          ) : (
            <View style={{ marginBottom: spacing.xl }} />
          )}

          {children}

          {footer ? <View style={{ marginTop: spacing.xl }}>{footer}</View> : null}
        </View>
      </ScrollView>
    </View>
  );
}

// Re-exported so pages can build custom panel copy without redefining the type shape.
export type { AuthPanelConfig };
