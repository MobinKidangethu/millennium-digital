import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, MDButton, MDInput, MDSelectField, MDSelectModal, MDText } from '@/design-system';
import { useAddressStore, useCheckoutStore, useCurrencyStore } from '@/state';
import { CheckoutStepper } from '@/components/CheckoutStepper';
import { COUNTRIES, getCountryByName, isIndia } from '@/constants/countries';
import type { Address } from '@/types';

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
};

const COUNTRY_NAMES = COUNTRIES.map((c) => c.name);

export default function CheckoutAddress() {
  const router = useRouter();
  const addresses = useAddressStore((s) => s.addresses);
  const addAddress = useAddressStore((s) => s.addAddress);
  const setShippingAddress = useCheckoutStore((s) => s.setShippingAddress);
  const setBillingAddress = useCheckoutStore((s) => s.setBillingAddress);
  const billingSameAsShipping = useCheckoutStore((s) => s.billingSameAsShipping);
  const setBillingSameAsShipping = useCheckoutStore((s) => s.setBillingSameAsShipping);
  const setCurrency = useCurrencyStore((s) => s.setCurrency);

  const [selectedId, setSelectedId] = useState<string | null>(
    addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? null,
  );
  const [showForm, setShowForm] = useState(addresses.length === 0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [countryModalOpen, setCountryModalOpen] = useState(false);
  const [stateModalOpen, setStateModalOpen] = useState(false);

  const updateField = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const selectedCountryOption = getCountryByName(form.country);

  /**
   * Storefront display currency follows the shipping destination: an
   * international (non-India) address switches pricing to USD so the
   * buyer isn't reviewing an INR total against a foreign billing address;
   * an India address switches back to INR. This only changes the *display*
   * currency (see currencyStore) — it does not re-price anything.
   */
  const applyCurrencyForCountry = (country: string) => {
    setCurrency(isIndia(country) ? 'INR' : 'USD');
  };

  const handleCountryChange = (country: string) => {
    setForm((f) => ({ ...f, country, state: '' }));
  };

  const handleAddAddress = () => {
    if (!form.fullName || !form.line1 || !form.city || !form.state || !form.postalCode || !form.phone) {
      setError('Please fill in all required fields.');
      return;
    }
    const created = addAddress({ ...form, isDefault: addresses.length === 0 });
    setSelectedId(created.id);
    setShowForm(false);
    setForm(EMPTY_FORM);
    setError(null);
    applyCurrencyForCountry(created.country);
  };

  const handleContinue = () => {
    const selected = addresses.find((a) => a.id === selectedId);
    if (!selected) {
      setError('Please select or add a shipping address.');
      return;
    }
    applyCurrencyForCountry(selected.country);
    setShippingAddress(selected);
    setBillingAddress(billingSameAsShipping ? selected : null);
    router.push('/(buyer)/checkout/shipping');
  };

  return (
    <View>
      <CheckoutStepper current="address" />
      <MDText variant="h2" style={{ marginBottom: spacing.lg }}>
        Shipping Address
      </MDText>

      {addresses.length > 0 && !showForm ? (
        <View style={{ gap: spacing.md, marginBottom: spacing.lg }}>
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              selected={selectedId === address.id}
              onSelect={() => {
                setSelectedId(address.id);
                applyCurrencyForCountry(address.country);
              }}
            />
          ))}
          <MDButton
            label="Add New Address"
            variant="outline"
            onPress={() => setShowForm(true)}
            style={{ alignSelf: 'flex-start' }}
          />
        </View>
      ) : (
        <View style={{ gap: spacing.md, marginBottom: spacing.lg }}>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <MDInput label="Full Name" value={form.fullName} onChangeText={(v) => updateField('fullName', v)} style={{ flex: 1 }} />
            <MDInput label="Phone" value={form.phone} onChangeText={(v) => updateField('phone', v)} style={{ flex: 1 }} keyboardType="phone-pad" />
          </View>
          <MDInput label="Address Line 1" value={form.line1} onChangeText={(v) => updateField('line1', v)} />
          <MDInput label="Address Line 2 (optional)" value={form.line2} onChangeText={(v) => updateField('line2', v)} />

          <MDSelectField
            label="Country"
            value={form.country}
            placeholder="Select country"
            onPress={() => setCountryModalOpen(true)}
          />

          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <MDInput label="City" value={form.city} onChangeText={(v) => updateField('city', v)} style={{ flex: 1 }} />
            {selectedCountryOption?.states ? (
              <MDSelectField
                label="State / Province"
                value={form.state}
                placeholder="Select state"
                onPress={() => setStateModalOpen(true)}
                style={{ flex: 1 }}
              />
            ) : (
              <MDInput label="State / Province" value={form.state} onChangeText={(v) => updateField('state', v)} style={{ flex: 1 }} />
            )}
            <MDInput label="Postal Code" value={form.postalCode} onChangeText={(v) => updateField('postalCode', v)} style={{ flex: 1 }} keyboardType="numeric" />
          </View>

          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <MDButton label="Save Address" onPress={handleAddAddress} />
            {addresses.length > 0 ? (
              <MDButton label="Cancel" variant="ghost" onPress={() => setShowForm(false)} />
            ) : null}
          </View>
        </View>
      )}

      <Pressable
        onPress={() => setBillingSameAsShipping(!billingSameAsShipping)}
        style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xl }}
      >
        <View
          style={{
            width: 18,
            height: 18,
            borderRadius: radius.sm - 2,
            borderWidth: 1.5,
            borderColor: billingSameAsShipping ? colors.brand.primary : colors.borderStrong,
            backgroundColor: billingSameAsShipping ? colors.brand.primary : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {billingSameAsShipping ? <Ionicons name="checkmark" size={13} color={colors.gray[0]} /> : null}
        </View>
        <MDText variant="bodySm">Billing address is the same as shipping</MDText>
      </Pressable>

      {error ? (
        <MDText variant="bodySm" style={{ color: colors.status.error, marginBottom: spacing.md }}>
          {error}
        </MDText>
      ) : null}

      <MDButton label="Continue to Shipping" size="lg" fullWidth onPress={handleContinue} />

      <MDSelectModal
        visible={countryModalOpen}
        onClose={() => setCountryModalOpen(false)}
        title="Select Country"
        options={COUNTRY_NAMES}
        value={form.country}
        onChange={handleCountryChange}
        searchPlaceholder="Search countries…"
      />
      <MDSelectModal
        visible={stateModalOpen}
        onClose={() => setStateModalOpen(false)}
        title="Select State / Province"
        options={selectedCountryOption?.states ?? []}
        value={form.state}
        onChange={(v) => updateField('state', v)}
        searchPlaceholder="Search states…"
      />
    </View>
  );
}

function AddressCard({ address, selected, onSelect }: { address: Address; selected: boolean; onSelect: () => void }) {
  return (
    <Pressable
      onPress={onSelect}
      style={{
        flexDirection: 'row',
        gap: spacing.md,
        borderWidth: 1.5,
        borderColor: selected ? colors.brand.primary : colors.border,
        backgroundColor: selected ? colors.brand.primarySoft : colors.surfaceRaised,
        borderRadius: radius.lg,
        padding: spacing.md,
      }}
    >
      <View
        style={{
          width: 18,
          height: 18,
          borderRadius: radius.pill,
          borderWidth: 1.5,
          borderColor: selected ? colors.brand.primary : colors.borderStrong,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 2,
        }}
      >
        {selected ? <View style={{ width: 9, height: 9, borderRadius: radius.pill, backgroundColor: colors.brand.primary }} /> : null}
      </View>
      <View style={{ flex: 1 }}>
        <MDText variant="bodyMedium">
          {address.fullName} · {address.label}
        </MDText>
        <MDText variant="bodySm" tone="secondary">
          {address.line1}
          {address.line2 ? `, ${address.line2}` : ''}, {address.city}, {address.state} {address.postalCode}
        </MDText>
        <MDText variant="bodySm" tone="tertiary">
          {address.country}
          {address.phone ? ` · ${address.phone}` : ''}
        </MDText>
      </View>
    </Pressable>
  );
}
