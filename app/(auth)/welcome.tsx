import { Image, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, radius, useResponsive, MDText, MDButton } from '@/design-system';
import { useWelcomeStore } from '@/state';

const TRUST_POINTS = [
  'Genuine, verified components',
  'Real-time availability',
  'Technical datasheets on every part',
];

export default function Welcome() {
  const router = useRouter();
  const { isDesktopUp } = useResponsive();
  const markSeen = useWelcomeStore((s) => s.markSeen);

  const continueAsGuest = () => {
    markSeen();
    router.replace('/(buyer)');
  };

  const goTo = (path: '/(auth)/login' | '/(auth)/register') => {
    markSeen();
    router.push(path);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing.xl,
          paddingTop: spacing['4xl'],
          paddingBottom: spacing['4xl'],
        }}
      >
        <View style={{ width: '100%', maxWidth: 440, alignItems: 'center' }}>
          <Image
            source={require('../../assets/Millenium_Logo_new.png')}
            style={{ width: 240, height: 42, marginBottom: spacing['2xl'] }}
            resizeMode="contain"
            accessibilityLabel="Millennium Digital"
          />

          <MDText variant={isDesktopUp ? 'display' : 'h1'} align="center">
            Powering Innovation With Trusted Electronic Components
          </MDText>
          <MDText
            variant="bodyLg"
            tone="secondary"
            align="center"
            style={{ marginTop: spacing.md, marginBottom: spacing['2xl'] }}
          >
            Genuine parts, verified manufacturers, and technical clarity for engineers and
            procurement teams.
          </MDText>

          <View style={{ width: '100%', gap: spacing.md }}>
            <MDButton label="Continue as Guest" size="lg" fullWidth onPress={continueAsGuest} />
            <MDButton
              label="Log In"
              size="lg"
              variant="outline"
              fullWidth
              onPress={() => goTo('/(auth)/login')}
            />
            <MDButton
              label="Create an Account"
              size="lg"
              variant="ghost"
              fullWidth
              onPress={() => goTo('/(auth)/register')}
            />
          </View>

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: spacing.lg,
              marginTop: spacing['2xl'],
              paddingTop: spacing.xl,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              width: '100%',
            }}
          >
            {TRUST_POINTS.map((point) => (
              <View
                key={point}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.xs,
                }}
              >
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: radius.pill,
                    backgroundColor: colors.brand.primary,
                  }}
                />
                <MDText variant="caption" tone="secondary">
                  {point}
                </MDText>
              </View>
            ))}
          </View>

          <MDText
            variant="caption"
            tone="tertiary"
            align="center"
            style={{ marginTop: spacing['2xl'] }}
            onPress={() => {
              markSeen();
              router.push('/(auth)/admin-login');
            }}
          >
            Seller / Admin sign in
          </MDText>
        </View>
      </View>
    </ScrollView>
  );
}
