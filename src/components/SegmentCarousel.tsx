import { useEffect, useRef, useState } from 'react';
import { Animated, Image, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, useResponsive, MDText } from '@/design-system';

interface SegmentChip {
  label: string;
  slug: string;
}

interface Segment {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  chips: SegmentChip[];
  ctaLabel: string;
  ctaSlug: string;
}

/**
 * Industry segments Millennium Digital serves, each mapped to real
 * category slugs from the live catalog (products.json / useCategories) —
 * no fabricated categories or counts. Imagery is sourced from Unsplash
 * (free license) to represent each segment; not photography of actual
 * client inventory. See project rule: never invent product/category data.
 */
const SEGMENTS: Segment[] = [
  {
    eyebrow: 'INDUSTRY SEGMENT',
    title: 'Automotive & EV Electronics',
    description:
      'Semiconductors, sensors, and power connectors sourced for automotive-grade reliability and traceability.',
    image:
      'https://images.unsplash.com/photo-1777642328916-d96fc156f32b?auto=format&fit=crop&w=1600&q=80',
    chips: [
      { label: 'Semiconductors', slug: 'semiconductors' },
      { label: 'Sensors', slug: 'sensors' },
      { label: 'Connectors', slug: 'connectors' },
    ],
    ctaLabel: 'Explore Semiconductors',
    ctaSlug: 'semiconductors',
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
    title: 'Semiconductors, ICs & Embedded Systems',
    description:
      'The foundation layer — discrete semiconductors and embedded modules sourced from verified manufacturers.',
    image:
      'https://images.unsplash.com/photo-1562408590-e32931084e23?auto=format&fit=crop&w=1600&q=80',
    chips: [
      { label: 'Semiconductors', slug: 'semiconductors' },
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
    const timer = setInterval(() => goTo(index + 1), 5500);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const segment = SEGMENTS[index];
  const height = isDesktopUp ? 520 : 340;

  return (
    <View
      style={{
        borderRadius: radius.xl,
        overflow: 'hidden',
        height,
        backgroundColor: colors.gray[900],
      }}
    >
      <Animated.View style={{ flex: 1, opacity }}>
        <Image
          source={{ uri: segment.image }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
          accessibilityLabel={segment.title}
        />

        {/* Bottom scrim + info panel */}
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(24,23,26,0.90)',
            paddingHorizontal: isDesktopUp ? spacing['2xl'] : spacing.lg,
            paddingVertical: isDesktopUp ? spacing.xl : spacing.lg,
            gap: spacing.xs,
          }}
        >
          <MDText variant="overline" style={{ color: colors.plum[300] }}>
            {segment.eyebrow}
          </MDText>
          <MDText variant={isDesktopUp ? 'h2' : 'h3'} style={{ color: colors.gray[0] }}>
            {segment.title}
          </MDText>
          <MDText
            variant="bodySm"
            style={{ color: colors.gray[300], maxWidth: 520, marginBottom: spacing.sm }}
          >
            {segment.description}
          </MDText>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm }}>
            {segment.chips.map((chip) => (
              <Pressable
                key={chip.label}
                onPress={() =>
                  router.push({ pathname: '/(buyer)/category/[slug]', params: { slug: chip.slug } })
                }
                style={{
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.28)',
                  backgroundColor: 'rgba(255,255,255,0.10)',
                  borderRadius: radius.pill,
                  paddingHorizontal: spacing.sm,
                  paddingVertical: 5,
                }}
              >
                <MDText variant="caption" weight="600" style={{ color: colors.gray[0] }}>
                  {chip.label}
                </MDText>
              </Pressable>
            ))}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Pressable
              onPress={() =>
                router.push({ pathname: '/(buyer)/category/[slug]', params: { slug: segment.ctaSlug } })
              }
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
            >
              <MDText variant="bodySm" weight="700" style={{ color: colors.gray[0] }}>
                {segment.ctaLabel}
              </MDText>
              <Ionicons name="arrow-forward" size={14} color={colors.gray[0]} />
            </Pressable>

            <View style={{ flexDirection: 'row', gap: 6 }}>
              {SEGMENTS.map((s, i) => (
                <Pressable key={s.title} onPress={() => goTo(i)} hitSlop={8}>
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
          </View>
        </View>
      </Animated.View>

      {isDesktopUp ? (
        <>
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
              right: spacing.md,
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
        </>
      ) : null}
    </View>
  );
}
