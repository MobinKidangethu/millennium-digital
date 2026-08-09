import { useState, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthScreenShell } from '@/components/AuthScreenShell';
import { colors, radius, spacing, useToast, MDBadge, MDButton, MDInput, MDText } from '@/design-system';
import { useCategories } from '@/features/categories';
import { sellerOnboardingService } from '@/features/sellerOnboarding';
import { ProtoBadge } from '@/components/ProtoBadge';
import type { SellerApplication, SellerBusinessType } from '@/types';

const BUSINESS_TYPES: SellerBusinessType[] = ['Manufacturer', 'Authorized Distributor', 'Trading Company', 'Other'];

const STATUS_STAGES: { key: SellerApplication['status']; label: string }[] = [
  { key: 'submitted', label: 'Application Submitted' },
  { key: 'verification', label: 'KYB / GST Verification' },
  { key: 'catalogue_setup', label: 'Catalogue Setup' },
  { key: 'console_access', label: 'Console Access Granted' },
];

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <View style={{ marginBottom: spacing.lg }}>
      <MDText variant="bodySm" weight="600" style={{ marginBottom: spacing.xs }}>
        {label}
        {required ? <MDText style={{ color: colors.status.error }}> *</MDText> : null}
      </MDText>
      {children}
    </View>
  );
}

export default function SellerRegister() {
  const router = useRouter();
  const toast = useToast();
  const { data: categories } = useCategories();

  const [companyName, setCompanyName] = useState('');
  const [businessType, setBusinessType] = useState<SellerBusinessType | null>(null);
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [monthlyVolume, setMonthlyVolume] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  const [agreed, setAgreed] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<SellerApplication | null>(null);

  const toggleCategory = (name: string) => {
    setSelectedCategories((prev) => (prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]));
  };

  const handleSubmit = async () => {
    setFormError(null);
    if (!companyName.trim() || !businessType || !registrationNumber.trim() || !contactName.trim() || !email.trim() || !phone.trim()) {
      setFormError('Please fill in all required business and contact details.');
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
    if (!city.trim() || !state.trim() || !country.trim()) {
      setFormError('Please provide your business city, state, and country.');
      return;
    }
    if (!agreed) {
      setFormError('Please agree to the Millennium Digital Supplier Terms to continue.');
      return;
    }

    setSubmitting(true);
    try {
      const application = await sellerOnboardingService.submitSellerApplication({
        companyName,
        businessType,
        registrationNumber,
        contactName,
        email,
        phone,
        categories: selectedCategories,
        monthlyVolume: monthlyVolume || undefined,
        city,
        state,
        country,
      });
      setSubmitted(application);
    } finally {
      setSubmitting(false);
    }
  };

  const sellerPanel = {
    tone: 'graphite' as const,
    eyebrow: 'SUPPLIER NETWORK',
    headline: 'Reach engineers actively sourcing.',
    description: 'List genuine components where procurement teams and engineers already search by part, spec, and AI-assisted requirement.',
    slides: [
      'Structured RFQs with full technical context',
      'Maker-Checker governed publishing',
      'Analytics on RFQs, orders, and fulfillment',
    ],
  };

  if (submitted) {
    return (
      <AuthScreenShell title="Application Submitted" panel={sellerPanel}>
        <View style={{ alignItems: 'flex-start', width: '100%' }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: radius.pill,
              backgroundColor: colors.status.successSoft,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing.lg,
            }}
          >
            <Ionicons name="checkmark" size={28} color={colors.status.successStrong} />
          </View>
          <MDText variant="body" tone="secondary" style={{ marginBottom: spacing.xl }}>
            Reference <MDText weight="700">{submitted.referenceNumber}</MDText> — our partnerships team will
            verify {submitted.companyName} and follow up at {submitted.email}.
          </MDText>

          <View style={{ width: '100%', marginBottom: spacing.xl }}>
            {STATUS_STAGES.map((stage, index) => (
              <View key={stage.key} style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md }}>
                <View style={{ alignItems: 'center' }}>
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: radius.pill,
                      backgroundColor: index === 0 ? colors.brand.primary : colors.gray[100],
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {index === 0 ? <Ionicons name="checkmark" size={12} color={colors.gray[0]} /> : null}
                  </View>
                  {index < STATUS_STAGES.length - 1 ? (
                    <View style={{ width: 2, flex: 1, backgroundColor: colors.border, minHeight: 16 }} />
                  ) : null}
                </View>
                <MDText variant="bodySm" weight={index === 0 ? '700' : '400'} tone={index === 0 ? 'primary' : 'tertiary'}>
                  {stage.label}
                </MDText>
              </View>
            ))}
          </View>

          <ProtoBadge label="Seller onboarding — prototype simulation; production routes through KYB/GST verification" />

          <View style={{ flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap', marginTop: spacing.xl }}>
            <MDButton label="Go to Seller Console" onPress={() => router.push('/(auth)/admin-login')} />
            <MDButton label="Back to Home" variant="outline" onPress={() => router.push('/(buyer)')} />
          </View>
        </View>
      </AuthScreenShell>
    );
  }

  return (
    <AuthScreenShell
      title="Join as a Seller"
      subtitle="Register your business to list components on Millennium Digital."
      showBack
      panel={sellerPanel}
    >
      <View>
        <Field label="Company / Legal Business Name" required>
          <MDInput value={companyName} onChangeText={setCompanyName} placeholder="Your registered business name" />
        </Field>

        <Field label="Business Type" required>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {BUSINESS_TYPES.map((type) => (
              <Pressable
                key={type}
                onPress={() => setBusinessType(type)}
                style={{
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderRadius: radius.pill,
                  borderWidth: 1,
                  borderColor: businessType === type ? colors.brand.primary : colors.border,
                  backgroundColor: businessType === type ? colors.brand.primarySoft : colors.surface,
                }}
              >
                <MDText variant="bodySm" weight={businessType === type ? '700' : '400'} style={{ color: businessType === type ? colors.brand.primary : colors.text.secondary }}>
                  {type}
                </MDText>
              </Pressable>
            ))}
          </View>
        </Field>

        <Field label="GST / Business Registration Number" required>
          <MDInput value={registrationNumber} onChangeText={setRegistrationNumber} placeholder="e.g. 24AAAAA0000A1Z5" autoCapitalize="characters" />
        </Field>

        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <View style={{ flex: 1 }}>
            <Field label="Contact Person" required>
              <MDInput value={contactName} onChangeText={setContactName} placeholder="Full name" />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Phone Number" required>
              <MDInput value={phone} onChangeText={setPhone} placeholder="+91 98765 43210" keyboardType="phone-pad" />
            </Field>
          </View>
        </View>

        <Field label="Work Email" required>
          <MDInput value={email} onChangeText={setEmail} placeholder="you@company.com" keyboardType="email-address" autoCapitalize="none" />
        </Field>

        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <View style={{ flex: 1 }}>
            <Field label="Password" required>
              <MDInput value={password} onChangeText={setPassword} placeholder="At least 6 characters" secureTextEntry />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Confirm Password" required>
              <MDInput value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Re-enter password" secureTextEntry />
            </Field>
          </View>
        </View>

        <Field label="Product Categories You Supply">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {(categories ?? []).map((category) => {
              const selected = selectedCategories.includes(category.name);
              return (
                <Pressable
                  key={category.slug}
                  onPress={() => toggleCategory(category.name)}
                  style={{
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.xs,
                    borderRadius: radius.pill,
                    borderWidth: 1,
                    borderColor: selected ? colors.brand.primary : colors.border,
                    backgroundColor: selected ? colors.brand.primarySoft : colors.surface,
                  }}
                >
                  <MDText variant="caption" weight={selected ? '700' : '400'} style={{ color: selected ? colors.brand.primary : colors.text.secondary }}>
                    {category.name}
                  </MDText>
                </Pressable>
              );
            })}
          </View>
        </Field>

        <Field label="Estimated Monthly Order Volume">
          <MDInput value={monthlyVolume} onChangeText={setMonthlyVolume} placeholder="e.g. 5,000–10,000 units / month" />
        </Field>

        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <View style={{ flex: 1 }}>
            <Field label="City" required>
              <MDInput value={city} onChangeText={setCity} placeholder="City" />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="State" required>
              <MDInput value={state} onChangeText={setState} placeholder="State" />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Country" required>
              <MDInput value={country} onChangeText={setCountry} placeholder="Country" />
            </Field>
          </View>
        </View>

        <Pressable
          onPress={() => setAgreed((v) => !v)}
          style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.lg }}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: agreed }}
        >
          <View
            style={{
              width: 18,
              height: 18,
              marginTop: 2,
              borderRadius: 4,
              borderWidth: 1.5,
              borderColor: agreed ? colors.brand.primary : colors.borderStrong,
              backgroundColor: agreed ? colors.brand.primary : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {agreed ? <Ionicons name="checkmark" size={13} color={colors.gray[0]} /> : null}
          </View>
          <MDText variant="bodySm" tone="secondary" style={{ flex: 1 }}>
            I agree to the Millennium Digital Supplier Terms and confirm the details above are accurate.
          </MDText>
        </Pressable>

        {formError ? (
          <MDText variant="bodySm" style={{ color: colors.status.error, marginBottom: spacing.md }}>
            {formError}
          </MDText>
        ) : null}

        <View style={{ marginBottom: spacing.md }}>
          <MDBadge label="Application reviewed via Maker-Checker verification" tone="brand" />
        </View>

        <MDButton label="Submit Seller Application" size="lg" fullWidth loading={submitting} onPress={handleSubmit} />

        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.xs, marginTop: spacing.xl }}>
          <MDText variant="bodySm" tone="secondary">
            Already an approved seller?
          </MDText>
          <MDText variant="bodySm" weight="600" style={{ color: colors.brand.primary }} onPress={() => router.push('/(auth)/admin-login')}>
            Sign in to console
          </MDText>
        </View>
      </View>
    </AuthScreenShell>
  );
}
