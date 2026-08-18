import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, useToast, MDButton, MDEmptyState, MDInput, MDText } from '@/design-system';
import { useRfq, usePlaceRfqOrder } from '@/features/rfq';
import { rfqStageIndex } from '@/constants/rfqLifecycle';
import {
  PAYMENT_METHOD_OPTIONS,
  SHIPPING_METHODS,
  CARD_BRAND_LABEL,
  sanitizeCardholderName,
  isValidCardholderName,
  sanitizeCardNumberDigits,
  formatCardNumber,
  detectCardBrand,
  isValidCardNumber,
  formatExpiryInput,
  isValidExpiry,
  sanitizeCvv,
  isValidCvv,
  sanitizeUpiId,
  isValidUpiId,
  sanitizeBankName,
} from '@/features/checkout';
import { RfqOrderSummary } from '@/components/RfqOrderSummary';
import { ProtoBadge } from '@/components/ProtoBadge';
import { useAddressStore, useAuthStore, useCurrencyStore, useRfqCheckoutStore } from '@/state';
import { formatDisplayPrice } from '@/utils';
import type { Address, PaymentMethodType } from '@/types';

const EMPTY_FORM = { label: 'Office', fullName: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: 'India', phone: '' };

/**
 * The RFQ's own consolidated checkout — one screen instead of the normal
 * checkout's 4-step wizard (app/(buyer)/checkout/*), reusing the same
 * address store, shipping options, payment options, and card validators,
 * but writing into useRfqCheckoutStore and never touching useCheckoutStore/
 * useCartStore. Placing the order calls rfqService.placeRfqOrder, which
 * advances the RFQ straight to 'processing' — it does not create a row in
 * normal Order History (see RFQ_STAGES in src/constants/rfqLifecycle.ts).
 */
export default function RfqCheckout() {
  const router = useRouter();
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const session = useAuthStore((s) => s.session);
  const { data: rfq, isLoading } = useRfq(id);
  const placeOrder = usePlaceRfqOrder();
  const displayCurrency = useCurrencyStore((s) => s.currency);

  const addresses = useAddressStore((s) => s.addresses);
  const addAddress = useAddressStore((s) => s.addAddress);
  const shippingAddress = useRfqCheckoutStore((s) => s.shippingAddress);
  const setShippingAddress = useRfqCheckoutStore((s) => s.setShippingAddress);
  const shippingMethod = useRfqCheckoutStore((s) => s.shippingMethod);
  const setShippingMethod = useRfqCheckoutStore((s) => s.setShippingMethod);
  const resetRfqCheckout = useRfqCheckoutStore((s) => s.reset);

  const [showAddressForm, setShowAddressForm] = useState(addresses.length === 0);
  const [form, setForm] = useState(EMPTY_FORM);

  const [paymentType, setPaymentType] = useState<PaymentMethodType>('credit-card');
  const [cardName, setCardName] = useState('');
  const [cardNumberDigits, setCardNumberDigits] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [upiVerified, setUpiVerified] = useState(false);
  const [verifyingUpi, setVerifyingUpi] = useState(false);
  const [bankName, setBankName] = useState('');
  const [poNumber, setPoNumber] = useState('');

  const [error, setError] = useState<string | null>(null);

  if (!hasHydrated || isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.brand.primary} />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  const ready = !!rfq && rfqStageIndex(rfq.status) >= rfqStageIndex('shipment_approved');

  if (!rfq || !ready) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <MDEmptyState
          icon={<Ionicons name="receipt-outline" size={40} color={colors.text.tertiary} />}
          title={rfq ? 'This RFQ isn’t ready for checkout yet' : 'RFQ not found'}
          actionLabel="View RFQ Order Status"
          onAction={() => (rfq ? router.push({ pathname: '/(buyer)/account/rfq-status/[id]', params: { id: rfq.id } }) : router.push('/(buyer)/account/rfq-status'))}
        />
      </View>
    );
  }

  const updateField = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleAddAddress = () => {
    if (!form.fullName || !form.line1 || !form.city || !form.state || !form.postalCode || !form.phone) {
      setError('Please fill in all required address fields.');
      return;
    }
    const created = addAddress({ ...form, isDefault: addresses.length === 0 });
    setShippingAddress(created);
    setShowAddressForm(false);
    setForm(EMPTY_FORM);
    setError(null);
  };

  const detectedBrand = detectCardBrand(cardNumberDigits);
  const selectedPaymentOption = PAYMENT_METHOD_OPTIONS.find((o) => o.type === paymentType)!;

  const handlePlaceOrder = () => {
    setError(null);
    if (!shippingAddress) {
      setError('Please select or add a shipping address.');
      return;
    }
    if (!shippingMethod) {
      setError('Please select a shipping method.');
      return;
    }

    let reference: string | undefined;
    if (paymentType === 'credit-card' || paymentType === 'debit-card') {
      if (!isValidCardholderName(cardName) || !isValidCardNumber(cardNumberDigits) || !isValidExpiry(expiry) || !isValidCvv(cvv)) {
        setError('Please enter valid card details.');
        return;
      }
      reference = `•••• ${cardNumberDigits.slice(-4)}`;
    } else if (paymentType === 'upi') {
      if (!isValidUpiId(upiId) || !upiVerified) {
        setError('Please enter and verify a valid UPI ID.');
        return;
      }
      reference = upiId;
    } else if (paymentType === 'net-banking') {
      if (!bankName.trim()) {
        setError('Please enter your bank name.');
        return;
      }
      reference = bankName.trim();
    } else if (paymentType === 'purchase-order') {
      if (!poNumber.trim()) {
        setError('Please enter your purchase order number.');
        return;
      }
      reference = poNumber.trim();
    }

    placeOrder.mutate(
      {
        id: rfq.id,
        input: {
          shippingAddress,
          billingAddress: shippingAddress,
          shippingMethod,
          paymentMethod: { type: paymentType, label: selectedPaymentOption.label, reference },
        },
      },
      {
        onSuccess: () => {
          resetRfqCheckout();
          toast.show('RFQ order placed — now processing.', 'success');
          router.push({ pathname: '/(buyer)/account/rfq-status/[id]', params: { id: rfq.id } });
        },
        onError: () => toast.show('Could not place the RFQ order. Please try again.', 'error'),
      },
    );
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ maxWidth: 640, width: '100%', alignSelf: 'center', padding: spacing.xl }}>
        <MDText variant="h1" style={{ marginBottom: spacing.xs }}>
          RFQ Checkout
        </MDText>
        <View style={{ marginBottom: spacing.lg }}>
          <ProtoBadge label="Separate from the normal checkout — no live payment gateway is connected" />
        </View>

        <RfqOrderSummary rfq={rfq} />

        <MDText variant="h4" style={{ marginBottom: spacing.md }}>
          Shipping Address
        </MDText>
        {addresses.length > 0 && !showAddressForm ? (
          <View style={{ gap: spacing.sm, marginBottom: spacing.xl }}>
            {addresses.map((address) => (
              <AddressCard key={address.id} address={address} selected={shippingAddress?.id === address.id} onSelect={() => setShippingAddress(address)} />
            ))}
            <MDButton label="Add New Address" variant="outline" size="sm" onPress={() => setShowAddressForm(true)} style={{ alignSelf: 'flex-start' }} />
          </View>
        ) : (
          <View style={{ gap: spacing.md, marginBottom: spacing.xl }}>
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <MDInput label="Full Name" value={form.fullName} onChangeText={(v) => updateField('fullName', v)} style={{ flex: 1 }} />
              <MDInput label="Phone" value={form.phone} onChangeText={(v) => updateField('phone', v)} style={{ flex: 1 }} keyboardType="phone-pad" />
            </View>
            <MDInput label="Address Line 1" value={form.line1} onChangeText={(v) => updateField('line1', v)} />
            <MDInput label="Address Line 2 (optional)" value={form.line2} onChangeText={(v) => updateField('line2', v)} />
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <MDInput label="City" value={form.city} onChangeText={(v) => updateField('city', v)} style={{ flex: 1 }} />
              <MDInput label="State" value={form.state} onChangeText={(v) => updateField('state', v)} style={{ flex: 1 }} />
              <MDInput label="Postal Code" value={form.postalCode} onChangeText={(v) => updateField('postalCode', v)} style={{ flex: 1 }} keyboardType="numeric" />
            </View>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <MDButton label="Save Address" size="sm" onPress={handleAddAddress} />
              {addresses.length > 0 ? <MDButton label="Cancel" variant="ghost" size="sm" onPress={() => setShowAddressForm(false)} /> : null}
            </View>
          </View>
        )}

        <MDText variant="h4" style={{ marginBottom: spacing.md }}>
          Shipping Method
        </MDText>
        <View style={{ gap: spacing.sm, marginBottom: spacing.xl }}>
          {SHIPPING_METHODS.map((method) => {
            const selected = shippingMethod?.id === method.id;
            return (
              <Pressable
                key={method.id}
                onPress={() => setShippingMethod(method)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.md,
                  padding: spacing.md,
                  borderRadius: radius.md,
                  borderWidth: 1.5,
                  borderColor: selected ? colors.brand.primary : colors.border,
                  backgroundColor: selected ? colors.brand.primarySoft : colors.surfaceRaised,
                }}
              >
                <Ionicons name={selected ? 'radio-button-on' : 'radio-button-off'} size={18} color={selected ? colors.brand.primary : colors.text.tertiary} />
                <View style={{ flex: 1 }}>
                  <MDText variant="bodySm" weight="600">{method.label}</MDText>
                  <MDText variant="caption" tone="tertiary">{method.description}</MDText>
                </View>
                <MDText variant="bodySm" weight="700">{method.cost === 0 ? 'Free' : formatDisplayPrice(method.cost, 'INR', displayCurrency)}</MDText>
              </Pressable>
            );
          })}
        </View>

        <MDText variant="h4" style={{ marginBottom: spacing.md }}>
          Payment Method
        </MDText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg }}>
          {PAYMENT_METHOD_OPTIONS.map((option) => {
            const selected = paymentType === option.type;
            return (
              <Pressable
                key={option.type}
                onPress={() => setPaymentType(option.type)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.sm,
                  borderWidth: 1.5,
                  borderColor: selected ? colors.brand.primary : colors.border,
                  backgroundColor: selected ? colors.brand.primarySoft : colors.surfaceRaised,
                  borderRadius: radius.md,
                  paddingVertical: spacing.sm,
                  paddingHorizontal: spacing.md,
                  minWidth: '47%',
                }}
              >
                <Ionicons name={option.icon as keyof typeof Ionicons.glyphMap} size={18} color={selected ? colors.brand.primary : colors.text.secondary} />
                <View>
                  <MDText variant="bodySm" weight="600">{option.label}</MDText>
                  <MDText variant="caption" tone="tertiary">{option.description}</MDText>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={{ gap: spacing.md, marginBottom: spacing.xl }}>
          {(paymentType === 'credit-card' || paymentType === 'debit-card') ? (
            <View style={{ gap: spacing.md, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }}>
              <MDInput label="Cardholder Name" value={cardName} onChangeText={(t) => setCardName(sanitizeCardholderName(t))} placeholder="Name as it appears on the card" autoCapitalize="words" />
              <MDInput
                label="Card Number"
                value={formatCardNumber(cardNumberDigits)}
                onChangeText={(t) => setCardNumberDigits(sanitizeCardNumberDigits(t))}
                placeholder="1234 5678 9012 3456"
                keyboardType="numeric"
                rightElement={detectedBrand !== 'unknown' ? <MDText variant="caption" weight="700" tone="tertiary">{CARD_BRAND_LABEL[detectedBrand]}</MDText> : undefined}
              />
              <View style={{ flexDirection: 'row', gap: spacing.md }}>
                <MDInput label="Expiry (MM/YY)" value={expiry} onChangeText={(t) => setExpiry(formatExpiryInput(t))} placeholder="MM/YY" keyboardType="numeric" style={{ flex: 1 }} />
                <MDInput label="CVV" value={cvv} onChangeText={(t) => setCvv(sanitizeCvv(t))} placeholder="123" secureTextEntry keyboardType="numeric" style={{ flex: 1 }} />
              </View>
              <ProtoBadge label="Prototype simulation — no live card gateway is connected" />
            </View>
          ) : null}

          {paymentType === 'upi' ? (
            <View style={{ gap: spacing.md }}>
              <MDInput
                label="UPI ID"
                value={upiId}
                onChangeText={(t) => {
                  setUpiId(sanitizeUpiId(t));
                  setUpiVerified(false);
                }}
                placeholder="yourname@bank"
                autoCapitalize="none"
                rightElement={upiVerified ? <Ionicons name="checkmark-circle" size={18} color={colors.status.success} /> : undefined}
              />
              <MDButton
                label={upiVerified ? 'Verified' : 'Verify UPI ID'}
                variant={upiVerified ? 'secondary' : 'outline'}
                size="sm"
                loading={verifyingUpi}
                disabled={upiVerified}
                onPress={() => {
                  if (!isValidUpiId(upiId)) return;
                  setVerifyingUpi(true);
                  setTimeout(() => {
                    setVerifyingUpi(false);
                    setUpiVerified(true);
                  }, 700);
                }}
                style={{ alignSelf: 'flex-start' }}
              />
            </View>
          ) : null}

          {paymentType === 'net-banking' ? (
            <MDInput label="Bank Name" value={bankName} onChangeText={(t) => setBankName(sanitizeBankName(t))} placeholder="e.g. HDFC Bank" />
          ) : null}
          {paymentType === 'purchase-order' ? (
            <MDInput label="Purchase Order Number" value={poNumber} onChangeText={setPoNumber} placeholder="PO-2026-0001" />
          ) : null}
        </View>

        {error ? (
          <MDText variant="bodySm" style={{ color: colors.status.error, marginBottom: spacing.md }}>
            {error}
          </MDText>
        ) : null}

        <MDButton label="Place RFQ Order" size="lg" fullWidth loading={placeOrder.isPending} onPress={handlePlaceOrder} />
      </View>
    </ScrollView>
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
