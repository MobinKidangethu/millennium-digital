import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow, spacing, useResponsive, useToast, MDButton, MDInput, MDText } from '@/design-system';
import { useAddressStore, useAuthStore, useCurrencyStore } from '@/state';
import { useLogout } from '@/features/auth';
import { useOrders } from '@/features/orders';
import { ACCOUNT_NAV_GROUPS } from '@/constants/accountNav';
import { formatDisplayPrice } from '@/utils';

function initialsFor(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
}

export default function AccountProfile() {
  const router = useRouter();
  const { isDesktopUp } = useResponsive();
  const toast = useToast();
  const session = useAuthStore((s) => s.session);
  const updateUser = useAuthStore((s) => s.updateUser);
  const logout = useLogout();
  const addresses = useAddressStore((s) => s.addresses);
  const { data: orders } = useOrders(session?.user.id);
  const displayCurrency = useCurrencyStore((s) => s.currency);

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
      <MDText variant="h2" style={{ marginBottom: spacing.md }}>
        My Account
      </MDText>

      <View
        style={[
          {
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.lg,
            padding: spacing.md,
            marginBottom: spacing.md,
          },
          shadow.sm,
        ]}
      >
        {editing ? (
          <View style={{ gap: spacing.sm }}>
            <MDText variant="bodyMedium">Edit Personal Information</MDText>
            <MDInput label="Full Name" value={fullName} onChangeText={setFullName} />
            <MDInput label="Company" value={company} onChangeText={setCompany} />
            <MDInput label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <MDButton label="Save Changes" size="sm" onPress={handleSave} />
              <MDButton label="Cancel" size="sm" variant="ghost" onPress={() => setEditing(false)} />
            </View>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: radius.pill,
                backgroundColor: colors.brand.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MDText variant="bodyMedium" style={{ color: colors.gray[0] }}>
                {initialsFor(session.user.fullName)}
              </MDText>
            </View>

            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <MDText variant="bodyMedium">{session.user.fullName}</MDText>
                {session.user.company ? (
                  <MDText variant="caption" tone="tertiary">
                    · {session.user.company}
                  </MDText>
                ) : null}
              </View>
              <MDText variant="caption" tone="secondary">
                {session.user.email}
                {session.user.phone ? ` · ${session.user.phone}` : ''}
              </MDText>
            </View>

            <MDText
              variant="caption"
              weight="600"
              style={{ color: colors.brand.primary }}
              onPress={() => setEditing(true)}
            >
              Edit
            </MDText>
          </View>
        )}
      </View>

      <View style={{ flexDirection: isDesktopUp ? 'row' : 'column', gap: spacing.md, marginBottom: spacing.md }}>
        <View style={[{ flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md }, shadow.sm]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="location-outline" size={15} color={colors.text.secondary} />
              <MDText variant="bodySm" weight="700">Addresses</MDText>
            </View>
            <MDText
              variant="caption"
              weight="600"
              style={{ color: colors.brand.primary }}
              onPress={() => router.push('/(buyer)/account/addresses')}
            >
              {addresses.length ? 'Manage' : 'Add'}
            </MDText>
          </View>
          {addresses.length === 0 ? (
            <MDText variant="caption" tone="secondary">
              No saved addresses yet.
            </MDText>
          ) : (
            (() => {
              const primary = addresses.find((a) => a.isDefault) ?? addresses[0];
              return (
                <View>
                  <MDText variant="caption">{primary.fullName}</MDText>
                  <MDText variant="caption" tone="secondary">
                    {primary.line1}, {primary.city}, {primary.state} {primary.postalCode}
                  </MDText>
                  {addresses.length > 1 ? (
                    <MDText variant="caption" tone="tertiary">
                      +{addresses.length - 1} more saved
                    </MDText>
                  ) : null}
                </View>
              );
            })()
          )}
        </View>

        <View style={[{ flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md }, shadow.sm]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="receipt-outline" size={15} color={colors.text.secondary} />
              <MDText variant="bodySm" weight="700">Order History</MDText>
            </View>
            <MDText
              variant="caption"
              weight="600"
              style={{ color: colors.brand.primary }}
              onPress={() => router.push('/(buyer)/account/orders')}
            >
              View All
            </MDText>
          </View>
          {!orders || orders.length === 0 ? (
            <MDText variant="caption" tone="secondary">
              No orders yet — browse the catalog to place your first order.
            </MDText>
          ) : (
            <View>
              <MDText variant="caption">
                {orders.length} order{orders.length === 1 ? '' : 's'} placed
              </MDText>
              <MDText variant="caption" tone="secondary">
                Most recent: #{orders[0].orderNumber} · {formatDisplayPrice(orders[0].total, orders[0].currency, displayCurrency)}
              </MDText>
            </View>
          )}
        </View>
      </View>

      {!isDesktopUp ? (
        <View style={{ marginBottom: spacing.md }}>
          {ACCOUNT_NAV_GROUPS.map((group) => (
            <View key={group.key} style={{ marginBottom: spacing.sm }}>
              <MDText variant="overline" tone="tertiary" style={{ marginBottom: 2 }}>
                {group.label.toUpperCase()}
              </MDText>
              {group.items
                .filter((item) => item.href !== '/(buyer)/account')
                .map((item) => (
                  <Pressable
                    key={item.label}
                    onPress={() => router.push(item.href as never)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingVertical: spacing.sm,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                      <Ionicons name={item.icon} size={16} color={colors.text.secondary} />
                      <MDText variant="bodySm">{item.label}</MDText>
                    </View>
                    <Ionicons name="chevron-forward" size={14} color={colors.text.tertiary} />
                  </Pressable>
                ))}
            </View>
          ))}

          <Pressable
            onPress={() => router.push('/(auth)/seller-register')}
            style={{
              borderWidth: 1,
              borderColor: colors.brand.primarySoftBorder,
              backgroundColor: colors.brand.primarySoft,
              borderRadius: radius.md,
              padding: spacing.sm,
            }}
          >
            <MDText variant="caption" weight="700" style={{ color: colors.brand.primary, marginBottom: 2 }}>
              Sell on Millennium Digital
            </MDText>
            <MDText variant="caption" tone="secondary">
              Apply to list your catalogue as a verified supplier.
            </MDText>
          </Pressable>
        </View>
      ) : null}

      <MDButton
        label="Log Out"
        variant="outline"
        size="sm"
        style={{ alignSelf: 'flex-start' }}
        onPress={() => {
          logout();
          router.replace('/(auth)/welcome');
        }}
      />
    </View>
  );
}
