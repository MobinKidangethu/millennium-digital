import { useEffect, useRef, useState } from 'react';
import { Animated, Image, Pressable, View, type ImageSourcePropType } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, useResponsive, MDText } from '@/design-system';

const DEFAULT_DURATION_MS = 3000;

interface SegmentChip {
  label: string;
  slug: string;
}

interface Segment {
  eyebrow?: string;
  title: string;
  description?: string;
  /** Either a remote URL (string) or a bundled local asset (require()'d). */
  image: string | ImageSourcePropType;
  chips?: SegmentChip[];
  ctaLabel?: string;
  ctaSlug?: string;
  /** How long this slide stays on screen before auto-advancing. Defaults to 3000ms. */
  durationMs?: number;
  /**
   * Full-bleed slide with no right-side (bottom, on mobile) info panel or
   * CTA — for banners that already carry their own branding/copy in the
   * image itself, so no overlay text is needed.
   */
  hidePanel?: boolean;
  /**
   * Backdrop shown behind a `hidePanel` slide's image. Full-bleed slides use
   * `resizeMode="contain"` so nothing is ever cropped (unlike the other
   * slides, which crop-to-fill with `resizeMode="cover"`); this fills
   * whatever thin letterbox strip that leaves, so it blends into the image
   * instead of showing a mismatched color. Defaults to `colors.gray[900]`.
   */
  letterboxColor?: string;
}

/**
 * Industry segments Millennium Digital serves, each mapped to real
 * category slugs from the live catalog (products.json / useCategories) —
 * no fabricated categories or counts. Imagery is sourced from Unsplash
 * (free license) or a client-supplied local asset to represent each
 * segment; not photography of actual client inventory. See project rule:
 * never invent product/category data.
 */
const SEGMENTS: Segment[] = [
  {
    title: 'Connecting Buyer & Seller',
    image: require('../../assets/images/segments/connecting-buyer-seller.png'),
    durationMs: 5000,
    hidePanel: true,
    // Sampled from the banner's own background so the uncropped image's
    // letterbox strip (see `resizeMode="contain"` below) is invisible.
    letterboxColor: '#1A092B',
  },
  {
    eyebrow: 'INDUSTRY SEGMENT',
    title: 'Automotive & EV Electronics',
    description:
      'Evaluation Board, sensors, and power connectors sourced for automotive-grade reliability and traceability.',
    image: require('../../assets/images/segments/automotive-ev-electronics.png'),
    chips: [
      { label: 'Evaluation Board', slug: 'evaluation-board' },
      { label: 'Sensors', slug: 'sensors' },
      { label: 'Connectors', slug: 'connectors' },
    ],
    ctaLabel: 'Explore Evaluation Board',
    ctaSlug: 'evaluation-board',
  },
  {
    eyebrow: 'INDUSTRY SEGMENT',
    title: 'Industrial Automation & Robotics',
    description:
      'Embedded control systems, rugged connectors, and tooling for automated production lines.',
    image:
      'https://images.unsplash.com/photo-1716191299980-a6e8827ba10b?auto=format&fit=crop&w=1600&q=80',
    chips: [
      { label: 'Embedded Solutions', slug: 'embedded-solutions' },
      { label: 'Connectors', slug: 'connectors' },
      { label: 'Tools & Supplies', slug: 'tools-supplies' },
    ],
    ctaLabel: 'Explore Embedded Solutions',
    ctaSlug: 'embedded-solutions',
  },
  {
    eyebrow: 'INDUSTRY SEGMENT',
    title: 'Evaluation Board, ICs & Embedded Systems',
    description:
      'The foundation layer — discrete semiconductors and embedded modules sourced from verified manufacturers.',
    image:
      'https://images.unsplash.com/photo-1562408590-e32931084e23?auto=format&fit=crop&w=1600&q=80',
    chips: [
      { label: 'Evaluation Board', slug: 'evaluation-board' },
      { label: 'Embedded Solutions', slug: 'embedded-solutions' },
      { label: 'Sensors', slug: 'sensors' },
    ],
    ctaLabel: 'Explore Sensors',
    ctaSlug: 'sensors',
  },
  {
    eyebrow: 'INDUSTRY SEGMENT',
    title: 'Connectivity, Wireless & Communication Systems',
    description:
      'Connectors, cabling, and passive components behind every wired and wireless communication design.',
    image:
      'https://images.unsplash.com/photo-1745847768408-b7b83796cae6?auto=format&fit=crop&w=1600&q=80',
    chips: [
      { label: 'Connectors', slug: 'connectors' },
      { label: 'Wire & Cable', slug: 'wire-cable' },
      { label: 'Passive Components', slug: 'passive-components' },
    ],
    ctaLabel: 'Explore Connectors',
    ctaSlug: 'connectors',
  },
];

function SegmentDots({ index, onSelect }: { index: number; onSelect: (i: number) => void }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {SEGMENTS.map((s, i) => (
        <Pressable key={s.title} onPress={() => onSelect(i)} hitSlop={8}>
          <View
            style={{
              width: i === index ? 20 : 6,
              height: 6,
              borderRadius: radius.pill,
              backgroundColor: i === index ? colors.gray[0] : 'rgba(255,255,255,0.32)',
            }}
          />
        </Pressable>
      ))}
    </View>
  );
}

export function SegmentCarousel() {
  const router = useRouter();
  const { isDesktopUp } = useResponsive();
  const [index, setIndex] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;

  const goTo = (next: number) => {
    const clamped = (next + SEGMENTS.length) % SEGMENTS.length;
    Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => {
      setIndex(clamped);
      Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    });
  };

  useEffect(() => {
    const duration = SEGMENTS[index].durationMs ?? DEFAULT_DURATION_MS;
    const timer = setInterval(() => goTo(index + 1), duration);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const segment = SEGMENTS[index];
  const showPanel = !segment.hidePanel;
  const height = isDesktopUp ? 460 : 320;
  const panelWidth = 400;

  return (
    <View
      style={{
        overflow: 'hidden',
        height,
        backgroundColor: colors.gray[900],
        flexDirection: isDesktopUp ? 'row' : 'column',
      }}
    >
      <Animated.View style={{ flex: 1, opacity, flexDirection: isDesktopUp ? 'row' : 'column', position: 'relative' }}>
        <Image
          source={typeof segment.image === 'string' ? { uri: segment.image } : segment.image}
          style={{
            flex: 1,
            width: '100%',
            height: '100%',
            backgroundColor: showPanel ? undefined : (segment.letterboxColor ?? colors.gray[900]),
          }}
          // Cropping-style slides use "cover" to fill the frame; full-bleed
          // slides (hidePanel) use "contain" so the whole banner — including
          // copy near the top/bottom edges — is never cut off.
          resizeMode={showPanel ? 'cover' : 'contain'}
          accessibilityLabel={segment.title}
        />

        {showPanel ? (
          // Vertical info panel — right side on desktop, bottom bar on mobile
          <View
            style={{
              width: isDesktopUp ? panelWidth : '100%',
              backgroundColor: 'rgba(24,23,26,0.94)',
              paddingHorizontal: isDesktopUp ? spacing.xl : spacing.lg,
              paddingVertical: isDesktopUp ? spacing.xl : spacing.lg,
              justifyContent: 'center',
              gap: spacing.sm,
            }}
          >
            <MDText variant="overline" style={{ color: colors.plum[300] }}>
              {segment.eyebrow}
            </MDText>
            <MDText variant={isDesktopUp ? 'h2' : 'h3'} style={{ color: colors.gray[0] }} numberOfLines={3}>
              {segment.title}
            </MDText>

            <Pressable
              onPress={() =>
                router.push({ pathname: '/(buyer)/category/[slug]', params: { slug: segment.ctaSlug! } })
              }
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.xs }}
            >
              <MDText variant="bodySm" weight="700" style={{ color: colors.gray[0] }}>
                {segment.ctaLabel}
              </MDText>
              <Ionicons name="arrow-forward" size={14} color={colors.gray[0]} />
            </Pressable>

            <View style={{ marginTop: spacing.md }}>
              <SegmentDots index={index} onSelect={goTo} />
            </View>
          </View>
        ) : (
          // Full-bleed slide — no overlay text, just a floating pagination
          // indicator so the slide count/position is still visible.
          <View style={{ position: 'absolute', left: spacing.lg, bottom: spacing.lg }}>
            <SegmentDots index={index} onSelect={goTo} />
          </View>
        )}
      </Animated.View>

      <Pressable
        onPress={() => goTo(index - 1)}
        accessibilityLabel="Previous segment"
        style={{
          position: 'absolute',
          left: spacing.md,
          top: '42%',
          width: 34,
          height: 34,
          borderRadius: radius.pill,
          backgroundColor: 'rgba(24,23,26,0.55)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name="chevron-back" size={18} color={colors.gray[0]} />
      </Pressable>
      <Pressable
        onPress={() => goTo(index + 1)}
        accessibilityLabel="Next segment"
        style={{
          position: 'absolute',
          right: isDesktopUp && showPanel ? panelWidth + spacing.md : spacing.md,
          top: '42%',
          width: 34,
          height: 34,
          borderRadius: radius.pill,
          backgroundColor: 'rgba(24,23,26,0.55)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name="chevron-forward" size={18} color={colors.gray[0]} />
      </Pressable>
    </View>
  );
}
