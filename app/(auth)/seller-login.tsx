import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthScreenShell } from '@/components/AuthScreenShell';
import { colors, spacing, MDButton, MDInput, MDText } from '@/design-system';
import { useSellerLogin, DEMO_SELLER_CREDENTIALS } from '@/features/auth';

export default function SellerLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const sellerLogin = useSellerLogin();

  const handleSubmit = () => {
    sellerLogin.mutate(
      { email, password },
      { onSuccess: () => router.replace('/(seller)/dashboard') },
    );
  };

  return (
    <AuthScreenShell
      title="Seller Console"
      subtitle="Sign in to manage your brand's products, orders, RFQs, and revenue."
      panel={{
        tone: 'teal',
        character: require('../../assets/character-seller.png'),
        badge: 'SELLER',
        eyebrow: 'SUPPLIER CONSOLE',
        headline: 'Run your brand inside the marketplace.',
        description: 'List products, track RFQs and orders, and see your revenue — governed by Maker-Checker review before anything goes live.',
        slides: [
          'Add and manage your own product listings',
          'Maker-Checker governed publishing — you submit, Millennium Digital validates',
          'Track your brand’s orders, RFQs, and revenue',
        ],
      }}
    >
      <View style={{ gap: spacing.lg }}>
        <MDInput
          label="Email address"
          value={email}
          onChangeText={setEmail}
          placeholder="you@yourcompany.com"
          keyboardType="email-address"
          autoCapitalize="none"
          leftIcon={<Ionicons name="storefront-outline" size={16} color={colors.text.tertiary} />}
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

        {sellerLogin.isError ? (
          <MDText variant="bodySm" style={{ color: colors.status.error }}>
            {(sellerLogin.error as Error).message}
          </MDText>
        ) : null}

        <MDButton
          label="Sign In to Seller Console"
          size="lg"
          fullWidth
          loading={sellerLogin.isPending}
          onPress={handleSubmit}
        />

        <MDText variant="caption" tone="tertiary" align="center">
          Demo account: {DEMO_SELLER_CREDENTIALS.email} / {DEMO_SELLER_CREDENTIALS.password}
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
          Not registered yet?
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
        onPress={() => router.push('/(auth)/admin-login')}
      >
        Millennium Digital staff sign in
      </MDText>

      <MDText
        variant="bodySm"
        weight="600"
        align="center"
        tone="tertiary"
        style={{ marginTop: spacing.sm }}
        onPress={() => router.replace('/(auth)/welcome')}
      >
        Back to buyer site
      </MDText>
    </AuthScreenShell>
  );
}
