-- =============================================================================
-- 0001 · Extensions, schemas, enums and shared trigger helpers
-- =============================================================================
-- Astra Voice — multi-tenant AI voice receptionist.
--
-- Conventions used across every migration:
--   * UUID primary keys, generated with gen_random_uuid() (pgcrypto).
--   * timestamptz everywhere; the application never stores naive timestamps.
--   * Every tenant-owned table carries organisation_id and is protected by RLS.
--   * Enums live in the "app" schema so the public schema exposed through
--     PostgREST contains tables only.
-- =============================================================================

create extension if not exists pgcrypto;
create extension if not exists citext;
create extension if not exists pg_trgm;

-- "app" holds enums, authorisation helpers and internal functions.
create schema if not exists app;
comment on schema app is 'Internal Astra Voice types, authorisation helpers and triggers. Not exposed through the API.';

-- "agent" holds the ONLY surface the voice agent is allowed to read from.
create schema if not exists agent;
comment on schema agent is 'Approved-data-only views and functions. The voice agent reads nothing else.';

-- -----------------------------------------------------------------------------
-- Roles
-- -----------------------------------------------------------------------------
-- platform_admin is deliberately NOT an organisation role: it is a property of
-- the person (us, the platform operator), not of a membership. Keeping the two
-- vocabularies separate stops a tenant from ever escalating into it by editing
-- an organisation_members row.
create type app.org_role as enum (
  'organisation_owner',
  'organisation_admin',
  'location_manager',
  'staff',
  'viewer'
);

create type app.platform_role as enum ('member', 'platform_admin');

create type app.member_status as enum ('invited', 'active', 'suspended');

-- -----------------------------------------------------------------------------
-- Content approval
-- -----------------------------------------------------------------------------
create type app.approval_status as enum ('draft', 'pending_review', 'approved', 'archived');

-- -----------------------------------------------------------------------------
-- Domain enums
-- -----------------------------------------------------------------------------
create type app.language_code as enum ('en', 'it');

create type app.knowledge_category as enum (
  'hours', 'directions', 'services', 'policies',
  'accessibility', 'parking', 'events', 'general'
);

-- Allergen presence is a three-state fact, never a boolean. The difference
-- between "contains" and "may contain" is the difference between an
-- inconvenience and a hospital visit.
create type app.allergen_presence as enum ('contains', 'may_contain', 'free_from');

create type app.booking_provider as enum ('internal', 'calcom', 'google_calendar');

create type app.closed_behaviour as enum ('answer_and_book', 'answer_info_only', 'voicemail');

create type app.call_direction as enum ('inbound', 'outbound');

create type app.call_status as enum ('in_progress', 'completed', 'failed');

create type app.call_outcome as enum (
  'resolved_information',
  'reservation_created',
  'reservation_failed',
  'transferred',
  'transfer_failed',
  'voicemail',
  'abandoned',
  'system_failure',
  'spam'
);

create type app.transfer_status as enum ('not_requested', 'requested', 'succeeded', 'failed');

create type app.reservation_status as enum (
  'pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show', 'failed'
);

create type app.reservation_source as enum ('voice_agent', 'staff', 'web', 'import');

create type app.escalation_reason as enum (
  'caller_request',
  'agent_uncertainty',
  'complaint',
  'severe_allergy',
  'large_group',
  'outside_approved_information',
  'tool_failure',
  'other'
);

create type app.speaker as enum ('agent', 'caller', 'system');

create type app.call_event_type as enum (
  'call_started', 'language_detected', 'language_switched', 'consent_played',
  'tool_called', 'tool_succeeded', 'tool_failed',
  'escalation_raised', 'transfer_requested', 'transfer_succeeded', 'transfer_failed',
  'sms_queued', 'sms_sent', 'sms_failed',
  'reservation_created', 'reservation_failed',
  'call_ended'
);

create type app.sms_status as enum ('queued', 'sent', 'delivered', 'failed', 'undelivered');

create type app.audit_action as enum (
  'insert', 'update', 'delete', 'approve', 'unapprove',
  'login', 'export', 'unmask_pii', 'support_access'
);

create type app.subscription_status as enum (
  'trialing', 'active', 'past_due', 'canceled', 'incomplete', 'unpaid'
);

create type app.subscription_plan as enum ('pilot', 'starter', 'growth', 'custom');

-- -----------------------------------------------------------------------------
-- Shared trigger helpers
-- -----------------------------------------------------------------------------

-- search_path is pinned on every SECURITY DEFINER / trigger function so a
-- tenant cannot shadow a function or table name and hijack execution.
-- SECURITY INVOKER: this trigger only rewrites columns of the row being
-- written, so it needs no elevated privilege.
create or replace function app.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

comment on function app.set_updated_at() is 'BEFORE UPDATE trigger: maintains updated_at.';

-- Bumps the row version on every update. Combined with the approval-reset
-- trigger this gives menu and allergen records a monotonic revision number.
-- SECURITY INVOKER: this trigger only rewrites columns of the row being
-- written, so it needs no elevated privilege.
create or replace function app.bump_version()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.version := coalesce(old.version, 0) + 1;
  return new;
end;
$$;

comment on function app.bump_version() is 'BEFORE UPDATE trigger: increments version.';
