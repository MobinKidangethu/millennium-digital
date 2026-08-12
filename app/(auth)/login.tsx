import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthScreenShell } from '@/components/AuthScreenShell';
import { colors, spacing, MDButton, MDInput, MDText } from '@/design-system';
import { useLogin, DEMO_BUYER_CREDENTIALS } from '@/features/auth';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useLogin();

  const handleSubmit = () => {
    login.mutate(
      { email, password },
      { onSuccess: () => router.replace('/(buyer)') },
    );
  };

  return (
    <AuthScreenShell
      title="Welcome back"
      subtitle="Log in to your Millennium Digital account."
      panel={{ character: require('../../assets/character-buyer.png') }}
    >
      <View style={{ gap: spacing.lg }}>
        <MDInput
          label="Email address"
          value={email}
          onChangeText={setEmail}
          placeholder="you@company.com"
          keyboardType="email-address"
          autoCapitalize="none"
          returnKeyType="next"
        />
        <MDInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
          returnKeyType="go"
          onSubmitEditing={handleSubmit}
        />

        {login.isError ? (
          <MDText variant="bodySm" style={{ color: colors.status.error }}>
            {(login.error as Error).message}
          </MDText>
        ) : null}

        <MDText
          variant="bodySm"
          weight="600"
          style={{ color: colors.brand.primary, alignSelf: 'flex-end' }}
          onPress={() => router.push('/(auth)/forgot-password')}
        >
          Forgot password?
        </MDText>

        <MDButton
          label="Log In"
          size="lg"
          fullWidth
          loading={login.isPending}
          onPress={handleSubmit}
        />

        <MDText variant="caption" tone="tertiary" align="center">
          Demo account: {DEMO_BUYER_CREDENTIALS.email} / {DEMO_BUYER_CREDENTIALS.password}
        </MDText>
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          gap: spacing.xs,
          marginTop: spacing.xl,
        }}
      >
        <MDText variant="bodySm" tone="secondary">
          New to Millennium Digital?
        </MDText>
        <MDText
          variant="bodySm"
          weight="600"
          style={{ color: colors.brand.primary }}
          onPress={() => router.push('/(auth)/register')}
        >
          Create an account
        </MDText>
      </View>

      <MDText
        variant="caption"
        tone="tertiary"
        align="center"
        style={{ marginTop: spacing.lg }}
        onPress={() => router.push('/(auth)/seller-register')}
      >
        Selling electronics components? Apply as a seller
      </MDText>
    </AuthScreenShell>
  );
}
