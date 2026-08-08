import type { ReactNode } from 'react';
import { Image, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, useResponsive, MDText, MDIconButton } from '@/design-system';

interface AuthScreenShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  showBack?: boolean;
}

export function AuthScreenShell({ title, subtitle, children, footer, showBack }: AuthScreenShellProps) {
  const { isDesktopUp } = useResponsive();
  const router = useRouter();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.surface }}
      contentContainerStyle={{
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
      }}
    >
      <View
        style={{
          width: '100%',
          maxWidth: 420,
          backgroundColor: colors.surfaceRaised,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: colors.border,
          padding: isDesktopUp ? spacing['2xl'] : spacing.xl,
        }}
      >
        {showBack ? (
          <MDIconButton
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            style={{ marginBottom: spacing.md, alignSelf: 'flex-start' }}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text.primary} />
          </MDIconButton>
        ) : null}

        <Image
          source={require('../../assets/Millenium_Logo_new.png')}
          style={{ width: 172, height: 30, marginBottom: spacing.xl }}
          resizeMode="contain"
          accessibilityLabel="Millennium Digital"
        />

        <MDText variant="h2">{title}</MDText>
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
  );
}
