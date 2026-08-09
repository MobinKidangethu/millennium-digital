import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  radius,
  spacing,
  useToast,
  MDButton,
  MDCard,
  MDInput,
  MDText,
} from '@/design-system';
import { designRequestService } from '@/features/designRequests';
import { useAuthStore } from '@/state';
import { ProtoBadge } from '@/components/ProtoBadge';
import type { DesignRequest } from '@/types';

const APPLICATIONS = ['Automotive', 'Industrial', 'Consumer', 'Telecom', 'Medical', 'Aerospace', 'EV / Solar', 'Other'];

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

export default function DesignRequestScreen() {
  const router = useRouter();
  const toast = useToast();
  const session = useAuthStore((s) => s.session);

  const [projectName, setProjectName] = useState('');
  const [application, setApplication] = useState<string | null>(null);
  const [technicalRequirement, setTechnicalRequirement] = useState('');
  const [targetQuantity, setTargetQuantity] = useState('');
  const [targetCost, setTargetCost] = useState('');
  const [requiredDate, setRequiredDate] = useState('');
  const [bomFileName, setBomFileName] = useState<string | null>(null);
  const [additionalRequirements, setAdditionalRequirements] = useState('');
  const [contactName, setContactName] = useState(session?.user.fullName ?? '');
  const [contactEmail, setContactEmail] = useState(session?.user.email ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<DesignRequest | null>(null);

  const canSubmit = projectName.trim() && application && technicalRequirement.trim() && targetQuantity.trim();

  const handleSubmit = async () => {
    if (!canSubmit) {
      toast.show('Fill in project name, application, requirement, and target quantity.', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      const request = await designRequestService.submitDesignRequest({
        projectName,
        application: application!,
        technicalRequirement,
        targetQuantity,
        targetCost: targetCost || undefined,
        requiredDate: requiredDate || undefined,
        bomFileName: bomFileName ?? undefined,
        additionalRequirements: additionalRequirements || undefined,
        contactName: contactName || undefined,
        contactEmail: contactEmail || undefined,
      });
      setSubmitted(request);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ maxWidth: 680, width: '100%', alignSelf: 'center', padding: spacing.xl, alignItems: 'center' }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: radius.pill,
              backgroundColor: colors.status.successSoft,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing.lg,
              marginTop: spacing['2xl'],
            }}
          >
            <Ionicons name="checkmark" size={32} color={colors.status.successStrong} />
          </View>
          <MDText variant="h1" align="center">Design Request Submitted</MDText>
          <MDText variant="body" tone="secondary" align="center" style={{ marginTop: spacing.sm, marginBottom: spacing.xl }}>
            Reference {submitted.referenceNumber} — our engineering team will review "{submitted.projectName}" and
            follow up at {submitted.contactEmail || 'the email on your account'}.
          </MDText>

          <MDCard padding="lg" style={{ width: '100%', marginBottom: spacing.xl }}>
            <MDText variant="h4" style={{ marginBottom: spacing.md }}>What happens next</MDText>
            {(['Submitted', 'Engineering Review', 'Scoped', 'Quoted'] as const).map((stage, index) => (
              <View key={stage} style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md }}>
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
                  {index < 3 ? <View style={{ width: 2, flex: 1, backgroundColor: colors.border, minHeight: 16 }} /> : null}
                </View>
                <MDText variant="bodySm" weight={index === 0 ? '700' : '400'} tone={index === 0 ? 'primary' : 'tertiary'}>
                  {stage}
                </MDText>
              </View>
            ))}
            <ProtoBadge label="Status pipeline shown for prototype — routes to the engineering/BD queue in production" />
          </MDCard>

          <View style={{ flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap', justifyContent: 'center' }}>
            <MDButton label="Explore AI Engineering Search" onPress={() => router.push('/(buyer)/ai-search')} />
            <MDButton label="Back to Home" variant="outline" onPress={() => router.push('/(buyer)')} />
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ maxWidth: 720, width: '100%', alignSelf: 'center', padding: spacing.xl }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
          <MDText variant="h1">Design Request</MDText>
        </View>
        <MDText variant="body" tone="secondary" style={{ marginBottom: spacing.xl }}>
          Tell us what you're designing and we'll route it to the right engineering and sourcing team — this is
          a structured intake, not a generic contact form.
        </MDText>

        <MDCard padding="lg">
          <Field label="Project / Design Name" required>
            <MDInput value={projectName} onChangeText={setProjectName} placeholder="e.g. EV Onboard Charger Rev C" />
          </Field>

          <Field label="Application" required>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {APPLICATIONS.map((app) => (
                <Pressable
                  key={app}
                  onPress={() => setApplication(app)}
                  style={{
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    borderRadius: radius.pill,
                    borderWidth: 1,
                    borderColor: application === app ? colors.brand.primary : colors.border,
                    backgroundColor: application === app ? colors.brand.primarySoft : colors.surface,
                  }}
                >
                  <MDText variant="bodySm" weight={application === app ? '700' : '400'} style={{ color: application === app ? colors.brand.primary : colors.text.secondary }}>
                    {app}
                  </MDText>
                </Pressable>
              ))}
            </View>
          </Field>

          <Field label="Technical Requirement" required>
            <MDInput
              value={technicalRequirement}
              onChangeText={setTechnicalRequirement}
              placeholder="Describe the function, key electrical/mechanical constraints, and any preferred technology or package"
              multiline
            />
          </Field>

          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <View style={{ flex: 1 }}>
              <Field label="Target Quantity" required>
                <MDInput value={targetQuantity} onChangeText={setTargetQuantity} placeholder="e.g. 10,000 units / year" />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Target Cost">
                <MDInput value={targetCost} onChangeText={setTargetCost} placeholder="e.g. ₹250 / unit" keyboardType="default" />
              </Field>
            </View>
          </View>

          <Field label="Required Date">
            <MDInput value={requiredDate} onChangeText={setRequiredDate} placeholder="e.g. 2026-11-01" />
          </Field>

          <Field label="BOM Upload">
            {bomFileName ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border }}>
                <Ionicons name="document-attach-outline" size={18} color={colors.brand.primary} />
                <MDText variant="bodySm" style={{ flex: 1 }}>{bomFileName}</MDText>
                <Pressable onPress={() => setBomFileName(null)}>
                  <Ionicons name="close" size={16} color={colors.text.tertiary} />
                </Pressable>
              </View>
            ) : (
              <MDButton
                label="Attach BOM (.csv / .xlsx)"
                variant="outline"
                iconLeft={<Ionicons name="cloud-upload-outline" size={16} color={colors.brand.primary} />}
                onPress={() => {
                  setBomFileName('BOM-Template.xlsx');
                  toast.show('Demo BOM attached — prototype simulation.', 'neutral');
                }}
              />
            )}
          </Field>

          <Field label="Additional Requirements">
            <MDInput
              value={additionalRequirements}
              onChangeText={setAdditionalRequirements}
              placeholder="Certifications, lifecycle/EOL sensitivity, alternate sourcing needs, samples required, etc."
              multiline
            />
          </Field>

          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <View style={{ flex: 1 }}>
              <Field label="Contact Name">
                <MDInput value={contactName} onChangeText={setContactName} placeholder="Your name" />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Contact Email">
                <MDInput value={contactEmail} onChangeText={setContactEmail} placeholder="you@company.com" keyboardType="email-address" autoCapitalize="none" />
              </Field>
            </View>
          </View>

          <MDButton label="Submit Design Request" fullWidth onPress={handleSubmit} loading={submitting} />
        </MDCard>
      </View>
    </ScrollView>
  );
}
