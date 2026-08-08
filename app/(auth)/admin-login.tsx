import { useState } from 'react';
import { Image, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  spacing,
  MDButton,
  MDInput,
  MDText,
  MDBadge,
} from '@/design-system';
import { useAdminLogin, DEMO_ADMIN_CREDENTIALS } from '@/features/auth';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const adminLogin = useAdminLogin();

  const handleSubmit = () => {
    adminLogin.mutate(
      { email, password },
      { onSuccess: () => router.replace('/(admin)/dashboard') },
    );
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.gray[900],
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
      }}
    >
      <View
        style={{
          width: '100%',
          maxWidth: 420,
          backgroundColor: colors.gray[800],
          borderRadius: 20,
          borderWidth: 1,
          borderColor: colors.gray[700],
          padding: spacing['2xl'],
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xl }}>
          <View
            style={{
              backgroundColor: colors.gray[0],
              borderRadius: 8,
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.md,
            }}
          >
            <Image
              source={require('../../assets/Millenium_Logo_new.png')}
              style={{ width: 140, height: 25 }}
              resizeMode="contain"
              accessibilityLabel="Millennium Digital"
            />
          </View>
          <MDBadge label="ENTERPRISE" tone="neutral" />
        </View>

        <MDText variant="h2" style={{ color: colors.gray[0] }}>
          Seller / Admin Console
        </MDText>
        <MDText variant="body" style={{ color: colors.gray[400], marginTop: spacing.xs, marginBottom: spacing.xl }}>
          Restricted access for authorized Millennium Digital staff.
        </MDText>

        <View style={{ gap: spacing.lg }}>
          <MDInput
            label="Email address"
            labelColor={colors.gray[300]}
            value={email}
            onChangeText={setEmail}
            placeholder="admin@millenniumdigital.com"
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Ionicons name="business-outline" size={16} color={colors.gray[500]} />}
          />

          <MDInput
            label="Password"
            labelColor={colors.gray[300]}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
            returnKeyType="go"
            onSubmitEditing={handleSubmit}
          />

          {adminLogin.isError ? (
            <MDText variant="bodySm" style={{ color: colors.status.error }}>
              {(adminLogin.error as Error).message}
            </MDText>
          ) : null}

          <MDButton
            label="Sign In to Console"
            size="lg"
            fullWidth
            loading={adminLogin.isPending}
            onPress={handleSubmit}
          />

          <MDText variant="caption" style={{ color: colors.gray[500] }} align="center">
            Demo account: {DEMO_ADMIN_CREDENTIALS.email} / {DEMO_ADMIN_CREDENTIALS.password}
          </MDText>
        </View>

        <MDText
          variant="bodySm"
          weight="600"
          align="center"
          style={{ color: colors.gray[400], marginTop: spacing.xl }}
          onPress={() => router.replace('/(auth)/welcome')}
        >
          Back to buyer site
        </MDText>
      </View>
    </View>
  );
}
