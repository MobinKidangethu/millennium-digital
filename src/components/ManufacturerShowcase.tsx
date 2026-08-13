import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radius, shadow, spacing } from '@/design-system';
import type { Manufacturer } from '@/types';
import { MDManufacturerLogo } from './MDManufacturerLogo';

const CARD_WIDTH = 188;
const CARD_HEIGHT = 96;
const CARD_GAP = spacing.lg;
const ROW_GAP = spacing.lg;

/**
 * One horizontally auto-scrolling row of manufacturer logo cards, full
 * width of its container. The item list is rendered twice back-to-back and
 * looped so the seam is invisible — a standard continuous-marquee
 * technique, implemented with Animated so it works on web, iOS, and
 * Android without extra dependencies. Same looping technique as the
 * showcase previously used (vertical columns) — just translating on X
 * instead of Y, three rows alternating direction (ltr / rtl / ltr).
 */
function AutoScrollRow({
  manufacturers,
  direction,
  duration,
}: {
  manufacturers: Manufacturer[];
  /** Visual direction the logos travel across the screen. */
  direction: 'ltr' | 'rtl';
  duration: number;
}) {
  const router = useRouter();
  const translateX = useRef(new Animated.Value(0)).current;
  const doubled = useMemo(() => [...manufacturers, ...manufacturers], [manufacturers]);
  const trackWidth = manufacturers.length * (CARD_WIDTH + CARD_GAP);

  useEffect(() => {
    if (manufacturers.length === 0) return;
    const from = direction === 'ltr' ? -trackWidth : 0;
    const to = direction === 'ltr' ? 0 : -trackWidth;
    translateX.setValue(from);

    let cancelled = false;
    const runCycle = () => {
      if (cancelled) return;
      Animated.timing(translateX, {
        toValue: to,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished && !cancelled) {
          translateX.setValue(from);
          runCycle();
        }
      });
    };
    runCycle();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manufacturers.length, direction, duration, trackWidth]);

  if (manufacturers.length === 0) return null;

  return (
    <View style={{ height: CARD_HEIGHT, overflow: 'hidden', width: '100%' }}>
      <Animated.View style={{ flexDirection: 'row', transform: [{ translateX }] }}>
        {doubled.map((manufacturer, index) => (
          <Pressable
            key={`${manufacturer.slug}-${index}`}
            onPress={() => router.push({ pathname: '/(buyer)/manufacturers/[slug]', params: { slug: manufacturer.slug } })}
            style={[
              {
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                marginRight: CARD_GAP,
                borderRadius: radius.lg,
                // Adaptive neutral surface (the app's off-white "surface"
                // token, same one section backgrounds use) instead of a
                // hardcoded pure-white card, so tiles read as part of the
                // page rather than floating white boxes.
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: spacing.md,
              },
              shadow.sm,
            ]}
          >
            <MDManufacturerLogo manufacturer={manufacturer.name} width={150} height={48} />
          </Pressable>
        ))}
      </Animated.View>
    </View>
  );
}

export function ManufacturerShowcase({ manufacturers }: { manufacturers: Manufacturer[] }) {
  const rows = useMemo(() => {
    const r: Manufacturer[][] = [[], [], []];
    manufacturers.forEach((m, i) => r[i % 3].push(m));
    return r.filter((c) => c.length > 0);
  }, [manufacturers]);

  if (rows.length === 0) return null;

  return (
    <View style={{ width: '100%', gap: ROW_GAP }}>
      {rows.map((row, index) => (
        <AutoScrollRow
          key={index}
          manufacturers={row}
          // Row 1: left-to-right, row 2: right-to-left, row 3: left-to-right
          // again — alternating per row like the previous vertical version
          // alternated up/down per column.
          direction={index % 2 === 0 ? 'ltr' : 'rtl'}
          duration={20000 + index * 3000}
        />
      ))}
    </View>
  );
}
