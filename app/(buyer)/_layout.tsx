import { View } from 'react-native';
import { Stack } from 'expo-router';
import { colors, useResponsive } from '@/design-system';
import { BuyerHeader } from '@/components/BuyerHeader';
import { MobileBottomNav } from '@/components/MobileBottomNav';

export default function BuyerLayout() {
  const { isDesktopUp } = useResponsive();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <BuyerHeader />
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
      {!isDesktopUp ? <MobileBottomNav /> : null}
    </View>
  );
}
