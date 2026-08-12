import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthScreenShell } from '@/components/AuthScreenShell';
import { colors, spacing, MDButton, MDInput, MDText } from '@/design-system';
import { useRequestPasswordReset } from '@/features/auth';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const requestReset = useRequestPasswordReset();

  const handleSubmit = () => {
    requestReset.mutate(email, {
      onSuccess: () =>
        router.push({ pathname: '/(auth)/reset-password', params: { email } }),
    });
  };

  return (
    <AuthScreenShell
      title="Forgot your password?"
      subtitle="Enter your account email and we'll help you reset it."
      showBack
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
          returnKeyType="go"
          onSubmitEditing={handleSubmit}
        />

        {requestReset.isError ? (
          <MDText variant="bodySm" style={{ color: colors.status.error }}>
            {(requestReset.error as Error).message}
          </MDText>
        ) : null}

        <MDButton
          label="Send Reset Instructions"
          size="lg"
          fullWidth
          loading={requestReset.isPending}
          onPress={handleSubmit}
        />
      </View>
    </AuthScreenShell>
  );
}
