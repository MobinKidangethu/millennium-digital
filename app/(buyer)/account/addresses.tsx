import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, useToast, MDButton, MDEmptyState, MDInput, MDText } from '@/design-system';
import { useAddressStore } from '@/state';

const EMPTY_FORM = {
  label: 'Home',
  fullName: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  phone: '',
  isDefault: false,
};

export default function Addresses() {
  const toast = useToast();
  const addresses = useAddressStore((s) => s.addresses);
  const addAddress = useAddressStore((s) => s.addAddress);
  const updateAddress = useAddressStore((s) => s.updateAddress);
  const removeAddress = useAddressStore((s) => s.removeAddress);
  const setDefault = useAddressStore((s) => s.setDefault);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  const updateField = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const startAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const startEdit = (id: string) => {
    const address = addresses.find((a) => a.id === id);
    if (!address) return;
    const { id: _id, ...rest } = address;
    setForm({ ...rest, line2: rest.line2 ?? '' });
    setEditingId(id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.fullName || !form.line1 || !form.city || !form.state || !form.postalCode || !form.phone) {
      setError('Please fill in all required fields.');
      return;
    }
    if (editingId) {
      updateAddress(editingId, form);
      toast.show('Address updated.', 'success');
    } else {
      addAddress(form);
      toast.show('Address added.', 'success');
    }
    setShowForm(false);
    setError(null);
  };

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl }}>
        <MDText variant="h1">Addresses</MDText>
        {!showForm && addresses.length > 0 ? <MDButton label="Add Address" size="sm" onPress={startAdd} /> : null}
      </View>

      {showForm ? (
        <View style={{ gap: spacing.md, marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg }}>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <MDInput label="Label" value={form.label} onChangeText={(v) => updateField('label', v)} style={{ flex: 1 }} placeholder="Home, Office…" />
            <MDInput label="Full Name" value={form.fullName} onChangeText={(v) => updateField('fullName', v)} style={{ flex: 1 }} />
          </View>
          <MDInput label="Phone" value={form.phone} onChangeText={(v) => updateField('phone', v)} keyboardType="phone-pad" />
          <MDInput label="Address Line 1" value={form.line1} onChangeText={(v) => updateField('line1', v)} />
          <MDInput label="Address Line 2 (optional)" value={form.line2} onChangeText={(v) => updateField('line2', v)} />
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <MDInput label="City" value={form.city} onChangeText={(v) => updateField('city', v)} style={{ flex: 1 }} />
            <MDInput label="State" value={form.state} onChangeText={(v) => updateField('state', v)} style={{ flex: 1 }} />
            <MDInput label="Postal Code" value={form.postalCode} onChangeText={(v) => updateField('postalCode', v)} style={{ flex: 1 }} keyboardType="numeric" />
          </View>
          <MDInput label="Country" value={form.country} onChangeText={(v) => updateField('country', v)} />

          {error ? (
            <MDText variant="bodySm" style={{ color: colors.status.error }}>
              {error}
            </MDText>
          ) : null}

          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <MDButton label={editingId ? 'Save Changes' : 'Add Address'} onPress={handleSave} />
            <MDButton label="Cancel" variant="ghost" onPress={() => setShowForm(false)} />
          </View>
        </View>
      ) : null}

      {addresses.length === 0 && !showForm ? (
        <MDEmptyState
          icon={<Ionicons name="location-outline" size={40} color={colors.text.tertiary} />}
          title="No saved addresses"
          description="Add a shipping address to speed up checkout next time."
          actionLabel="Add Address"
          onAction={startAdd}
        />
      ) : (
        <View style={{ gap: spacing.md }}>
          {addresses.map((address) => (
            <View
              key={address.id}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.lg,
                padding: spacing.lg,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 4 }}>
                    <MDText variant="bodyMedium">{address.label}</MDText>
                    {address.isDefault ? (
                      <View style={{ backgroundColor: colors.brand.primarySoft, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 2 }}>
                        <MDText variant="caption" weight="600" style={{ color: colors.brand.primary }}>
                          Default
                        </MDText>
                      </View>
                    ) : null}
                  </View>
                  <MDText variant="bodySm">{address.fullName}</MDText>
                  <MDText variant="bodySm" tone="secondary">
                    {address.line1}
                    {address.line2 ? `, ${address.line2}` : ''}, {address.city}, {address.state} {address.postalCode}
                  </MDText>
                  <MDText variant="bodySm" tone="tertiary">
                    {address.phone}
                  </MDText>
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: spacing.lg, marginTop: spacing.md }}>
                <Pressable onPress={() => startEdit(address.id)}>
                  <MDText variant="caption" weight="600" style={{ color: colors.brand.primary }}>
                    Edit
                  </MDText>
                </Pressable>
                {!address.isDefault ? (
                  <Pressable onPress={() => setDefault(address.id)}>
                    <MDText variant="caption" weight="600" tone="secondary">
                      Set as Default
                    </MDText>
                  </Pressable>
                ) : null}
                <Pressable onPress={() => removeAddress(address.id)}>
                  <MDText variant="caption" weight="600" style={{ color: colors.status.error }}>
                    Delete
                  </MDText>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
