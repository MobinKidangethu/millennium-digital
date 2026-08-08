import { useState } from 'react';
import { Linking, Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, MDCard, MDText } from '@/design-system';
import { TRUST_ICONS } from '@/constants/trustIcons';

const FAQS = [
  {
    question: 'How do I check if a part is in stock?',
    answer:
      'Stock status and available quantity are shown on every product card and on the product detail page under Availability.',
  },
  {
    question: 'Where can I find a datasheet for a component?',
    answer:
      'Every product detail page includes a "View Datasheet" button that opens the manufacturer datasheet in a new tab.',
  },
  {
    question: 'Can I compare multiple components before buying?',
    answer:
      'Yes — use the compare icon on any product card or product page to add up to 4 products to the comparison table.',
  },
  {
    question: 'How do I track an order after checkout?',
    answer:
      'Go to Account → Order History to view order status, tracking, and a downloadable invoice for any past order.',
  },
  {
    question: 'Do you support bulk or enterprise purchasing?',
    answer:
      'Yes — the checkout flow supports larger order quantities, and enterprise accounts can request purchase-order based payment.',
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Pressable
      onPress={() => setOpen((v) => !v)}
      style={{ borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: spacing.md }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <MDText variant="bodyMedium" style={{ flex: 1 }}>
          {question}
        </MDText>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.text.tertiary} />
      </View>
      {open ? (
        <MDText variant="bodySm" tone="secondary" style={{ marginTop: spacing.sm }}>
          {answer}
        </MDText>
      ) : null}
    </Pressable>
  );
}

export default function Help() {
  const CallIcon = TRUST_ICONS.call;
  const MailIcon = TRUST_ICONS.mail;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ maxWidth: 720, width: '100%', alignSelf: 'center', padding: spacing.xl }}>
        <MDText variant="h1">Help Center</MDText>
        <MDText variant="body" tone="secondary" style={{ marginTop: spacing.xs, marginBottom: spacing.xl }}>
          Answers to common questions, plus how to reach our team.
        </MDText>

        <View style={{ flexDirection: 'row', gap: spacing.lg, marginBottom: spacing['2xl'] }}>
          <MDCard style={{ flex: 1, gap: spacing.sm }}>
            <CallIcon width={20} height={20} />
            <MDText variant="bodyMedium">Call Support</MDText>
            <Pressable onPress={() => Linking.openURL('tel:+911234567890')}>
              <MDText variant="bodySm" style={{ color: colors.brand.primary }}>
                +91 12345 67890
              </MDText>
            </Pressable>
          </MDCard>
          <MDCard style={{ flex: 1, gap: spacing.sm }}>
            <MailIcon width={20} height={20} />
            <MDText variant="bodyMedium">Email Support</MDText>
            <Pressable onPress={() => Linking.openURL('mailto:support@millenniumdigital.demo')}>
              <MDText variant="bodySm" style={{ color: colors.brand.primary }}>
                support@millenniumdigital.demo
              </MDText>
            </Pressable>
          </MDCard>
        </View>

        <View
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.lg,
            paddingHorizontal: spacing.lg,
          }}
        >
          <MDText variant="h4" style={{ marginTop: spacing.lg }}>
            Frequently Asked Questions
          </MDText>
          <View style={{ marginTop: spacing.sm }}>
            {FAQS.map((faq) => (
              <FaqItem key={faq.question} {...faq} />
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
