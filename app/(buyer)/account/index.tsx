import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, useResponsive, useToast, MDButton, MDInput, MDText } from '@/design-system';
import { useAuthStore } from '@/state';
import { useLogout } from '@/features/auth';

const MOBILE_NAV = [
  { label: 'Addresses', href: '/(buyer)/account/addresses', icon: 'location-outline' as const },
  { label: 'Order History', href: '/(buyer)/account/orders', icon: 'receipt-outline' as const },
  { label: 'Wishlist', href: '/(buyer)/wishlist', icon: 'heart-outline' as const },
  { label: 'Compare', href: '/(buyer)/compare', icon: 'git-compare-outline' as const },
  { label: 'Recently Viewed', href: '/(buyer)/account/recently-viewed', icon: 'time-outline' as const },
  { label: 'Notifications', href: '/(buyer)/account/notifications', icon: 'notifications-outline' as const },
  { label: 'Security', href: '/(buyer)/account/security', icon: 'shield-checkmark-outline' as const },
];

export default function AccountProfile() {
  const router = useRouter();
  const { isDesktopUp } = useResponsive();
  const toast = useToast();
  const session = useAuthStore((s) => s.session);
  const updateUser = useAuthStore((s) => s.updateUser);
  const logout = useLogout();

  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(session?.user.fullName ?? '');
  const [company, setCompany] = useState(session?.user.company ?? '');
  const [phone, setPhone] = useState(session?.user.phone ?? '');

  if (!session) return null;

  const handleSave = () => {
    updateUser({ fullName, company: company || undefined, phone: phone || undefined });
    setEditing(false);
    toast.show('Profile updated.', 'success');
  };

  return (
    <View>
      <MDText variant="h1" style={{ marginBottom: spacing.xl }}>
        My Account
      </MDText>

      <View
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.lg,
          padding: spacing.lg,
          marginBottom: spacing.xl,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
          <MDText variant="h4">Personal Information</MDText>
          {!editing ? (
            <MDText variant="bodySm" weight="600" style={{ color: colors.brand.primary }} onPress={() => setEditing(true)}>
              Edit
            </MDText>
          ) : null}
        </View>

        {editing ? (
          <View style={{ gap: spacing.md }}>
            <MDInput label="Full Name" value={fullName} onChangeText={setFullName} />
            <MDInput label="Company" value={company} onChangeText={setCompany} />
            <MDInput label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <MDButton label="Save Changes" onPress={handleSave} />
              <MDButton label="Cancel" variant="ghost" onPress={() => setEditing(false)} />
            </View>
          </View>
        ) : (
          <View style={{ gap: spacing.sm }}>
            <InfoRow label="Full Name" value={session.user.fullName} />
            <InfoRow label="Email" value={session.user.email} />
            <InfoRow label="Company" value={session.user.company || '—'} />
            <InfoRow label="Phone" value={session.user.phone || '—'} />
          </View>
        )}
      </View>

      {!isDesktopUp ? (
        <View style={{ gap: 2, marginBottom: spacing.xl }}>
          {MOBILE_NAV.map((item) => (
            <Pressable
              key={item.label}
              onPress={() => router.push(item.href as never)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <Ionicons name={item.icon} size={18} color={colors.text.secondary} />
                <MDText variant="bodySm">{item.label}</MDText>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.text.tertiary} />
            </Pressable>
          ))}
        </View>
      ) : null}

      <MDButton
        label="Log Out"
        variant="outline"
        onPress={() => {
          logout();
          router.replace('/(auth)/welcome');
        }}
      />
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
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
