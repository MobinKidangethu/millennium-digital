import type { BadgeTone } from '@/design-system';
import type { RfqStatus } from '@/types';

/**
 * Single source of truth for the RFQ fulfillment pipeline — every stepper,
 * badge, and admin "Update Status" control reads from this ordered list so
 * the stages/labels never drift between screens. Mirrors how OrderStatus
 * drives LogisticsTracker/MDOrderStatus, extended with the pre-order
 * sales/procurement stages an RFQ (vs. a straight catalog order) needs.
 */
export interface RfqStageConfig {
  key: RfqStatus;
  label: string;
  description: string;
}

/**
 * Two stages are buyer-driven gates rather than admin-advanced:
 * 'customer_approval' (buyer approves the quote — app/(buyer)/rfq/[id].tsx)
 * and 'shipment_approved' (buyer approves the ready-to-ship notice —
 * app/(buyer)/account/rfq-status/[id].tsx, which then unlocks the
 * dedicated RFQ Cart/Checkout journey). Everything else is advanced by the
 * Admin RFQ console, same as (admin)/orders/[id].tsx does for OrderStatus.
 */
export const RFQ_STAGES: RfqStageConfig[] = [
  { key: 'submitted', label: 'RFQ Submitted', description: 'RFQ received from the buyer’s BOM or AI search session.' },
  { key: 'customer_approval', label: 'Customer Approval', description: 'Buyer reviews the quote and approves it at governed pricing.' },
  { key: 'product_identification', label: 'Sales Team – Product Identification', description: 'Sales team identifies exact/alternate components for the approved quote.' },
  { key: 'procurement', label: 'Procurement', description: 'Sourcing the identified components/materials from supplier.' },
  { key: 'ready_to_ship', label: 'Ready to Ship', description: 'Components procured — buyer is notified the order is ready to ship.' },
  { key: 'shipment_approved', label: 'Approved for Shipment', description: 'Buyer approves shipment, unlocking the RFQ cart/checkout.' },
  { key: 'processing', label: 'Order Processing', description: 'RFQ order placed — packed and prepared for dispatch.' },
  { key: 'shipped', label: 'Shipped', description: 'Shipment handed to the logistics carrier.' },
  { key: 'out_for_delivery', label: 'Out for Delivery', description: 'Shipment is on its way to the delivery address.' },
  { key: 'delivered', label: 'Delivered', description: 'Order delivered.' },
];

export const RFQ_STAGE_LABEL: Record<RfqStatus, string> = {
  ...Object.fromEntries(RFQ_STAGES.map((s) => [s.key, s.label])),
  cancelled: 'Cancelled',
} as Record<RfqStatus, string>;

export const RFQ_STATUS_TONE: Record<RfqStatus, BadgeTone> = {
  submitted: 'brand',
  customer_approval: 'warning',
  product_identification: 'info',
  procurement: 'info',
  ready_to_ship: 'warning',
  shipment_approved: 'warning',
  processing: 'info',
  shipped: 'brand',
  out_for_delivery: 'warning',
  delivered: 'success',
  cancelled: 'error',
};

/** Index of a status within RFQ_STAGES, or -1 for 'cancelled' (handled separately by trackers). */
export function rfqStageIndex(status: RfqStatus): number {
  return RFQ_STAGES.findIndex((s) => s.key === status);
}
