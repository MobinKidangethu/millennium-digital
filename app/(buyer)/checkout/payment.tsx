import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, MDButton, MDInput, MDText } from '@/design-system';
import { useCheckoutStore, useSavedCardsStore, type SavedCard } from '@/state';
import { useCartLines } from '@/features/cart';
import { GOVERNED_PRICING_MIN_QTY } from '@/features/pricing/service';
import {
  PAYMENT_METHOD_OPTIONS,
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
  type CardBrand,
} from '@/features/checkout';
import { CheckoutStepper } from '@/components/CheckoutStepper';
import { ProtoBadge } from '@/components/ProtoBadge';
import type { PaymentMethodType } from '@/types';

const BADGE_BRANDS: CardBrand[] = ['visa', 'mastercard', 'amex', 'discover'];
const BADGE_LABEL: Record<CardBrand, string> = {
  visa: 'VISA',
  mastercard: 'MC',
  amex: 'AMEX',
  discover: 'DISC',
  rupay: 'RuPay',
  unknown: 'CARD',
};

type FieldErrors = Partial<Record<'cardName' | 'cardNumber' | 'expiry' | 'cvv' | 'upiId', string>>;

export default function CheckoutPayment() {
  const router = useRouter();
  const shippingMethod = useCheckoutStore((s) => s.shippingMethod);
  const setPaymentMethod = useCheckoutStore((s) => s.setPaymentMethod);
  const savedCards = useSavedCardsStore((s) => s.cards);
  const addSavedCard = useSavedCardsStore((s) => s.addCard);
  const removeSavedCard = useSavedCardsStore((s) => s.removeCard);
  const { lines } = useCartLines();

  const bulkLines = lines.filter((l) => l.quantity >= GOVERNED_PRICING_MIN_QTY);
  const isBulkOrder = bulkLines.length > 0;

  const [type, setType] = useState<PaymentMethodType>('credit-card');

  useEffect(() => {
    if (isBulkOrder && type !== 'purchase-order') {
      setType('purchase-order');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBulkOrder]);

  // Saved-card selection
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [addingNewCard, setAddingNewCard] = useState(false);

  // New-card form
  const [cardName, setCardName] = useState('');
  const [cardNumberDigits, setCardNumberDigits] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [saveCard, setSaveCard] = useState(true);

  // UPI
  const [upiId, setUpiId] = useState('');
  const [upiVerified, setUpiVerified] = useState(false);
  const [verifyingUpi, setVerifyingUpi] = useState(false);

  // Net banking / PO
  const [bankName, setBankName] = useState('');
  const [poNumber, setPoNumber] = useState('');

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedCardId && !addingNewCard && savedCards.length > 0) {
      setSelectedCardId(savedCards[0].id);
    }
  }, [savedCards, selectedCardId, addingNewCard]);

  if (!shippingMethod) {
    return <Redirect href="/(buyer)/checkout/shipping" />;
  }

  const selectedOption = PAYMENT_METHOD_OPTIONS.find((o) => o.type === type)!;
  const isCardType = type === 'credit-card' || type === 'debit-card';
  const showNewCardForm = addingNewCard || savedCards.length === 0 || !selectedCardId;
  const detectedBrand = detectCardBrand(cardNumberDigits);

  const validateNewCard = (): boolean => {
    const errors: FieldErrors = {};
    if (!isValidCardholderName(cardName)) errors.cardName = 'Enter the name as it appears on the card.';
    if (!isValidCardNumber(cardNumberDigits)) errors.cardNumber = 'Enter a valid card number.';
    if (!isValidExpiry(expiry)) errors.expiry = 'Enter a valid, non-expired MM/YY.';
    if (!isValidCvv(cvv)) errors.cvv = 'CVV must be exactly 3 digits.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpiChange = (text: string) => {
    setUpiId(sanitizeUpiId(text));
    setUpiVerified(false);
  };

  const handleVerifyUpi = () => {
    if (!isValidUpiId(upiId)) {
      setFieldErrors({ upiId: 'Enter a valid UPI ID, e.g. name@bank.' });
      return;
    }
    setFieldErrors({});
    setVerifyingUpi(true);
    setTimeout(() => {
      setVerifyingUpi(false);
      setUpiVerified(true);
    }, 700);
  };

  const handleContinue = () => {
    setError(null);
    setFieldErrors({});

    if (isBulkOrder && type !== 'purchase-order') {
      setError('Orders with 100+ units per line require Purchase Order payment.');
      return;
    }

    let reference: string | undefined;

    if (isCardType) {
      if (!showNewCardForm && selectedCardId) {
        const card = savedCards.find((c) => c.id === selectedCardId);
        if (!card) {
          setError('Please select a saved card or add a new one.');
          return;
        }
        reference = `•••• ${card.last4}`;
      } else {
        if (!validateNewCard()) {
          setError('Please fix the highlighted card details.');
          return;
        }
        const last4 = cardNumberDigits.slice(-4);
        if (saveCard) {
          addSavedCard({ brand: detectedBrand, last4, expiry, cardholderName: cardName.trim() });
        }
        reference = `•••• ${last4}`;
      }
    } else if (type === 'upi') {
      if (!isValidUpiId(upiId)) {
        setFieldErrors({ upiId: 'Enter a valid UPI ID, e.g. name@bank.' });
        setError('Please enter a valid UPI ID.');
        return;
      }
      if (!upiVerified) {
        setError('Please verify your UPI ID before continuing.');
        return;
      }
      reference = upiId;
    } else if (type === 'net-banking') {
      if (!bankName.trim()) {
        setError('Please enter your bank name.');
        return;
      }
      reference = bankName.trim();
    } else if (type === 'purchase-order') {
      if (!poNumber.trim()) {
        setError('Please enter your purchase order number.');
        return;
      }
      reference = poNumber.trim();
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

      {isBulkOrder ? (
        <View
          style={{
            flexDirection: 'row',
            gap: spacing.xs,
            backgroundColor: colors.amber[50],
            borderWidth: 1,
            borderColor: colors.amber[500],
            borderRadius: radius.md,
            padding: spacing.sm,
            marginBottom: spacing.lg,
          }}
        >
          <Ionicons name="briefcase-outline" size={16} color={colors.amber[600]} style={{ marginTop: 1 }} />
          <MDText variant="caption" style={{ color: colors.amber[600], flex: 1 }}>
            Demo procurement policy: {bulkLines.length} line{bulkLines.length === 1 ? '' : 's'} in this order have
            100+ units (qualifying for governed volume pricing), so this order routes through Purchase Order
            payment only for commercial review.
          </MDText>
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl }}>
        {PAYMENT_METHOD_OPTIONS.map((option) => {
          const isSelected = type === option.type;
          const isLocked = isBulkOrder && option.type !== 'purchase-order';
          return (
            <Pressable
              key={option.type}
              onPress={() => {
                if (isLocked) return;
                setType(option.type);
              }}
              disabled={isLocked}
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
                opacity: isLocked ? 0.45 : 1,
              }}
            >
              <Ionicons
                name={isLocked ? 'lock-closed-outline' : (option.icon as keyof typeof Ionicons.glyphMap)}
                size={18}
                color={isSelected ? colors.brand.primary : colors.text.secondary}
              />
              <View>
                <MDText variant="bodySm" weight="600">
                  {option.label}
                </MDText>
                <MDText variant="caption" tone="tertiary">
                  {isLocked ? 'Requires PO for 100+ unit orders' : option.description}
                </MDText>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={{ gap: spacing.md, marginBottom: spacing.xl }}>
        {isCardType && (
          <>
            {savedCards.length > 0 ? (
              <View style={{ gap: spacing.sm }}>
                <MDText variant="bodySm" weight="700">
                  Saved Cards
                </MDText>
                {savedCards.map((card) => (
                  <SavedCardRow
                    key={card.id}
                    card={card}
                    selected={!addingNewCard && selectedCardId === card.id}
                    onSelect={() => {
                      setSelectedCardId(card.id);
                      setAddingNewCard(false);
                    }}
                    onRemove={() => {
                      removeSavedCard(card.id);
                      if (selectedCardId === card.id) setSelectedCardId(null);
                    }}
                  />
                ))}
                <Pressable
                  onPress={() => {
                    setAddingNewCard(true);
                    setSelectedCardId(null);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.sm,
                    borderWidth: 1.5,
                    borderStyle: 'dashed',
                    borderColor: addingNewCard ? colors.brand.primary : colors.borderStrong,
                    borderRadius: radius.md,
                    padding: spacing.md,
                  }}
                >
                  <Ionicons name="add-circle-outline" size={18} color={colors.brand.primary} />
                  <MDText variant="bodySm" weight="600" style={{ color: colors.brand.primary }}>
                    Add New Card
                  </MDText>
                </Pressable>
              </View>
            ) : null}

            {showNewCardForm ? (
              <View
                style={{
                  gap: spacing.md,
                  padding: spacing.lg,
                  borderRadius: radius.lg,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                    <Ionicons name="card-outline" size={16} color={colors.text.secondary} />
                    <MDText variant="bodyMedium" weight="700">
                      Card Details
                    </MDText>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    {BADGE_BRANDS.map((brand) => {
                      const active = detectedBrand === brand;
                      return (
                        <View
                          key={brand}
                          style={{
                            paddingHorizontal: 6,
                            paddingVertical: 3,
                            borderRadius: 4,
                            borderWidth: 1,
                            borderColor: active ? colors.brand.primary : colors.border,
                            backgroundColor: active ? colors.brand.primarySoft : colors.surfaceRaised,
                          }}
                        >
                          <MDText
                            variant="caption"
                            weight="700"
                            style={{ color: active ? colors.brand.primary : colors.text.tertiary }}
                          >
                            {BADGE_LABEL[brand]}
                          </MDText>
                        </View>
                      );
                    })}
                  </View>
                </View>

                <MDInput
                  label="Cardholder Name"
                  value={cardName}
                  onChangeText={(t) => setCardName(sanitizeCardholderName(t))}
                  placeholder="Name as it appears on the card"
                  autoCapitalize="words"
                  error={fieldErrors.cardName}
                />
                <MDInput
                  label="Card Number"
                  value={formatCardNumber(cardNumberDigits)}
                  onChangeText={(t) => setCardNumberDigits(sanitizeCardNumberDigits(t))}
                  placeholder="1234 5678 9012 3456"
                  keyboardType="numeric"
                  error={fieldErrors.cardNumber}
                  rightElement={
                    detectedBrand !== 'unknown' ? (
                      <MDText variant="caption" weight="700" tone="tertiary">
                        {CARD_BRAND_LABEL[detectedBrand]}
                      </MDText>
                    ) : undefined
                  }
                />
                <View style={{ flexDirection: 'row', gap: spacing.md }}>
                  <MDInput
                    label="Expiry (MM/YY)"
                    value={expiry}
                    onChangeText={(t) => setExpiry(formatExpiryInput(t))}
                    placeholder="MM/YY"
                    keyboardType="numeric"
                    style={{ flex: 1 }}
                    error={fieldErrors.expiry}
                  />
                  <MDInput
                    label="CVV"
                    value={cvv}
                    onChangeText={(t) => setCvv(sanitizeCvv(t))}
                    placeholder="123"
                    secureTextEntry
                    keyboardType="numeric"
                    style={{ flex: 1 }}
                    error={fieldErrors.cvv}
                  />
                </View>

                <Pressable
                  onPress={() => setSaveCard((v) => !v)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
                >
                  <View
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: radius.sm - 2,
                      borderWidth: 1.5,
                      borderColor: saveCard ? colors.brand.primary : colors.borderStrong,
                      backgroundColor: saveCard ? colors.brand.primary : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {saveCard ? <Ionicons name="checkmark" size={13} color={colors.gray[0]} /> : null}
                  </View>
                  <MDText variant="bodySm">Save this card for future orders</MDText>
                </Pressable>

                <ProtoBadge label="Prototype simulation — no live card gateway is connected; only brand, last 4 digits & expiry are stored" />
              </View>
            ) : null}
          </>
        )}

        {type === 'upi' && (
          <View style={{ gap: spacing.md }}>
            <MDInput
              label="UPI ID"
              value={upiId}
              onChangeText={handleUpiChange}
              placeholder="yourname@bank"
              autoCapitalize="none"
              error={fieldErrors.upiId}
              rightElement={
                upiVerified ? <Ionicons name="checkmark-circle" size={18} color={colors.status.success} /> : undefined
              }
            />
            <MDButton
              label={upiVerified ? 'Verified' : 'Verify UPI ID'}
              variant={upiVerified ? 'secondary' : 'outline'}
              size="sm"
              loading={verifyingUpi}
              disabled={upiVerified}
              onPress={handleVerifyUpi}
              style={{ alignSelf: 'flex-start' }}
            />
            <ProtoBadge label="Prototype simulation — UPI verification is not connected to a live UPI switch" />
          </View>
        )}

        {type === 'net-banking' && (
          <MDInput
            label="Bank Name"
            value={bankName}
            onChangeText={(t) => setBankName(sanitizeBankName(t))}
            placeholder="e.g. HDFC Bank"
          />
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

function SavedCardRow({
  card,
  selected,
  onSelect,
  onRemove,
}: {
  card: SavedCard;
  selected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  return (
    <Pressable
      onPress={onSelect}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        borderWidth: 1.5,
        borderColor: selected ? colors.brand.primary : colors.border,
        backgroundColor: selected ? colors.brand.primarySoft : colors.surfaceRaised,
        borderRadius: radius.md,
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
        }}
      >
        {selected ? <View style={{ width: 9, height: 9, borderRadius: radius.pill, backgroundColor: colors.brand.primary }} /> : null}
      </View>
      <Ionicons name="card-outline" size={18} color={colors.text.secondary} />
      <View style={{ flex: 1 }}>
        <MDText variant="bodySm" weight="600">
          {CARD_BRAND_LABEL[card.brand]} •••• {card.last4}
        </MDText>
        <MDText variant="caption" tone="tertiary">
          {card.cardholderName} · Expires {card.expiry}
        </MDText>
      </View>
      <Pressable accessibilityLabel="Remove saved card" onPress={onRemove} hitSlop={8}>
        <Ionicons name="trash-outline" size={16} color={colors.text.tertiary} />
      </Pressable>
    </Pressable>
  );
}
