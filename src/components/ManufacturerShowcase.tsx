import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radius, shadow, spacing } from '@/design-system';
import type { Manufacturer } from '@/types';
import { MDManufacturerLogo } from './MDManufacturerLogo';

const CARD_HEIGHT = 96;
const CARD_GAP = spacing.lg;
const VISIBLE_HEIGHT = CARD_HEIGHT * 3.4;

/**
 * One vertically auto-scrolling column of manufacturer logo cards. The item
 * list is rendered twice back-to-back and looped so the seam is invisible —
 * a standard continuous-marquee technique, implemented with Animated so it
 * works on web, iOS, and Android without extra dependencies.
 */
function AutoScrollColumn({
  manufacturers,
  direction,
  duration,
  topOffset = 0,
}: {
  manufacturers: Manufacturer[];
  direction: 'up' | 'down';
  duration: number;
  topOffset?: number;
}) {
  const router = useRouter();
  const translateY = useRef(new Animated.Value(0)).current;
  const doubled = useMemo(() => [...manufacturers, ...manufacturers], [manufacturers]);
  const trackHeight = manufacturers.length * (CARD_HEIGHT + CARD_GAP);

  useEffect(() => {
    if (manufacturers.length === 0) return;
    const from = direction === 'up' ? 0 : -trackHeight;
    const to = direction === 'up' ? -trackHeight : 0;
    translateY.setValue(from);

    let cancelled = false;
    const runCycle = () => {
      if (cancelled) return;
      Animated.timing(translateY, {
        toValue: to,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished && !cancelled) {
          translateY.setValue(from);
          runCycle();
        }
      });
    };
    runCycle();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manufacturers.length, direction, duration, trackHeight]);

  if (manufacturers.length === 0) return null;

  return (
    <View style={{ height: VISIBLE_HEIGHT, overflow: 'hidden', marginTop: topOffset, flex: 1 }}>
      <Animated.View style={{ transform: [{ translateY }] }}>
        {doubled.map((manufacturer, index) => (
          <Pressable
            key={`${manufacturer.slug}-${index}`}
            onPress={() => router.push({ pathname: '/(buyer)/manufacturers/[slug]', params: { slug: manufacturer.slug } })}
            style={[
              {
                height: CARD_HEIGHT,
                marginBottom: CARD_GAP,
                borderRadius: radius.lg,
                backgroundColor: colors.surfaceRaised,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: spacing.md,
              },
              shadow.sm,
            ]}
          >
            <MDManufacturerLogo manufacturer={manufacturer.name} width={104} height={30} />
          </Pressable>
        ))}
      </Animated.View>
    </View>
  );
}

export function ManufacturerShowcase({ manufacturers }: { manufacturers: Manufacturer[] }) {
  const columns = useMemo(() => {
    const cols: Manufacturer[][] = [[], [], []];
    manufacturers.forEach((m, i) => cols[i % 3].push(m));
    return cols.filter((c) => c.length > 0);
  }, [manufacturers]);

  if (columns.length === 0) return null;

  return (
    <View style={{ flexDirection: 'row', gap: spacing.lg, height: VISIBLE_HEIGHT }}>
      {columns.map((col, index) => (
        <AutoScrollColumn
          key={index}
          manufacturers={col}
          direction={index % 2 === 0 ? 'up' : 'down'}
          duration={16000 + index * 3000}
          topOffset={index === 1 ? -CARD_HEIGHT * 0.4 : 0}
        />
      ))}
    </View>
  );
}
