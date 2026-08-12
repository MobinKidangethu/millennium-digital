import { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AuthScreenShell } from '@/components/AuthScreenShell';
import { colors, spacing, MDButton, MDInput, MDText, useToast } from '@/design-system';
import { useResetPassword } from '@/features/auth';

export default function ResetPassword() {
  const router = useRouter();
  const { email: emailParam } = useLocalSearchParams<{ email?: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const resetPassword = useResetPassword();
  const toast = useToast();

  const email = emailParam ?? '';

  const handleSubmit = () => {
    setFormError(null);
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }
    resetPassword.mutate(
      { email, newPassword: password },
      {
        onSuccess: () => {
          toast.show('Password updated — please log in.', 'success');
          router.replace('/(auth)/login');
        },
      },
    );
  };

  const errorMessage =
    formError ?? (resetPassword.isError ? (resetPassword.error as Error).message : null);

  return (
    <AuthScreenShell
      title="Set a new password"
      subtitle={email ? `Resetting password for ${email}` : 'Choose a new password for your account.'}
      showBack
      panel={{ character: require('../../assets/character-buyer.png') }}
    >
      <View style={{ gap: spacing.lg }}>
        <MDInput
          label="New password"
          value={password}
          onChangeText={setPassword}
          placeholder="At least 6 characters"
          secureTextEntry
        />
        <MDInput
          label="Confirm new password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Re-enter your new password"
          secureTextEntry
          returnKeyType="go"
          onSubmitEditing={handleSubmit}
        />

        {errorMessage ? (
          <MDText variant="bodySm" style={{ color: colors.status.error }}>
            {errorMessage}
          </MDText>
        ) : null}

        <MDButton
          label="Update Password"
          size="lg"
          fullWidth
          loading={resetPassword.isPending}
          onPress={handleSubmit}
        />
      </View>
    </AuthScreenShell>
  );
}
