import { ScrollView, View } from 'react-native';
import { colors, radius, spacing, MDSwitch, MDText } from '@/design-system';
import { useNotificationPrefsStore } from '@/state';

export default function AdminSettings() {
  const prefs = useNotificationPrefsStore();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ padding: spacing.xl, maxWidth: 640 }}>
        <MDText variant="h1" style={{ marginBottom: spacing.xl }}>
          Settings
        </MDText>

        <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, backgroundColor: colors.surfaceRaised, marginBottom: spacing.xl }}>
          <MDText variant="h4" style={{ marginBottom: spacing.md }}>
            Store Information
          </MDText>
          <View style={{ gap: spacing.sm }}>
            <Row label="Store Name" value="Millennium Digital" />
            <Row label="Currency" value="INR (₹)" />
            <Row label="Support Email" value="support@millenniumdigital.demo" />
          </View>
        </View>

        <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, backgroundColor: colors.surfaceRaised }}>
          <MDText variant="h4" style={{ marginBottom: spacing.md }}>
            Admin Notifications
          </MDText>
          <View style={{ gap: spacing.md }}>
            <PrefRow label="New Orders" description="Notify when a new order is placed" value={prefs.orderUpdates} onToggle={() => prefs.toggle('orderUpdates')} />
            <PrefRow label="Low Stock Alerts" description="Notify when a product drops below the low-stock threshold" value={prefs.stockAlerts} onToggle={() => prefs.toggle('stockAlerts')} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <MDText variant="bodySm" tone="secondary">
        {label}
      </MDText>
      <MDText variant="bodySm" weight="600">
        {value}
      </MDText>
    </View>
  );
}

function PrefRow({ label, description, value, onToggle }: { label: string; description: string; value: boolean; onToggle: () => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={{ flex: 1, marginRight: spacing.md }}>
        <MDText variant="bodySm" weight="600">
          {label}
        </MDText>
        <MDText variant="caption" tone="tertiary">
          {description}
        </MDText>
      </View>
      <MDSwitch value={value} onValueChange={onToggle} accessibilityLabel={label} />
    </View>
  );
}
