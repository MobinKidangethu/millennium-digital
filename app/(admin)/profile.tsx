import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radius, spacing, useToast, MDButton, MDInput, MDText } from '@/design-system';
import { useAuthStore } from '@/state';
import { useLogout } from '@/features/auth';

export default function AdminProfile() {
  const router = useRouter();
  const toast = useToast();
  const session = useAuthStore((s) => s.session);
  const updateUser = useAuthStore((s) => s.updateUser);
  const logout = useLogout();

  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(session?.user.fullName ?? '');

  if (!session) return null;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ padding: spacing.xl, maxWidth: 560 }}>
        <MDText variant="h1" style={{ marginBottom: spacing.xl }}>
          Admin Profile
        </MDText>

        <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, backgroundColor: colors.surfaceRaised, marginBottom: spacing.xl }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md }}>
            <MDText variant="h4">Account Details</MDText>
            {!editing ? (
              <MDText variant="bodySm" weight="600" style={{ color: colors.brand.primary }} onPress={() => setEditing(true)}>
                Edit
              </MDText>
            ) : null}
          </View>

          {editing ? (
            <View style={{ gap: spacing.md }}>
              <MDInput label="Full Name" value={fullName} onChangeText={setFullName} />
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <MDButton
                  label="Save"
                  onPress={() => {
                    updateUser({ fullName });
                    setEditing(false);
                    toast.show('Profile updated.', 'success');
                  }}
                />
                <MDButton label="Cancel" variant="ghost" onPress={() => setEditing(false)} />
              </View>
            </View>
          ) : (
            <View style={{ gap: spacing.sm }}>
              <Row label="Full Name" value={session.user.fullName} />
              <Row label="Email" value={session.user.email} />
              <Row label="Role" value="Administrator" />
            </View>
          )}
        </View>

        <MDButton
          label="Log Out"
          variant="outline"
          onPress={() => {
            logout();
            router.replace('/(auth)/admin-login');
          }}
        />
      </View>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <MDText variant="bodySm" tone="secondary">
        {label}
      </MDText>
      <MDText variant="bodySm" weight="600">
        {value}
      </MDText>
    </View>
  );
}
