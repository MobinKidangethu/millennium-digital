import { useState } from 'react';
import { View } from 'react-native';
import { colors, radius, spacing, useToast, MDButton, MDInput, MDText } from '@/design-system';
import { useAuthStore } from '@/state';
import { useChangePassword } from '@/features/auth';

export default function Security() {
  const toast = useToast();
  const session = useAuthStore((s) => s.session);
  const changePassword = useChangePassword();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!session) return null;

  const handleSubmit = () => {
    setError(null);
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    changePassword.mutate(
      { email: session.user.email, currentPassword, newPassword },
      {
        onSuccess: () => {
          toast.show('Password updated.', 'success');
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        },
        onError: (e) => setError((e as Error).message),
      },
    );
  };

  return (
    <View>
      <MDText variant="h1" style={{ marginBottom: spacing.xl }}>
        Security
      </MDText>

      <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.xl }}>
        <MDText variant="h4" style={{ marginBottom: spacing.md }}>
          Change Password
        </MDText>
        <View style={{ gap: spacing.md }}>
          <MDInput label="Current Password" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry />
          <MDInput label="New Password" value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder="At least 6 characters" />
          <MDInput label="Confirm New Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

          {error ? (
            <MDText variant="bodySm" style={{ color: colors.status.error }}>
              {error}
            </MDText>
          ) : null}

          <MDButton label="Update Password" onPress={handleSubmit} loading={changePassword.isPending} style={{ alignSelf: 'flex-start' }} />
        </View>
      </View>

      <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg }}>
        <MDText variant="h4" style={{ marginBottom: spacing.xs }}>
          Account Access
        </MDText>
        <MDText variant="bodySm" tone="secondary">
          You're signed in as {session.user.email} on this device.
        </MDText>
      </View>
    </View>
  );
}
