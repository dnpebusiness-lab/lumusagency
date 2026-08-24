/**
 * PostgreSQL enum values, mirrored in TypeScript.
 *
 * These are hand-maintained because `supabase gen types` needs Docker or a
 * linked remote project, neither of which exists yet (see SUPABASE_SETUP.md,
 * "Known limitations"). To stop that hand-maintenance from silently drifting,
 * tests/database/enums.test.ts compares every list below against the live
 * database and fails on any difference — in either direction.
 *
 * Once `npm run db:types` can run, the generated file becomes authoritative and
 * this one is reduced to the ordering/labels the UI needs.
 */

export const ORG_ROLES = [
  'organisation_owner',
  'organisation_admin',
  'location_manager',
  'staff',
  'viewer',
] as const
export type OrgRole = (typeof ORG_ROLES)[number]

export const PLATFORM_ROLES = ['member', 'platform_admin'] as const
export type PlatformRole = (typeof PLATFORM_ROLES)[number]

export const MEMBER_STATUSES = ['invited', 'active', 'suspended'] as const
export type MemberStatus = (typeof MEMBER_STATUSES)[number]

export const APPROVAL_STATUSES = ['draft', 'pending_review', 'approved', 'archived'] as const
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number]

export const LANGUAGE_CODES = ['en', 'it'] as const
export type LanguageCode = (typeof LANGUAGE_CODES)[number]

export const KNOWLEDGE_CATEGORIES = [
  'hours',
  'directions',
  'services',
  'policies',
  'accessibility',
  'parking',
  'events',
  'general',
] as const
export type KnowledgeCategory = (typeof KNOWLEDGE_CATEGORIES)[number]

export const ALLERGEN_PRESENCES = ['contains', 'may_contain', 'free_from'] as const
export type AllergenPresence = (typeof ALLERGEN_PRESENCES)[number]

export const BOOKING_PROVIDERS = ['internal', 'calcom', 'google_calendar'] as const
export type BookingProviderId = (typeof BOOKING_PROVIDERS)[number]

export const CLOSED_BEHAVIOURS = ['answer_and_book', 'answer_info_only', 'voicemail'] as const
export type ClosedBehaviour = (typeof CLOSED_BEHAVIOURS)[number]

export const CALL_DIRECTIONS = ['inbound', 'outbound'] as const
export type CallDirection = (typeof CALL_DIRECTIONS)[number]

export const CALL_STATUSES = ['in_progress', 'completed', 'failed'] as const
export type CallStatus = (typeof CALL_STATUSES)[number]

export const CALL_OUTCOMES = [
  'resolved_information',
  'reservation_created',
  'reservation_failed',
  'transferred',
  'transfer_failed',
  'voicemail',
  'abandoned',
  'system_failure',
  'spam',
] as const
export type CallOutcome = (typeof CALL_OUTCOMES)[number]

export const TRANSFER_STATUSES = ['not_requested', 'requested', 'succeeded', 'failed'] as const
export type TransferStatus = (typeof TRANSFER_STATUSES)[number]

export const RESERVATION_STATUSES = [
  'pending',
  'confirmed',
  'seated',
  'completed',
  'cancelled',
  'no_show',
  'failed',
] as const
export type ReservationStatus = (typeof RESERVATION_STATUSES)[number]

export const RESERVATION_SOURCES = ['voice_agent', 'staff', 'web', 'import'] as const
export type ReservationSource = (typeof RESERVATION_SOURCES)[number]

export const ESCALATION_REASONS = [
  'caller_request',
  'agent_uncertainty',
  'complaint',
  'severe_allergy',
  'large_group',
  'outside_approved_information',
  'tool_failure',
  'other',
] as const
export type EscalationReason = (typeof ESCALATION_REASONS)[number]

/**
 * Escalation reasons the restaurant is not allowed to switch off. Mirrors the
 * escalation_rules_mandatory_reasons_enabled CHECK constraint; the database is
 * still the enforcement point, this list only drives the UI.
 */
export const MANDATORY_ESCALATION_REASONS: readonly EscalationReason[] = [
  'severe_allergy',
  'complaint',
  'caller_request',
  'outside_approved_information',
]

export const SPEAKERS = ['agent', 'caller', 'system'] as const
export type Speaker = (typeof SPEAKERS)[number]

export const CALL_EVENT_TYPES = [
  'call_started',
  'language_detected',
  'language_switched',
  'consent_played',
  'tool_called',
  'tool_succeeded',
  'tool_failed',
  'escalation_raised',
  'transfer_requested',
  'transfer_succeeded',
  'transfer_failed',
  'sms_queued',
  'sms_sent',
  'sms_failed',
  'reservation_created',
  'reservation_failed',
  'call_ended',
  // Added in migration 0011 for Milestone 4A. Order matters: the drift test
  // compares against pg enumsortorder, and ALTER TYPE ... ADD VALUE appends.
  'ai_disclosure_started',
  'ai_disclosure_completed',
  'ai_disclosure_replayed',
  'tool_rate_limited',
  'recording_url_discarded',
] as const
export type CallEventType = (typeof CALL_EVENT_TYPES)[number]

export const SMS_STATUSES = ['queued', 'sent', 'delivered', 'failed', 'undelivered'] as const
export type SmsStatus = (typeof SMS_STATUSES)[number]

export const AUDIT_ACTIONS = [
  'insert',
  'update',
  'delete',
  'approve',
  'unapprove',
  'login',
  'export',
  'unmask_pii',
  'support_access',
] as const
export type AuditAction = (typeof AUDIT_ACTIONS)[number]

export const SUBSCRIPTION_STATUSES = [
  'trialing',
  'active',
  'past_due',
  'canceled',
  'incomplete',
  'unpaid',
] as const
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number]

export const SUBSCRIPTION_PLANS = ['pilot', 'starter', 'growth', 'custom'] as const
export type SubscriptionPlan = (typeof SUBSCRIPTION_PLANS)[number]

/** The mapping used by every drift test and by the schema documentation. */
export const DATABASE_ENUMS: Record<string, readonly string[]> = {
  org_role: ORG_ROLES,
  platform_role: PLATFORM_ROLES,
  member_status: MEMBER_STATUSES,
  approval_status: APPROVAL_STATUSES,
  language_code: LANGUAGE_CODES,
  knowledge_category: KNOWLEDGE_CATEGORIES,
  allergen_presence: ALLERGEN_PRESENCES,
  booking_provider: BOOKING_PROVIDERS,
  closed_behaviour: CLOSED_BEHAVIOURS,
  call_direction: CALL_DIRECTIONS,
  call_status: CALL_STATUSES,
  call_outcome: CALL_OUTCOMES,
  transfer_status: TRANSFER_STATUSES,
  reservation_status: RESERVATION_STATUSES,
  reservation_source: RESERVATION_SOURCES,
  escalation_reason: ESCALATION_REASONS,
  speaker: SPEAKERS,
  call_event_type: CALL_EVENT_TYPES,
  sms_status: SMS_STATUSES,
  audit_action: AUDIT_ACTIONS,
  subscription_status: SUBSCRIPTION_STATUSES,
  subscription_plan: SUBSCRIPTION_PLANS,
}
