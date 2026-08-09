import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthScreenShell } from '@/components/AuthScreenShell';
import { colors, spacing, MDButton, MDInput, MDText } from '@/design-system';
import { useAdminLogin, DEMO_ADMIN_CREDENTIALS } from '@/features/auth';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const adminLogin = useAdminLogin();

  const handleSubmit = () => {
    adminLogin.mutate(
      { email, password },
      { onSuccess: () => router.replace('/(admin)/dashboard') },
    );
  };

  return (
    <AuthScreenShell
      title="Seller / Admin Console"
      subtitle="Restricted access for authorized Millennium Digital staff and onboarded suppliers."
      panel={{
        tone: 'graphite',
        badge: 'ENTERPRISE',
        eyebrow: 'SELLER & OPERATIONS CONSOLE',
        headline: 'Run your business inside the marketplace.',
        description: 'Products, inventory, pricing, RFQs, orders, and Maker-Checker governance — in one console.',
        slides: [
          'Maker-Checker governed product publishing',
          'RFQ and quote management with pricing governance',
          'Order fulfillment, inventory, and analytics',
        ],
      }}
    >
      <View style={{ gap: spacing.lg }}>
        <MDInput
          label="Email address"
          value={email}
          onChangeText={setEmail}
          placeholder="admin@millenniumdigital.com"
          keyboardType="email-address"
          autoCapitalize="none"
          leftIcon={<Ionicons name="business-outline" size={16} color={colors.text.tertiary} />}
        />

        <MDInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
          returnKeyType="go"
          onSubmitEditing={handleSubmit}
        />

        {adminLogin.isError ? (
          <MDText variant="bodySm" style={{ color: colors.status.error }}>
            {(adminLogin.error as Error).message}
          </MDText>
        ) : null}

        <MDButton
          label="Sign In to Console"
          size="lg"
          fullWidth
          loading={adminLogin.isPending}
          onPress={handleSubmit}
        />

        <MDText variant="caption" tone="tertiary" align="center">
          Demo account: {DEMO_ADMIN_CREDENTIALS.email} / {DEMO_ADMIN_CREDENTIALS.password}
        </MDText>
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          gap: spacing.xs,
          marginTop: spacing.xl,
          flexWrap: 'wrap',
        }}
      >
        <MDText variant="bodySm" tone="secondary">
          New supplier?
        </MDText>
        <MDText
          variant="bodySm"
          weight="600"
          style={{ color: colors.brand.primary }}
          onPress={() => router.push('/(auth)/seller-register')}
        >
          Apply to sell on Millennium Digital
        </MDText>
      </View>

      <MDText
        variant="bodySm"
        weight="600"
        align="center"
        tone="tertiary"
        style={{ marginTop: spacing.lg }}
        onPress={() => router.replace('/(auth)/welcome')}
      >
        Back to buyer site
      </MDText>
    </AuthScreenShell>
  );
}
