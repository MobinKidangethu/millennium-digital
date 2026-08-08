import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, MDText } from '@/design-system';

const STEPS = [
  { key: 'address', label: 'Address' },
  { key: 'shipping', label: 'Shipping' },
  { key: 'payment', label: 'Payment' },
  { key: 'review', label: 'Review' },
] as const;

interface CheckoutStepperProps {
  current: (typeof STEPS)[number]['key'];
}

export function CheckoutStepper({ current }: CheckoutStepperProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === current);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing['2xl'] }}>
      {STEPS.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;
        return (
          <View key={step.key} style={{ flexDirection: 'row', alignItems: 'center', flex: index < STEPS.length - 1 ? 1 : undefined }}>
            <View style={{ alignItems: 'center' }}>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: radius.pill,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: done || active ? colors.brand.primary : colors.gray[100],
                }}
              >
                {done ? (
                  <Ionicons name="checkmark" size={15} color={colors.gray[0]} />
                ) : (
                  <MDText variant="caption" weight="700" style={{ color: active ? colors.gray[0] : colors.text.tertiary }}>
                    {index + 1}
                  </MDText>
                )}
              </View>
              <MDText
                variant="caption"
                weight={active ? '700' : '400'}
                tone={active ? 'primary' : 'tertiary'}
                style={{ marginTop: 4 }}
              >
                {step.label}
              </MDText>
            </View>
            {index < STEPS.length - 1 ? (
              <View
                style={{
                  flex: 1,
                  height: 2,
                  backgroundColor: done ? colors.brand.primary : colors.gray[100],
                  marginHorizontal: spacing.sm,
                  marginBottom: 16,
                }}
              />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
