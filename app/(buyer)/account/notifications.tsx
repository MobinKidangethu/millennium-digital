import { useMemo } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, MDEmptyState, MDSkeleton, MDSwitch, MDText } from '@/design-system';
import { useAuthStore, useNotificationPrefsStore } from '@/state';
import { useOrders } from '@/features/orders';
import { MDOrderStatus } from '@/components/MDOrderStatus';

interface NotificationEntry {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  timestamp: string;
  status?: import('@/types').OrderStatus;
}

export default function Notifications() {
  const session = useAuthStore((s) => s.session);
  const { data: orders, isLoading } = useOrders(session?.user.id);
  const prefs = useNotificationPrefsStore();

  const notifications = useMemo<NotificationEntry[]>(() => {
    if (!orders) return [];
    const entries: NotificationEntry[] = [];
    for (const order of orders) {
      for (const entry of order.timeline) {
        entries.push({
          id: `${order.id}-${entry.status}`,
          icon: 'receipt-outline',
          title: `Order #${order.orderNumber}: ${entry.label}`,
          timestamp: entry.timestamp,
          status: entry.status,
        });
      }
    }
    return entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [orders]);

  return (
    <View>
      <MDText variant="h1" style={{ marginBottom: spacing.xl }}>
        Notifications
      </MDText>

      <View
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.lg,
          padding: spacing.lg,
          gap: spacing.md,
          marginBottom: spacing['2xl'],
        }}
      >
        <MDText variant="h4">Preferences</MDText>
        <PrefRow label="Order Updates" description="Status changes for your orders" value={prefs.orderUpdates} onToggle={() => prefs.toggle('orderUpdates')} />
        <PrefRow label="Stock Alerts" description="When a wishlisted item's availability changes" value={prefs.stockAlerts} onToggle={() => prefs.toggle('stockAlerts')} />
        <PrefRow label="Promotions" description="Occasional offers and announcements" value={prefs.promotions} onToggle={() => prefs.toggle('promotions')} />
      </View>

      {isLoading ? (
        <View style={{ gap: spacing.sm }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <MDSkeleton key={i} height={60} radius={12} />
          ))}
        </View>
      ) : notifications.length === 0 ? (
        <MDEmptyState
          icon={<Ionicons name="notifications-outline" size={40} color={colors.text.tertiary} />}
          title="No notifications yet"
          description="Updates about your orders will appear here."
        />
      ) : (
        <View style={{ gap: spacing.sm }}>
          {notifications.map((entry) => (
            <View
              key={entry.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.md,
                padding: spacing.md,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: radius.pill,
                  backgroundColor: colors.brand.primarySoft,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name={entry.icon} size={16} color={colors.brand.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <MDText variant="bodySm" weight="600">
                  {entry.title}
                </MDText>
                <MDText variant="caption" tone="tertiary">
                  {new Date(entry.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </MDText>
              </View>
              {entry.status ? <MDOrderStatus status={entry.status} /> : null}
            </View>
          ))}
        </View>
      )}
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
