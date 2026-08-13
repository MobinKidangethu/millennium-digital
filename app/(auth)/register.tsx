import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthScreenShell } from '@/components/AuthScreenShell';
import { GoogleAuthButton } from '@/components/GoogleAuthButton';
import { GoogleSignInSheet } from '@/components/GoogleSignInSheet';
import { colors, spacing, MDButton, MDInput, MDText } from '@/design-system';
import { useRegister } from '@/features/auth';

export default function Register() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [googleSheetVisible, setGoogleSheetVisible] = useState(false);
  const register = useRegister();

  const handleSubmit = () => {
    setFormError(null);
    if (!fullName.trim() || !email.trim() || !password) {
      setFormError('Please fill in your name, email, and password.');
      return;
    }
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }
    register.mutate(
      { fullName, email, password, company: company || undefined },
      { onSuccess: () => router.replace('/(buyer)') },
    );
  };

  const errorMessage = formError ?? (register.isError ? (register.error as Error).message : null);

  return (
    <AuthScreenShell
      title="Create your account"
      subtitle="Set up a Millennium Digital buyer account."
      showBack
      panel={{ character: require('../../assets/character-buyer.png') }}
    >
      <View style={{ gap: spacing.lg }}>
        <MDInput label="Full name" value={fullName} onChangeText={setFullName} placeholder="Jane Doe" />
        <MDInput
          label="Email address"
          value={email}
          onChangeText={setEmail}
          placeholder="you@company.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <MDInput
          label="Company (optional)"
          value={company}
          onChangeText={setCompany}
          placeholder="Your organization"
        />
        <MDInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="At least 6 characters"
          secureTextEntry
        />
        <MDInput
          label="Confirm password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Re-enter your password"
          secureTextEntry
          returnKeyType="go"
          onSubmitEditing={handleSubmit}
        />

        {errorMessage ? (
          <MDText variant="bodySm" style={{ color: colors.status.error }}>
            {errorMessage}
          </MDText>
        ) : null}

        <MDButton
          label="Create Account"
          size="lg"
          fullWidth
          loading={register.isPending}
          onPress={handleSubmit}
        />

        <View style={{ height: 1, backgroundColor: colors.border, marginVertical: spacing.xs }} />

        <GoogleAuthButton label="Sign up with Google" onPress={() => setGoogleSheetVisible(true)} />
      </View>

      <GoogleSignInSheet
        visible={googleSheetVisible}
        onClose={() => setGoogleSheetVisible(false)}
        onSuccess={() => router.replace('/(buyer)')}
      />

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          gap: spacing.xs,
          marginTop: spacing.xl,
        }}
      >
        <MDText variant="bodySm" tone="secondary">
          Already have an account?
        </MDText>
        <MDText
          variant="bodySm"
          weight="600"
          style={{ color: colors.brand.primary }}
          onPress={() => router.push('/(auth)/login')}
        >
          Log in
        </MDText>
      </View>
    </AuthScreenShell>
  );
}
