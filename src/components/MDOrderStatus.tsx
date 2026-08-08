import { MDBadge, type BadgeTone } from '@/design-system';
import type { OrderStatus } from '@/types';

const STATUS_CONFIG: Record<OrderStatus, { label: string; tone: BadgeTone }> = {
  placed: { label: 'Order Placed', tone: 'info' },
  processing: { label: 'Processing', tone: 'info' },
  shipped: { label: 'Shipped', tone: 'brand' },
  'out-for-delivery': { label: 'Out for Delivery', tone: 'warning' },
  delivered: { label: 'Delivered', tone: 'success' },
  cancelled: { label: 'Cancelled', tone: 'error' },
};

export function MDOrderStatus({ status }: { status: OrderStatus }) {
  const config = STATUS_CONFIG[status];
  return <MDBadge label={config.label} tone={config.tone} size="md" />;
}
