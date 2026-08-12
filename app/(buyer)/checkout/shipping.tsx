import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { colors, radius, spacing, MDButton, MDText } from '@/design-system';
import { useCheckoutStore, useCurrencyStore } from '@/state';
import { SHIPPING_METHODS, SHIPPING_METHOD_DETAILS } from '@/features/checkout';
import { CheckoutStepper } from '@/components/CheckoutStepper';
import { formatDisplayPrice } from '@/utils';
import type { ShippingMethodOption } from '@/types';

export default function CheckoutShipping() {
  const router = useRouter();
  const shippingAddress = useCheckoutStore((s) => s.shippingAddress);
  const shippingMethod = useCheckoutStore((s) => s.shippingMethod);
  const setShippingMethod = useCheckoutStore((s) => s.setShippingMethod);
  const [selected, setSelected] = useState<ShippingMethodOption | null>(shippingMethod ?? SHIPPING_METHODS[0]);
  const displayCurrency = useCurrencyStore((s) => s.currency);

  if (!shippingAddress) {
    return <Redirect href="/(buyer)/checkout/address" />;
  }

  const handleContinue = () => {
    if (!selected) return;
    setShippingMethod(selected);
    router.push('/(buyer)/checkout/payment');
  };

  return (
    <View>
      <CheckoutStepper current="shipping" />
      <MDText variant="h2" style={{ marginBottom: spacing.lg }}>
        Shipping Method
      </MDText>

      <View style={{ gap: spacing.md, marginBottom: spacing.xl }}>
        {SHIPPING_METHODS.map((method) => {
          const isSelected = selected?.id === method.id;
          return (
            <View
              key={method.id}
              style={{
                borderWidth: 1.5,
                borderColor: isSelected ? colors.brand.primary : colors.border,
                borderRadius: radius.lg,
                overflow: 'hidden',
              }}
            >
              <Pressable
                onPress={() => setSelected(method)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: isSelected ? colors.brand.primarySoft : colors.surfaceRaised,
                  padding: spacing.lg,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 }}>
                  <View
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: radius.pill,
                      borderWidth: 1.5,
                      borderColor: isSelected ? colors.brand.primary : colors.borderStrong,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isSelected ? (
                      <View style={{ width: 9, height: 9, borderRadius: radius.pill, backgroundColor: colors.brand.primary }} />
                    ) : null}
                  </View>
                  <MDText variant="bodyMedium" weight="700">
                    {method.label}
                  </MDText>
                </View>
                <MDText
                  variant="bodyMedium"
                  weight="700"
                  style={{ color: method.cost === 0 ? colors.status.success : colors.text.primary }}
                >
                  {method.cost === 0 ? 'FREE' : formatDisplayPrice(method.cost, 'INR', displayCurrency)}
                </MDText>
              </Pressable>

              {isSelected ? (
                <View
                  style={{
                    backgroundColor: colors.surface,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    padding: spacing.lg,
                    gap: spacing.md,
                  }}
                >
                  {(() => {
                    const detail = SHIPPING_METHOD_DETAILS[method.id];
                    if (!detail) return null;
                    return (
                      <>
                        <View
                          style={{
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            gap: 4,
                            paddingBottom: spacing.md,
                            borderBottomWidth: 1,
                            borderBottomColor: colors.border,
                          }}
                        >
                          <MDText variant="bodySm" tone="secondary">
                            {detail.incotermsNote}
                          </MDText>
                        </View>

                        <View style={{ gap: 4 }}>
                          <MDText variant="bodyMedium" weight="700">
                            {detail.headline}
                          </MDText>
                          <MDText variant="bodySm" tone="secondary">
                            {detail.body}
                          </MDText>
                        </View>

                        <View
                          style={{
                            backgroundColor: colors.surfaceRaised,
                            borderWidth: 1,
                            borderColor: colors.border,
                            borderRadius: radius.md,
                            padding: spacing.md,
                            gap: 2,
                          }}
                        >
                          <MDText variant="bodySm" weight="700">
                            {detail.carrierName}
                          </MDText>
                          <MDText variant="caption" tone="secondary">
                            {detail.carrierNote}
                          </MDText>
                        </View>
                      </>
                    );
                  })()}
                </View>
              ) : null}
            </View>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <MDButton label="Back" variant="outline" onPress={() => router.back()} />
        <MDButton label="Continue to Payment" size="lg" onPress={handleContinue} style={{ flex: 1 }} />
      </View>
    </View>
  );
}
