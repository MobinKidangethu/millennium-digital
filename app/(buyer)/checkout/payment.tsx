import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, MDButton, MDInput, MDText } from '@/design-system';
import { useCheckoutStore } from '@/state';
import { PAYMENT_METHOD_OPTIONS } from '@/features/checkout';
import { CheckoutStepper } from '@/components/CheckoutStepper';
import type { PaymentMethodType } from '@/types';

export default function CheckoutPayment() {
  const router = useRouter();
  const shippingMethod = useCheckoutStore((s) => s.shippingMethod);
  const setPaymentMethod = useCheckoutStore((s) => s.setPaymentMethod);

  const [type, setType] = useState<PaymentMethodType>('credit-card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [bankName, setBankName] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!shippingMethod) {
    return <Redirect href="/(buyer)/checkout/shipping" />;
  }

  const selectedOption = PAYMENT_METHOD_OPTIONS.find((o) => o.type === type)!;

  const handleContinue = () => {
    setError(null);
    let reference: string | undefined;

    if (type === 'credit-card' || type === 'debit-card') {
      if (cardNumber.replace(/\s/g, '').length < 12 || !cardName || !expiry || !cvv) {
        setError('Please complete all card details.');
        return;
      }
      reference = `•••• ${cardNumber.replace(/\s/g, '').slice(-4)}`;
    } else if (type === 'upi') {
      if (!upiId.includes('@')) {
        setError('Please enter a valid UPI ID.');
        return;
      }
      reference = upiId;
    } else if (type === 'net-banking') {
      if (!bankName) {
        setError('Please enter your bank name.');
        return;
      }
      reference = bankName;
    } else if (type === 'purchase-order') {
      if (!poNumber) {
        setError('Please enter your purchase order number.');
        return;
      }
      reference = poNumber;
    }

    setPaymentMethod({ type, label: selectedOption.label, reference });
    router.push('/(buyer)/checkout/review');
  };

  return (
    <View>
      <CheckoutStepper current="payment" />
      <MDText variant="h2" style={{ marginBottom: spacing.lg }}>
        Payment Method
      </MDText>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl }}>
        {PAYMENT_METHOD_OPTIONS.map((option) => {
          const isSelected = type === option.type;
          return (
            <Pressable
              key={option.type}
              onPress={() => setType(option.type)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.sm,
                borderWidth: 1.5,
                borderColor: isSelected ? colors.brand.primary : colors.border,
                backgroundColor: isSelected ? colors.brand.primarySoft : colors.surfaceRaised,
                borderRadius: radius.md,
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.md,
                minWidth: '47%',
              }}
            >
              <Ionicons
                name={option.icon as keyof typeof Ionicons.glyphMap}
                size={18}
                color={isSelected ? colors.brand.primary : colors.text.secondary}
              />
              <View>
                <MDText variant="bodySm" weight="600">
                  {option.label}
                </MDText>
                <MDText variant="caption" tone="tertiary">
                  {option.description}
                </MDText>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={{ gap: spacing.md, marginBottom: spacing.xl }}>
        {(type === 'credit-card' || type === 'debit-card') && (
          <>
            <MDInput label="Name on Card" value={cardName} onChangeText={setCardName} />
            <MDInput
              label="Card Number"
              value={cardNumber}
              onChangeText={setCardNumber}
              placeholder="1234 5678 9012 3456"
              keyboardType="numeric"
            />
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <MDInput label="Expiry (MM/YY)" value={expiry} onChangeText={setExpiry} style={{ flex: 1 }} />
              <MDInput label="CVV" value={cvv} onChangeText={setCvv} secureTextEntry keyboardType="numeric" style={{ flex: 1 }} />
            </View>
          </>
        )}
        {type === 'upi' && (
          <MDInput label="UPI ID" value={upiId} onChangeText={setUpiId} placeholder="yourname@bank" autoCapitalize="none" />
        )}
        {type === 'net-banking' && <MDInput label="Bank Name" value={bankName} onChangeText={setBankName} />}
        {type === 'wallet' && (
          <MDText variant="bodySm" tone="secondary">
            Your wallet balance will be used to complete this purchase.
          </MDText>
        )}
        {type === 'purchase-order' && (
          <MDInput label="Purchase Order Number" value={poNumber} onChangeText={setPoNumber} placeholder="PO-2026-0001" />
        )}
      </View>

      {error ? (
        <MDText variant="bodySm" style={{ color: colors.status.error, marginBottom: spacing.md }}>
          {error}
        </MDText>
      ) : null}

      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <MDButton label="Back" variant="outline" onPress={() => router.back()} />
        <MDButton label="Review Order" size="lg" onPress={handleContinue} style={{ flex: 1 }} />
      </View>
    </View>
  );
}
