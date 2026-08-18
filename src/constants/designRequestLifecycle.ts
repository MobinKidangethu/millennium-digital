import type { BadgeTone } from '@/design-system';
import type { DesignRequestStatus } from '@/types';

/**
 * Single source of truth for the Design Request review pipeline — same
 * pattern as src/constants/rfqLifecycle.ts. Centralized here so the list
 * screen and the detail stepper never drift on labels/tones.
 * PROTOTYPE: there is no admin control (yet) to advance a Design Request
 * past "Submitted" — see DesignRequestStatusTracker for how this renders.
 */
export interface DesignRequestStageConfig {
  key: DesignRequestStatus;
  label: string;
  description: string;
}

export const DESIGN_REQUEST_STAGES: DesignRequestStageConfig[] = [
  { key: 'submitted', label: 'Submitted', description: 'Request received by Millennium Digital engineering.' },
  { key: 'engineering_review', label: 'Engineering Review', description: 'Engineering is reviewing the technical requirement and feasibility.' },
  { key: 'scoped', label: 'Scoped', description: 'Requirement scoped into a component/design plan.' },
  { key: 'quoted', label: 'Quoted', description: 'Commercial quote prepared for the scoped design.' },
];

export const DESIGN_REQUEST_STAGE_LABEL: Record<DesignRequestStatus, string> = Object.fromEntries(
  DESIGN_REQUEST_STAGES.map((s) => [s.key, s.label]),
) as Record<DesignRequestStatus, string>;

export const DESIGN_REQUEST_STATUS_TONE: Record<DesignRequestStatus, BadgeTone> = {
  submitted: 'brand',
  engineering_review: 'warning',
  scoped: 'warning',
  quoted: 'success',
};

export function designRequestStageIndex(status: DesignRequestStatus): number {
  return DESIGN_REQUEST_STAGES.findIndex((s) => s.key === status);
}
