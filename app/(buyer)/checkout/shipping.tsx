import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { colors, radius, spacing, MDButton, MDText } from '@/design-system';
import { useCheckoutStore } from '@/state';
import { SHIPPING_METHODS } from '@/features/checkout';
import { CheckoutStepper } from '@/components/CheckoutStepper';
import { formatPrice } from '@/utils';
import type { ShippingMethodOption } from '@/types';

export default function CheckoutShipping() {
  const router = useRouter();
  const shippingAddress = useCheckoutStore((s) => s.shippingAddress);
  const shippingMethod = useCheckoutStore((s) => s.shippingMethod);
  const setShippingMethod = useCheckoutStore((s) => s.setShippingMethod);
  const [selected, setSelected] = useState<ShippingMethodOption | null>(shippingMethod ?? SHIPPING_METHODS[0]);

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
            <Pressable
              key={method.id}
              onPress={() => setSelected(method)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderWidth: 1.5,
                borderColor: isSelected ? colors.brand.primary : colors.border,
                backgroundColor: isSelected ? colors.brand.primarySoft : colors.surfaceRaised,
                borderRadius: radius.lg,
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
                <View>
                  <MDText variant="bodyMedium">{method.label}</MDText>
                  <MDText variant="bodySm" tone="secondary">
                    {method.description}
                  </MDText>
                </View>
              </View>
              <MDText variant="bodyMedium" weight="700">
                {method.cost === 0 ? 'Free' : formatPrice(method.cost, 'INR')}
              </MDText>
            </Pressable>
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
