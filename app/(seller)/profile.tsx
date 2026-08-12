import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radius, spacing, useToast, MDBadge, MDButton, MDInput, MDText } from '@/design-system';
import { useAuthStore } from '@/state';
import { useLogout } from '@/features/auth';
import { ProtoBadge } from '@/components/ProtoBadge';

export default function SellerProfile() {
  const router = useRouter();
  const toast = useToast();
  const session = useAuthStore((s) => s.session);
  const updateUser = useAuthStore((s) => s.updateUser);
  const logout = useLogout();

  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(session?.user.fullName ?? '');
  const [phone, setPhone] = useState(session?.user.phone ?? '');

  if (!session) return null;
  const brands = session.user.sellerManufacturers ?? [];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ padding: spacing.xl, maxWidth: 560 }}>
        <MDText variant="h1" style={{ marginBottom: spacing.xl }}>
          Brand Profile
        </MDText>

        <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, backgroundColor: colors.surfaceRaised, marginBottom: spacing.lg }}>
          <MDText variant="h4" style={{ marginBottom: spacing.md }}>
            Brands You Manage
          </MDText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm }}>
            {brands.length > 0 ? (
              brands.map((b) => <MDBadge key={b} label={b} tone="brand" />)
            ) : (
              <MDText variant="bodySm" tone="tertiary">
                No brand assigned yet.
              </MDText>
            )}
          </View>
          <ProtoBadge label="Brand assignment is set by Millennium Digital when console access is granted" />
        </View>

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
              <MDInput label="Contact Name" value={fullName} onChangeText={setFullName} />
              <MDInput label="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <MDButton
                  label="Save"
                  onPress={() => {
                    updateUser({ fullName, phone });
                    setEditing(false);
                    toast.show('Profile updated.', 'success');
                  }}
                />
                <MDButton label="Cancel" variant="ghost" onPress={() => setEditing(false)} />
              </View>
            </View>
          ) : (
            <View style={{ gap: spacing.sm }}>
              <Row label="Company" value={session.user.company ?? '—'} />
              <Row label="Contact Name" value={session.user.fullName} />
              <Row label="Email" value={session.user.email} />
              <Row label="Phone" value={session.user.phone ?? '—'} />
              <Row label="Role" value="Seller" />
            </View>
          )}
        </View>

        <MDButton
          label="Log Out"
          variant="outline"
          onPress={() => {
            logout();
            router.replace('/(auth)/seller-login');
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
