import type { GovernanceStage } from '@/types';

/**
 * Millennium Digital Maker-Checker governance model.
 *
 * The Maker is responsible for build/execution; the Checker performs
 * independent validation; final approval is a separate business step.
 * The Maker never certifies its own release — advancing from
 * "submitted" to "maker_validated" represents the Maker's own build
 * being ready for independent review, not a release sign-off.
 * Final Go/No-Go remains a Millennium Digital governance decision
 * ("business_approved" -> "published").
 */
export const GOVERNANCE_STAGE_ORDER: GovernanceStage[] = [
  'draft',
  'submitted',
  'maker_validated',
  'checker_validated',
  'business_approved',
  'published',
];

export const GOVERNANCE_STAGE_LABEL: Record<GovernanceStage, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  maker_validated: 'Maker Validated',
  checker_validated: 'Checker Validated',
  business_approved: 'Business Approved',
  published: 'Published',
};

export const GOVERNANCE_STAGE_DESCRIPTION: Record<GovernanceStage, string> = {
  draft: 'Being prepared by the Maker — not yet ready for review.',
  submitted: 'Submitted by the Maker for independent validation.',
  maker_validated: "Maker's own build/QA checks complete — awaiting independent Checker review.",
  checker_validated: 'Independently validated by the Checker (QA / release-readiness).',
  business_approved: 'Business Go decision recorded by Millennium Digital governance.',
  published: 'Live and visible in the buyer-facing catalog.',
};

export function nextStage(stage: GovernanceStage): GovernanceStage | null {
  const idx = GOVERNANCE_STAGE_ORDER.indexOf(stage);
  if (idx < 0 || idx === GOVERNANCE_STAGE_ORDER.length - 1) return null;
  return GOVERNANCE_STAGE_ORDER[idx + 1];
}

export function stageIndex(stage: GovernanceStage): number {
  return GOVERNANCE_STAGE_ORDER.indexOf(stage);
}
