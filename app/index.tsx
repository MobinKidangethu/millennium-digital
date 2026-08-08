import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Redirect } from 'expo-router';
import { ActivityIndicator } from 'react-native';
import { colors, spacing } from '@/design-system';
import { useAuthStore, useWelcomeStore } from '@/state';

export default function Splash() {
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const authHydrated = useAuthStore((s) => s.hasHydrated);
  const welcomeHydrated = useWelcomeStore((s) => s.hasHydrated);
  const session = useAuthStore((s) => s.session);
  const hasSeenWelcome = useWelcomeStore((s) => s.hasSeenWelcome);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), 550);
    return () => clearTimeout(timer);
  }, []);

  const ready = authHydrated && welcomeHydrated && minTimeElapsed;

  if (ready) {
    if (session?.user.role === 'admin') {
      return <Redirect href="/(admin)/dashboard" />;
    }
    if (session?.user.role === 'buyer') {
      return <Redirect href="/(buyer)" />;
    }
    if (!hasSeenWelcome) {
      return <Redirect href="/(auth)/welcome" />;
    }
    return <Redirect href="/(buyer)" />;
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/Millenium_Logo_new.png')}
        style={styles.logo}
        resizeMode="contain"
        accessibilityLabel="Millennium Digital"
      />
      <ActivityIndicator
        color={colors.brand.primary}
        style={{ marginTop: spacing['2xl'] }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  logo: {
    width: 220,
    height: 40,
  },
});
