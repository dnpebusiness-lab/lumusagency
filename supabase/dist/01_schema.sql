-- =============================================================================
-- PART 1 of 4 · Schema, security and the agent read surface
-- =============================================================================
-- GENERATED FILE — do not edit. Rebuild with: npm run db:bundle
--
-- Astra Voice · concatenation of the migrations in supabase/migrations/, in
-- order, for pasting into the Supabase SQL Editor when the CLI is not
-- available. The CLI path (supabase db push) remains the primary route and
-- applies the same files individually.
--
-- Run the parts IN ORDER. Part 2 exists on its own because PostgreSQL forbids
-- using an enum value in the same transaction that added it, and the SQL Editor
-- wraps a submission in one transaction.
-- =============================================================================

-- ─── 20260824000100_extensions_enums_and_helpers.sql ───
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

-- ─── 20260824000200_core_tenancy.sql ───
-- =============================================================================
-- 0002 · Core tenancy: profiles, organisations, memberships, locations, billing
-- =============================================================================

-- -----------------------------------------------------------------------------
-- profiles — one row per authenticated user, created automatically by trigger
-- -----------------------------------------------------------------------------
create table public.profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  email          citext not null,
  full_name      text,
  avatar_url     text,
  phone_e164     text,
  locale         app.language_code not null default 'en',
  -- Platform-level privilege. Never settable by a tenant: see the
  -- profiles_no_self_escalation trigger in migration 0007.
  platform_role  app.platform_role not null default 'member',
  last_seen_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint profiles_phone_e164_format
    check (phone_e164 is null or phone_e164 ~ '^\+[1-9][0-9]{6,14}$')
);

comment on table public.profiles is 'Application profile for an auth.users row. Created automatically on sign-up.';
comment on column public.profiles.platform_role is 'Platform operator privilege. Not an organisation role and never grantable by a tenant.';

create index profiles_email_idx on public.profiles (email);

-- -----------------------------------------------------------------------------
-- organisations — the tenant boundary
-- -----------------------------------------------------------------------------
create table public.organisations (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          citext not null unique,
  legal_name    text,
  country_code  char(2) not null default 'IE',
  timezone      text not null default 'Europe/Dublin',
  currency      char(3) not null default 'EUR',
  -- Demo tenants are excluded from billing and from production reporting, and
  -- are visibly flagged in the dashboard so they can never be mistaken for a
  -- real client.
  is_demo       boolean not null default false,
  -- Data-retention policy (GDPR). Hard ceilings are enforced by CHECK so a
  -- misconfiguration cannot silently keep personal data forever.
  transcript_retention_days  integer not null default 90,
  metadata_retention_days    integer not null default 730,
  recording_enabled_default  boolean not null default false,
  created_by    uuid references public.profiles (id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz,
  constraint organisations_slug_format check (slug ~ '^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$'),
  constraint organisations_country_code_format check (country_code ~ '^[A-Z]{2}$'),
  constraint organisations_transcript_retention_bounds
    check (transcript_retention_days between 1 and 365),
  constraint organisations_metadata_retention_bounds
    check (metadata_retention_days between 30 and 2555),
  constraint organisations_retention_ordering
    check (metadata_retention_days >= transcript_retention_days)
);

comment on table public.organisations is 'A tenant. Every business row in the database belongs to exactly one.';
comment on column public.organisations.transcript_retention_days is 'Hard-capped at 365 days by constraint; transcripts are personal data.';

create index organisations_active_idx on public.organisations (id) where deleted_at is null;

-- -----------------------------------------------------------------------------
-- organisation_members — who may do what, inside one organisation
-- -----------------------------------------------------------------------------
create table public.organisation_members (
  id               uuid primary key default gen_random_uuid(),
  organisation_id  uuid not null references public.organisations (id) on delete cascade,
  user_id          uuid not null references public.profiles (id) on delete cascade,
  role             app.org_role not null default 'staff',
  status           app.member_status not null default 'invited',
  invited_by       uuid references public.profiles (id) on delete set null,
  invited_at       timestamptz not null default now(),
  accepted_at      timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (organisation_id, user_id)
);

comment on table public.organisation_members is 'Membership and role. This table is the authorisation source of truth for RLS.';

create index organisation_members_user_idx on public.organisation_members (user_id, status);
create index organisation_members_org_idx on public.organisation_members (organisation_id, role);

-- Fast lookup of the active owners of an organisation. The "an organisation is
-- never left without an owner" rule is enforced by a trigger in migration 0007,
-- because it is a minimum-cardinality rule and no index can express it.
create index organisation_members_active_owner_idx
  on public.organisation_members (organisation_id)
  where role = 'organisation_owner' and status = 'active';

-- -----------------------------------------------------------------------------
-- locations — a physical restaurant
-- -----------------------------------------------------------------------------
create table public.locations (
  id                uuid primary key default gen_random_uuid(),
  organisation_id   uuid not null references public.organisations (id) on delete cascade,
  name              text not null,
  slug              citext not null,
  address_line1     text,
  address_line2     text,
  city              text,
  region            text,
  postal_code       text,
  country_code      char(2) not null default 'IE',
  latitude          numeric(9, 6),
  longitude         numeric(9, 6),
  timezone          text not null default 'Europe/Dublin',
  phone_e164        text,
  public_email      citext,
  website_url       text,
  directions_note   text,
  booking_provider  app.booking_provider not null default 'internal',
  booking_config    jsonb not null default '{}'::jsonb,
  -- Capacity rules used by the internal availability engine (Milestone 5).
  max_party_size_auto_book       integer not null default 8,
  default_reservation_minutes    integer not null default 90,
  seats_total                    integer,
  is_active         boolean not null default true,
  is_demo           boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  deleted_at        timestamptz,
  unique (organisation_id, slug),
  constraint locations_phone_e164_format
    check (phone_e164 is null or phone_e164 ~ '^\+[1-9][0-9]{6,14}$'),
  constraint locations_auto_book_bounds check (max_party_size_auto_book between 1 and 50),
  constraint locations_duration_bounds check (default_reservation_minutes between 15 and 480),
  constraint locations_seats_positive check (seats_total is null or seats_total > 0),
  constraint locations_latlon_pair
    check ((latitude is null) = (longitude is null))
);

comment on table public.locations is 'A restaurant. Location managers are scoped to specific rows here.';
comment on column public.locations.max_party_size_auto_book is 'Parties larger than this are escalated to staff and never booked by the agent.';

create index locations_org_idx on public.locations (organisation_id) where deleted_at is null;

-- -----------------------------------------------------------------------------
-- organisation_member_locations — scopes a location_manager to its locations
-- -----------------------------------------------------------------------------
create table public.organisation_member_locations (
  id               uuid primary key default gen_random_uuid(),
  organisation_id  uuid not null references public.organisations (id) on delete cascade,
  member_id        uuid not null references public.organisation_members (id) on delete cascade,
  location_id      uuid not null references public.locations (id) on delete cascade,
  created_at       timestamptz not null default now(),
  unique (member_id, location_id)
);

comment on table public.organisation_member_locations is 'Assignment of a member to a location. Only meaningful for the location_manager and staff roles; owners and admins implicitly cover every location.';

create index organisation_member_locations_location_idx
  on public.organisation_member_locations (location_id);

-- -----------------------------------------------------------------------------
-- subscriptions — Stripe billing state (test mode in V1)
-- -----------------------------------------------------------------------------
create table public.subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  organisation_id         uuid not null unique references public.organisations (id) on delete cascade,
  stripe_customer_id      text unique,
  stripe_subscription_id  text unique,
  status                  app.subscription_status not null default 'trialing',
  plan                    app.subscription_plan not null default 'pilot',
  current_period_end      timestamptz,
  trial_ends_at           timestamptz,
  cancel_at_period_end    boolean not null default false,
  -- Entitlements, enforced server-side (Milestone 7).
  max_locations           integer not null default 1,
  max_monthly_minutes     integer not null default 500,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  constraint subscriptions_limits_positive
    check (max_locations > 0 and max_monthly_minutes > 0)
);

comment on table public.subscriptions is 'Billing state. V1 runs Stripe in test mode only; no live key is ever configured.';

-- -----------------------------------------------------------------------------
-- updated_at triggers
-- -----------------------------------------------------------------------------
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function app.set_updated_at();

create trigger organisations_set_updated_at
  before update on public.organisations
  for each row execute function app.set_updated_at();

create trigger organisation_members_set_updated_at
  before update on public.organisation_members
  for each row execute function app.set_updated_at();

create trigger locations_set_updated_at
  before update on public.locations
  for each row execute function app.set_updated_at();

create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function app.set_updated_at();

-- ─── 20260824000300_agent_configuration.sql ───
-- =============================================================================
-- 0003 · Agent configuration, opening hours and escalation rules
-- =============================================================================

-- -----------------------------------------------------------------------------
-- agent_configurations — everything a manager can change about how the agent
-- behaves, without a code change or a deployment
-- -----------------------------------------------------------------------------
create table public.agent_configurations (
  id                     uuid primary key default gen_random_uuid(),
  organisation_id        uuid not null references public.organisations (id) on delete cascade,
  location_id            uuid not null unique references public.locations (id) on delete cascade,
  is_active              boolean not null default false,

  -- Greeting and language
  default_language       app.language_code not null default 'en',
  supported_languages    app.language_code[] not null default array['en', 'it']::app.language_code[],
  greeting_en            text not null,
  greeting_it            text,

  -- Legally required disclosure that the caller is speaking to an AI system.
  -- Enforced non-null: an agent may not be activated without it.
  ai_disclosure_en       text not null,
  ai_disclosure_it       text,

  -- Voice
  voice_provider         text not null default 'retell',
  voice_id               text,
  retell_agent_id        text,

  -- Transfer
  transfer_enabled       boolean not null default true,
  transfer_number_e164   text,
  transfer_hours_only    boolean not null default true,

  -- Behaviour outside opening hours
  closed_behaviour       app.closed_behaviour not null default 'answer_and_book',

  -- Recording. Off by default. If it is switched on, a consent announcement is
  -- mandatory — the constraint below makes "recording without consent script"
  -- unrepresentable rather than merely discouraged.
  recording_enabled          boolean not null default false,
  recording_consent_en       text,
  recording_consent_it       text,

  sms_enabled            boolean not null default true,
  prompt_version         integer not null default 1,
  synced_at              timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),

  constraint agent_configurations_transfer_number_format
    check (transfer_number_e164 is null or transfer_number_e164 ~ '^\+[1-9][0-9]{6,14}$'),
  constraint agent_configurations_transfer_requires_number
    check (not transfer_enabled or transfer_number_e164 is not null),
  constraint agent_configurations_recording_requires_consent
    check (not recording_enabled or recording_consent_en is not null),
  constraint agent_configurations_default_language_supported
    check (default_language = any (supported_languages)),
  constraint agent_configurations_italian_greeting_present
    check (not ('it' = any (supported_languages)) or greeting_it is not null),
  constraint agent_configurations_active_requires_voice
    check (not is_active or voice_id is not null)
);

comment on table public.agent_configurations is 'Per-location agent behaviour. Changing a row here changes the live agent without a deployment.';
comment on constraint agent_configurations_recording_requires_consent on public.agent_configurations
  is 'GDPR: audio recording cannot be enabled without a consent announcement.';

create index agent_configurations_org_idx on public.agent_configurations (organisation_id);

-- -----------------------------------------------------------------------------
-- business_hours — regular weekly hours plus dated overrides (holidays)
-- -----------------------------------------------------------------------------
create table public.business_hours (
  id               uuid primary key default gen_random_uuid(),
  organisation_id  uuid not null references public.organisations (id) on delete cascade,
  location_id      uuid not null references public.locations (id) on delete cascade,
  -- 0 = Sunday … 6 = Saturday, matching PostgreSQL's extract(dow).
  day_of_week      smallint,
  service_label    text,
  opens_at         time,
  closes_at        time,
  is_closed        boolean not null default false,
  -- Dated override window. NULL/NULL = the regular weekly pattern.
  valid_from       date,
  valid_to         date,
  note             text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint business_hours_day_range check (day_of_week is null or day_of_week between 0 and 6),
  -- A row is either a weekly rule (day_of_week set) or a dated override
  -- (valid_from set). Never neither.
  constraint business_hours_shape
    check (day_of_week is not null or valid_from is not null),
  constraint business_hours_open_requires_times
    check (is_closed or (opens_at is not null and closes_at is not null)),
  -- closes_at < opens_at is allowed and means "past midnight" (a late kitchen).
  constraint business_hours_valid_window
    check (valid_to is null or valid_from is null or valid_to >= valid_from)
);

comment on table public.business_hours is 'Weekly opening hours and dated holiday overrides. A dated row wins over the weekly rule for its window.';
comment on column public.business_hours.closes_at is 'May be earlier than opens_at, meaning service runs past midnight.';

create index business_hours_location_idx on public.business_hours (location_id, day_of_week);
create index business_hours_override_idx on public.business_hours (location_id, valid_from, valid_to)
  where valid_from is not null;

-- -----------------------------------------------------------------------------
-- escalation_rules — when the agent must stop and fetch a human
-- -----------------------------------------------------------------------------
create table public.escalation_rules (
  id                   uuid primary key default gen_random_uuid(),
  organisation_id      uuid not null references public.organisations (id) on delete cascade,
  location_id          uuid not null references public.locations (id) on delete cascade,
  reason               app.escalation_reason not null,
  is_enabled           boolean not null default true,
  -- Used by threshold-based reasons, e.g. large_group -> party size.
  threshold_value      integer,
  transfer_number_e164 text,
  -- What the agent says before escalating, in each supported language.
  message_en           text,
  message_it           text,
  priority             smallint not null default 100,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),

  unique (location_id, reason),
  constraint escalation_rules_transfer_number_format
    check (transfer_number_e164 is null or transfer_number_e164 ~ '^\+[1-9][0-9]{6,14}$'),
  constraint escalation_rules_threshold_positive
    check (threshold_value is null or threshold_value > 0),
  -- These four are safety rules, not preferences. They cannot be switched off.
  constraint escalation_rules_mandatory_reasons_enabled
    check (
      is_enabled
      or reason not in ('severe_allergy', 'complaint', 'caller_request', 'outside_approved_information')
    )
);

comment on table public.escalation_rules is 'Per-location rules for handing a call to a human.';
comment on constraint escalation_rules_mandatory_reasons_enabled on public.escalation_rules
  is 'Severe allergy, complaints, explicit caller requests and out-of-scope questions always escalate. Disabling them is not representable.';

create index escalation_rules_location_idx on public.escalation_rules (location_id) where is_enabled;

create trigger agent_configurations_set_updated_at
  before update on public.agent_configurations
  for each row execute function app.set_updated_at();

create trigger business_hours_set_updated_at
  before update on public.business_hours
  for each row execute function app.set_updated_at();

create trigger escalation_rules_set_updated_at
  before update on public.escalation_rules
  for each row execute function app.set_updated_at();

-- ─── 20260824000400_knowledge_and_menu.sql ───
-- =============================================================================
-- 0004 · Knowledge base, menu and allergens
-- =============================================================================
-- Everything in this migration is approval-gated. The voice agent may only ever
-- read rows whose approval_status = 'approved'; see migration 0008, which builds
-- the agent schema on top of these tables and is the only surface the agent can
-- reach.
--
-- Every approvable table carries the same six columns:
--   approval_status · approved_by · approved_at · version · last_reviewed_at
--   (+ cross_contamination_notes where allergens are involved)
-- and the same CHECK: an 'approved' row must name who approved it and when.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- allergens — the 14 allergens of EU Regulation 1169/2011 Annex II.
-- Global reference data, identical for every tenant.
-- -----------------------------------------------------------------------------
create table public.allergens (
  id                  uuid primary key default gen_random_uuid(),
  code                text not null unique,
  annex_ii_number     smallint unique,
  name_en             text not null,
  name_it             text not null,
  description_en      text,
  description_it      text,
  is_eu_regulated     boolean not null default true,
  created_at          timestamptz not null default now(),
  constraint allergens_code_format check (code ~ '^[a-z_]+$'),
  constraint allergens_annex_range check (annex_ii_number is null or annex_ii_number between 1 and 14)
);

comment on table public.allergens is 'Reference list of the 14 EU-regulated allergens (Regulation 1169/2011, Annex II). Not tenant-owned.';

-- -----------------------------------------------------------------------------
-- dietary_attributes — vegetarian, vegan, etc. Global reference data.
-- -----------------------------------------------------------------------------
create table public.dietary_attributes (
  id             uuid primary key default gen_random_uuid(),
  code           text not null unique,
  name_en        text not null,
  name_it        text not null,
  description_en text,
  description_it text,
  -- A dietary attribute is a preference claim, never a safety claim. The agent
  -- must not use "vegan" to answer a milk-allergy question, and this flag makes
  -- that distinction explicit in the data rather than only in the prompt.
  is_safety_claim boolean not null default false,
  created_at     timestamptz not null default now(),
  constraint dietary_attributes_code_format check (code ~ '^[a-z_]+$')
);

comment on column public.dietary_attributes.is_safety_claim is 'False for every V1 attribute: dietary labels are preferences and must never be used to answer an allergy question.';

-- -----------------------------------------------------------------------------
-- knowledge_articles — free-text business information (policies, parking, …)
-- -----------------------------------------------------------------------------
create table public.knowledge_articles (
  id               uuid primary key default gen_random_uuid(),
  organisation_id  uuid not null references public.organisations (id) on delete cascade,
  location_id      uuid not null references public.locations (id) on delete cascade,
  category         app.knowledge_category not null default 'general',
  slug             citext not null,
  title_en         text not null,
  title_it         text,
  body_en          text not null,
  body_it          text,
  tags             text[] not null default '{}',
  display_order    integer not null default 0,

  approval_status  app.approval_status not null default 'draft',
  approved_by      uuid references public.profiles (id) on delete set null,
  approved_at      timestamptz,
  version          integer not null default 1,
  last_reviewed_at timestamptz,

  created_by       uuid references public.profiles (id) on delete set null,
  updated_by       uuid references public.profiles (id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  unique (location_id, slug),
  constraint knowledge_articles_approved_has_approver
    check (approval_status <> 'approved' or (approved_by is not null and approved_at is not null)),
  constraint knowledge_articles_version_positive check (version > 0)
);

create index knowledge_articles_lookup_idx
  on public.knowledge_articles (location_id, category)
  where approval_status = 'approved';

-- -----------------------------------------------------------------------------
-- frequently_asked_questions
-- -----------------------------------------------------------------------------
create table public.frequently_asked_questions (
  id               uuid primary key default gen_random_uuid(),
  organisation_id  uuid not null references public.organisations (id) on delete cascade,
  location_id      uuid not null references public.locations (id) on delete cascade,
  question_en      text not null,
  question_it      text,
  answer_en        text not null,
  answer_it        text,
  tags             text[] not null default '{}',
  display_order    integer not null default 0,

  approval_status  app.approval_status not null default 'draft',
  approved_by      uuid references public.profiles (id) on delete set null,
  approved_at      timestamptz,
  version          integer not null default 1,
  last_reviewed_at timestamptz,

  created_by       uuid references public.profiles (id) on delete set null,
  updated_by       uuid references public.profiles (id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint faqs_approved_has_approver
    check (approval_status <> 'approved' or (approved_by is not null and approved_at is not null)),
  constraint faqs_version_positive check (version > 0)
);

create index faqs_lookup_idx
  on public.frequently_asked_questions (location_id)
  where approval_status = 'approved';

create index faqs_question_trgm_idx
  on public.frequently_asked_questions using gin (question_en gin_trgm_ops);

-- -----------------------------------------------------------------------------
-- menu_categories
-- -----------------------------------------------------------------------------
create table public.menu_categories (
  id               uuid primary key default gen_random_uuid(),
  organisation_id  uuid not null references public.organisations (id) on delete cascade,
  location_id      uuid not null references public.locations (id) on delete cascade,
  slug             citext not null,
  name_en          text not null,
  name_it          text,
  description_en   text,
  description_it   text,
  display_order    integer not null default 0,
  is_active        boolean not null default true,

  approval_status  app.approval_status not null default 'draft',
  approved_by      uuid references public.profiles (id) on delete set null,
  approved_at      timestamptz,
  version          integer not null default 1,
  last_reviewed_at timestamptz,

  created_by       uuid references public.profiles (id) on delete set null,
  updated_by       uuid references public.profiles (id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  unique (location_id, slug),
  constraint menu_categories_approved_has_approver
    check (approval_status <> 'approved' or (approved_by is not null and approved_at is not null)),
  constraint menu_categories_version_positive check (version > 0)
);

-- -----------------------------------------------------------------------------
-- menu_items
-- -----------------------------------------------------------------------------
create table public.menu_items (
  id               uuid primary key default gen_random_uuid(),
  organisation_id  uuid not null references public.organisations (id) on delete cascade,
  location_id      uuid not null references public.locations (id) on delete cascade,
  category_id      uuid not null references public.menu_categories (id) on delete cascade,
  slug             citext not null,
  name_en          text not null,
  name_it          text,
  description_en   text,
  description_it   text,
  -- Money is stored in minor units as an integer. Never a float.
  price_cents      integer,
  currency         char(3) not null default 'EUR',
  is_available     boolean not null default true,
  display_order    integer not null default 0,

  -- Free-text kitchen note about shared equipment / shared fryer / shared
  -- surfaces. Read out verbatim; never summarised or reasoned about.
  cross_contamination_notes text,

  approval_status  app.approval_status not null default 'draft',
  approved_by      uuid references public.profiles (id) on delete set null,
  approved_at      timestamptz,
  version          integer not null default 1,
  last_reviewed_at timestamptz,

  created_by       uuid references public.profiles (id) on delete set null,
  updated_by       uuid references public.profiles (id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  unique (location_id, slug),
  constraint menu_items_price_non_negative check (price_cents is null or price_cents >= 0),
  constraint menu_items_currency_format check (currency ~ '^[A-Z]{3}$'),
  constraint menu_items_approved_has_approver
    check (approval_status <> 'approved' or (approved_by is not null and approved_at is not null)),
  -- An approved, purchasable item must have a price. The agent is not allowed
  -- to quote "ask us" as if it were a price.
  constraint menu_items_approved_has_price
    check (approval_status <> 'approved' or price_cents is not null),
  constraint menu_items_version_positive check (version > 0)
);

comment on column public.menu_items.price_cents is 'Minor currency units (euro cents). Integer, never floating point.';
comment on column public.menu_items.cross_contamination_notes is 'Verbatim kitchen note. The agent reads it; it never infers from it.';

create index menu_items_category_idx on public.menu_items (category_id, display_order);
create index menu_items_lookup_idx
  on public.menu_items (location_id)
  where approval_status = 'approved' and is_available;
create index menu_items_name_trgm_idx on public.menu_items using gin (name_en gin_trgm_ops);

-- -----------------------------------------------------------------------------
-- menu_item_allergens — the safety-critical table
-- -----------------------------------------------------------------------------
create table public.menu_item_allergens (
  id               uuid primary key default gen_random_uuid(),
  organisation_id  uuid not null references public.organisations (id) on delete cascade,
  menu_item_id     uuid not null references public.menu_items (id) on delete cascade,
  allergen_id      uuid not null references public.allergens (id) on delete restrict,
  -- Three states, never a boolean: 'contains' and 'may_contain' are different
  -- facts and a caller with a severe allergy needs to hear which one applies.
  presence         app.allergen_presence not null,
  notes_en         text,
  notes_it         text,
  cross_contamination_notes text,

  approval_status  app.approval_status not null default 'draft',
  approved_by      uuid references public.profiles (id) on delete set null,
  approved_at      timestamptz,
  version          integer not null default 1,
  last_reviewed_at timestamptz,

  created_by       uuid references public.profiles (id) on delete set null,
  updated_by       uuid references public.profiles (id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  unique (menu_item_id, allergen_id),
  constraint menu_item_allergens_approved_has_approver
    check (approval_status <> 'approved' or (approved_by is not null and approved_at is not null)),
  -- A 'free_from' claim is the most dangerous statement in the system. It may
  -- only exist as an approved row that has been reviewed, and it must carry an
  -- explicit cross-contamination note (which may state that there is a risk).
  constraint menu_item_allergens_free_from_requires_review
    check (
      presence <> 'free_from'
      or (approval_status <> 'approved')
      or (last_reviewed_at is not null and cross_contamination_notes is not null)
    ),
  constraint menu_item_allergens_version_positive check (version > 0)
);

comment on table public.menu_item_allergens is 'Declared allergen facts for a dish. The only source the agent may use for an allergen answer.';
comment on constraint menu_item_allergens_free_from_requires_review on public.menu_item_allergens
  is 'An approved "free from" claim must have been reviewed and must carry a cross-contamination note.';

create index menu_item_allergens_item_idx on public.menu_item_allergens (menu_item_id);
create index menu_item_allergens_allergen_idx on public.menu_item_allergens (allergen_id);
create index menu_item_allergens_approved_idx
  on public.menu_item_allergens (menu_item_id)
  where approval_status = 'approved';

-- -----------------------------------------------------------------------------
-- menu_item_dietary_attributes
-- -----------------------------------------------------------------------------
create table public.menu_item_dietary_attributes (
  id                    uuid primary key default gen_random_uuid(),
  organisation_id       uuid not null references public.organisations (id) on delete cascade,
  menu_item_id          uuid not null references public.menu_items (id) on delete cascade,
  dietary_attribute_id  uuid not null references public.dietary_attributes (id) on delete restrict,
  notes_en              text,
  notes_it              text,

  approval_status       app.approval_status not null default 'draft',
  approved_by           uuid references public.profiles (id) on delete set null,
  approved_at           timestamptz,
  version               integer not null default 1,
  last_reviewed_at      timestamptz,

  created_by            uuid references public.profiles (id) on delete set null,
  updated_by            uuid references public.profiles (id) on delete set null,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  unique (menu_item_id, dietary_attribute_id),
  constraint menu_item_dietary_approved_has_approver
    check (approval_status <> 'approved' or (approved_by is not null and approved_at is not null)),
  constraint menu_item_dietary_version_positive check (version > 0)
);

create index menu_item_dietary_item_idx on public.menu_item_dietary_attributes (menu_item_id);

-- -----------------------------------------------------------------------------
-- updated_at + version triggers
-- -----------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'knowledge_articles',
    'frequently_asked_questions',
    'menu_categories',
    'menu_items',
    'menu_item_allergens',
    'menu_item_dietary_attributes'
  ]
  loop
    execute format(
      'create trigger %I before update on public.%I for each row execute function app.set_updated_at()',
      t || '_set_updated_at', t);
    execute format(
      'create trigger %I before update on public.%I for each row execute function app.bump_version()',
      t || '_bump_version', t);
  end loop;
end
$$;

-- ─── 20260824000500_calls_and_reservations.sql ───
-- =============================================================================
-- 0005 · Calls, transcripts, reservations and operational records
-- =============================================================================

-- -----------------------------------------------------------------------------
-- reservations
-- -----------------------------------------------------------------------------
-- Declared before call_sessions so call_sessions can reference it; the reverse
-- link (reservations.source_call_id) is added at the end of this migration.
create table public.reservations (
  id                    uuid primary key default gen_random_uuid(),
  organisation_id       uuid not null references public.organisations (id) on delete cascade,
  location_id           uuid not null references public.locations (id) on delete cascade,
  source                app.reservation_source not null default 'voice_agent',
  source_call_id        uuid,

  status                app.reservation_status not null default 'pending',
  provider              app.booking_provider not null default 'internal',
  provider_reservation_id text,

  customer_name         text not null,
  customer_phone_e164   text,
  customer_email        citext,
  party_size            integer not null,
  reserved_for          timestamptz not null,
  duration_minutes      integer not null default 90,

  special_requirements  text,
  -- Any allergy the caller mentioned, stored verbatim and flagged. This is
  -- health data under GDPR Article 9 — see SECURITY_AND_PRIVACY.md §8.
  allergy_notes         text,
  has_allergy_flag      boolean not null default false,

  confirmation_sms_status app.sms_status,
  -- Populated when status = 'failed'. Operator-facing, never spoken to a caller.
  failure_reason        text,

  created_by            uuid references public.profiles (id) on delete set null,
  cancelled_at          timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  constraint reservations_party_size_bounds check (party_size between 1 and 500),
  constraint reservations_duration_bounds check (duration_minutes between 15 and 480),
  constraint reservations_phone_format
    check (customer_phone_e164 is null or customer_phone_e164 ~ '^\+[1-9][0-9]{6,14}$'),
  -- A confirmed reservation must have a provider reference. This is the database
  -- half of "never tell a caller they are booked unless the provider said so".
  constraint reservations_confirmed_has_provider_ref
    check (status <> 'confirmed' or provider_reservation_id is not null),
  constraint reservations_failed_has_reason
    check (status <> 'failed' or failure_reason is not null),
  constraint reservations_allergy_flag_consistent
    check (not has_allergy_flag or allergy_notes is not null)
);

comment on table public.reservations is 'A booking. status = confirmed is only reachable with a provider reference.';
comment on constraint reservations_confirmed_has_provider_ref on public.reservations
  is 'Database-level guard against a false confirmation (PRD AC-04).';

create index reservations_location_time_idx on public.reservations (location_id, reserved_for);
create index reservations_status_idx on public.reservations (organisation_id, status);
create index reservations_phone_idx on public.reservations (customer_phone_e164);

-- -----------------------------------------------------------------------------
-- call_sessions
-- -----------------------------------------------------------------------------
create table public.call_sessions (
  id                    uuid primary key default gen_random_uuid(),
  organisation_id       uuid not null references public.organisations (id) on delete cascade,
  location_id           uuid not null references public.locations (id) on delete cascade,

  provider              text not null default 'retell',
  provider_call_id      text not null,

  direction             app.call_direction not null default 'inbound',
  status                app.call_status not null default 'in_progress',
  outcome               app.call_outcome,

  started_at            timestamptz not null default now(),
  ended_at              timestamptz,
  duration_seconds      integer,

  -- Caller identity. The raw number is masked in the UI for the staff and
  -- viewer roles; caller_ref is a stable salted hash used for correlation so
  -- analytics never need the raw number.
  caller_number_e164    text,
  caller_ref            text,
  caller_name           text,

  initial_language      app.language_code,
  detected_language     app.language_code,

  primary_intent        text,
  intents               text[] not null default '{}',

  reservation_id        uuid references public.reservations (id) on delete set null,
  transfer_status       app.transfer_status not null default 'not_requested',
  transfer_target_e164  text,
  escalation_reason     app.escalation_reason,
  escalation_notes      text,

  recording_url         text,
  recording_consent_given boolean not null default false,

  -- Set from the organisation's retention policy when the call is created; the
  -- retention job deletes transcript rows past this point.
  retention_expires_at  timestamptz,

  cost_cents            integer,
  metadata              jsonb not null default '{}'::jsonb,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  unique (provider, provider_call_id),
  constraint call_sessions_duration_non_negative
    check (duration_seconds is null or duration_seconds >= 0),
  constraint call_sessions_ended_after_started
    check (ended_at is null or ended_at >= started_at),
  constraint call_sessions_completed_has_end
    check (status <> 'completed' or ended_at is not null),
  constraint call_sessions_transfer_target_format
    check (transfer_target_e164 is null or transfer_target_e164 ~ '^\+[1-9][0-9]{6,14}$'),
  -- A recording may only be stored if consent was recorded for that call.
  constraint call_sessions_recording_requires_consent
    check (recording_url is null or recording_consent_given),
  -- An escalated or transferred call must say why.
  constraint call_sessions_transfer_has_reason
    check (transfer_status = 'not_requested' or escalation_reason is not null)
);

comment on table public.call_sessions is 'One inbound (or outbound) telephone call.';
comment on column public.call_sessions.caller_ref is 'Salted hash of the caller number, used for correlation without handling the raw number.';
comment on constraint call_sessions_recording_requires_consent on public.call_sessions
  is 'GDPR: no stored recording without recorded consent.';

create index call_sessions_org_started_idx on public.call_sessions (organisation_id, started_at desc);
create index call_sessions_location_idx on public.call_sessions (location_id, started_at desc);
create index call_sessions_outcome_idx on public.call_sessions (organisation_id, outcome);
create index call_sessions_escalation_idx on public.call_sessions (organisation_id, escalation_reason)
  where escalation_reason is not null;
create index call_sessions_retention_idx on public.call_sessions (retention_expires_at)
  where retention_expires_at is not null;

alter table public.reservations
  add constraint reservations_source_call_fk
  foreign key (source_call_id) references public.call_sessions (id) on delete set null;

create index reservations_source_call_idx on public.reservations (source_call_id);

-- -----------------------------------------------------------------------------
-- call_events — append-only audit trail of everything the agent did
-- -----------------------------------------------------------------------------
create table public.call_events (
  id               uuid primary key default gen_random_uuid(),
  organisation_id  uuid not null references public.organisations (id) on delete cascade,
  call_session_id  uuid not null references public.call_sessions (id) on delete cascade,
  sequence         integer not null,
  event_type       app.call_event_type not null,
  tool_name        text,
  -- Redacted payload. Never contains a full caller number or transcript body.
  payload          jsonb not null default '{}'::jsonb,
  error_code       text,
  error_message    text,
  occurred_at      timestamptz not null default now(),
  created_at       timestamptz not null default now(),

  unique (call_session_id, sequence),
  constraint call_events_sequence_positive check (sequence >= 0),
  constraint call_events_failure_has_detail
    check (event_type not in ('tool_failed', 'transfer_failed', 'sms_failed', 'reservation_failed')
           or error_code is not null)
);

comment on table public.call_events is 'Append-only timeline of tool calls, results and state changes for one call. No UPDATE or DELETE policy exists for tenant users.';

create index call_events_call_idx on public.call_events (call_session_id, sequence);
create index call_events_type_idx on public.call_events (organisation_id, event_type);

-- -----------------------------------------------------------------------------
-- call_transcripts — turn-level transcript
-- -----------------------------------------------------------------------------
create table public.call_transcripts (
  id               uuid primary key default gen_random_uuid(),
  organisation_id  uuid not null references public.organisations (id) on delete cascade,
  call_session_id  uuid not null references public.call_sessions (id) on delete cascade,
  turn_index       integer not null,
  speaker          app.speaker not null,
  content          text not null,
  language         app.language_code,
  started_at_ms    integer,
  ended_at_ms      integer,
  confidence       numeric(4, 3),
  created_at       timestamptz not null default now(),

  unique (call_session_id, turn_index),
  constraint call_transcripts_turn_non_negative check (turn_index >= 0),
  constraint call_transcripts_confidence_range
    check (confidence is null or (confidence >= 0 and confidence <= 1)),
  constraint call_transcripts_timing_ordered
    check (ended_at_ms is null or started_at_ms is null or ended_at_ms >= started_at_ms)
);

comment on table public.call_transcripts is 'Personal data with the shortest retention in the system (default 90 days).';

create index call_transcripts_call_idx on public.call_transcripts (call_session_id, turn_index);

-- -----------------------------------------------------------------------------
-- call_summaries
-- -----------------------------------------------------------------------------
create table public.call_summaries (
  id               uuid primary key default gen_random_uuid(),
  organisation_id  uuid not null references public.organisations (id) on delete cascade,
  call_session_id  uuid not null unique references public.call_sessions (id) on delete cascade,
  language         app.language_code not null default 'en',
  summary          text not null,
  key_points       jsonb not null default '[]'::jsonb,
  detected_intent  text,
  sentiment        text,
  model            text,
  generated_at     timestamptz not null default now(),
  created_at       timestamptz not null default now(),
  constraint call_summaries_sentiment_values
    check (sentiment is null or sentiment in ('positive', 'neutral', 'negative'))
);

create index call_summaries_call_idx on public.call_summaries (call_session_id);

-- -----------------------------------------------------------------------------
-- sms_messages
-- -----------------------------------------------------------------------------
create table public.sms_messages (
  id               uuid primary key default gen_random_uuid(),
  organisation_id  uuid not null references public.organisations (id) on delete cascade,
  location_id      uuid not null references public.locations (id) on delete cascade,
  call_session_id  uuid references public.call_sessions (id) on delete set null,
  reservation_id   uuid references public.reservations (id) on delete set null,
  provider         text not null default 'twilio',
  provider_message_id text,
  to_number_e164   text not null,
  template_key     text not null,
  language         app.language_code not null default 'en',
  status           app.sms_status not null default 'queued',
  error_code       text,
  sent_at          timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint sms_messages_to_format check (to_number_e164 ~ '^\+[1-9][0-9]{6,14}$'),
  constraint sms_messages_failed_has_code
    check (status not in ('failed', 'undelivered') or error_code is not null)
);

comment on table public.sms_messages is 'Message bodies are deliberately NOT stored: only the template key and the variables needed for support.';

create index sms_messages_org_idx on public.sms_messages (organisation_id, created_at desc);

-- -----------------------------------------------------------------------------
-- webhook_events — idempotency gate for every inbound vendor webhook
-- -----------------------------------------------------------------------------
create table public.webhook_events (
  id               uuid primary key default gen_random_uuid(),
  vendor           text not null,
  event_id         text not null,
  event_type       text,
  organisation_id  uuid references public.organisations (id) on delete set null,
  received_at      timestamptz not null default now(),
  processed_at     timestamptz,
  attempts         integer not null default 0,
  last_error       text,
  payload_digest   text,
  unique (vendor, event_id)
);

comment on table public.webhook_events is 'Unique (vendor, event_id) is the idempotency gate: a duplicate delivery conflicts and is acknowledged without reprocessing.';

create index webhook_events_unprocessed_idx on public.webhook_events (vendor, received_at)
  where processed_at is null;

-- -----------------------------------------------------------------------------
-- retention_jobs — evidence that deletion actually happened
-- -----------------------------------------------------------------------------
create table public.retention_jobs (
  id                  uuid primary key default gen_random_uuid(),
  organisation_id     uuid references public.organisations (id) on delete cascade,
  started_at          timestamptz not null default now(),
  finished_at         timestamptz,
  transcripts_deleted integer not null default 0,
  summaries_deleted   integer not null default 0,
  recordings_deleted  integer not null default 0,
  calls_anonymised    integer not null default 0,
  status              text not null default 'running',
  error_message       text,
  constraint retention_jobs_status_values
    check (status in ('running', 'succeeded', 'failed'))
);

comment on table public.retention_jobs is 'Audit record of each retention run. "Retention is configured" is not evidence; this table is.';

-- -----------------------------------------------------------------------------
-- Triggers
-- -----------------------------------------------------------------------------
create trigger reservations_set_updated_at
  before update on public.reservations
  for each row execute function app.set_updated_at();

create trigger call_sessions_set_updated_at
  before update on public.call_sessions
  for each row execute function app.set_updated_at();

create trigger sms_messages_set_updated_at
  before update on public.sms_messages
  for each row execute function app.set_updated_at();

-- Keep duration_seconds consistent with started_at/ended_at rather than trusting
-- whatever the vendor sent.
-- SECURITY INVOKER: this trigger only rewrites columns of the row being
-- written, so it needs no elevated privilege.
create or replace function app.set_call_duration()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.ended_at is not null then
    new.duration_seconds := greatest(0, floor(extract(epoch from (new.ended_at - new.started_at)))::integer);
  end if;
  return new;
end;
$$;

create trigger call_sessions_set_duration
  before insert or update on public.call_sessions
  for each row execute function app.set_call_duration();

-- ─── 20260824000600_audit_logs.sql ───
-- =============================================================================
-- 0006 · Audit logging
-- =============================================================================

create table public.audit_logs (
  id               uuid primary key default gen_random_uuid(),
  -- Nullable: platform-level actions (support access, plan changes) are not
  -- owned by a tenant.
  organisation_id  uuid references public.organisations (id) on delete cascade,
  actor_user_id    uuid references public.profiles (id) on delete set null,
  actor_email      citext,
  actor_role       app.org_role,
  action           app.audit_action not null,
  entity_type      text not null,
  entity_id        uuid,
  before           jsonb,
  after            jsonb,
  -- Free-text justification, required for the actions where "why" matters.
  reason           text,
  ip_address       inet,
  user_agent       text,
  occurred_at      timestamptz not null default now(),

  constraint audit_logs_unmask_has_reason
    check (action <> 'unmask_pii' or reason is not null),
  constraint audit_logs_change_has_payload
    check (action not in ('insert', 'update', 'delete') or before is not null or after is not null)
);

comment on table public.audit_logs is 'Append-only. Tenant users may read their organisation''s entries; nobody may update or delete them through the API.';
comment on constraint audit_logs_unmask_has_reason on public.audit_logs
  is 'Revealing a caller''s full phone number requires a stated reason.';

create index audit_logs_org_time_idx on public.audit_logs (organisation_id, occurred_at desc);
create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);
create index audit_logs_actor_idx on public.audit_logs (actor_user_id, occurred_at desc);

-- -----------------------------------------------------------------------------
-- Generic row auditor
-- -----------------------------------------------------------------------------
-- Attached to every table where a silent change would matter. Records the full
-- before/after image, plus a distinct 'approve'/'unapprove' action when the
-- approval_status of a safety-relevant row changes, so an allergen approval is
-- searchable as such rather than buried inside a generic UPDATE.
create or replace function app.audit_row()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_action        app.audit_action;
  v_org           uuid;
  v_before        jsonb;
  v_after         jsonb;
  v_actor         uuid := auth.uid();
  -- text, not citext: search_path is pinned to '' inside this function, so an
  -- extension type would not resolve by bare name.
  v_actor_email   text;
  v_old_status    text;
  v_new_status    text;
begin
  if tg_op = 'INSERT' then
    v_action := 'insert';
    v_after  := to_jsonb(new);
    v_org    := (v_after ->> 'organisation_id')::uuid;
  elsif tg_op = 'UPDATE' then
    v_action := 'update';
    v_before := to_jsonb(old);
    v_after  := to_jsonb(new);
    v_org    := (v_after ->> 'organisation_id')::uuid;

    v_old_status := v_before ->> 'approval_status';
    v_new_status := v_after ->> 'approval_status';
    if v_old_status is distinct from v_new_status then
      if v_new_status = 'approved' then
        v_action := 'approve';
      elsif v_old_status = 'approved' then
        v_action := 'unapprove';
      end if;
    end if;
  else
    v_action := 'delete';
    v_before := to_jsonb(old);
    v_org    := (v_before ->> 'organisation_id')::uuid;
  end if;

  select p.email into v_actor_email from public.profiles p where p.id = v_actor;

  insert into public.audit_logs (
    organisation_id, actor_user_id, actor_email, action, entity_type, entity_id, before, after
  )
  values (
    v_org,
    v_actor,
    v_actor_email,
    v_action,
    tg_table_name,
    coalesce((v_after ->> 'id')::uuid, (v_before ->> 'id')::uuid),
    v_before,
    v_after
  );

  return coalesce(new, old);
end;
$$;

comment on function app.audit_row() is 'AFTER INSERT/UPDATE/DELETE trigger: writes a full before/after image to audit_logs.';

-- Tables where every change is audited.
do $$
declare
  t text;
begin
  foreach t in array array[
    'organisations',
    'organisation_members',
    'organisation_member_locations',
    'locations',
    'agent_configurations',
    'business_hours',
    'escalation_rules',
    'knowledge_articles',
    'frequently_asked_questions',
    'menu_categories',
    'menu_items',
    'menu_item_allergens',
    'menu_item_dietary_attributes',
    'subscriptions'
  ]
  loop
    execute format(
      'create trigger %I after insert or update or delete on public.%I
         for each row execute function app.audit_row()',
      t || '_audit', t);
  end loop;
end
$$;

-- ─── 20260824000700_authorisation_and_integrity.sql ───
-- =============================================================================
-- 0007 · Authorisation helpers and integrity triggers
-- =============================================================================
-- Every function here is SECURITY DEFINER with a pinned empty search_path.
--
-- SECURITY DEFINER is required, not cosmetic: RLS policies on the business
-- tables need to consult organisation_members, which is itself protected by
-- RLS. Reading it through a definer function is what breaks that recursion.
-- The empty search_path stops a tenant from shadowing a name and hijacking
-- execution inside a privileged function.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Trusted backend detection
-- -----------------------------------------------------------------------------
-- service_role (webhooks, voice tools, cron) and the database superuser
-- (migrations, seed) operate without an end-user identity. They are trusted;
-- everybody else must prove authorisation through a membership.
-- SECURITY INVOKER, deliberately and importantly.
--
-- This function asks "who is calling?". SECURITY DEFINER would replace
-- current_user with the function's owner — postgres on Supabase — so it would
-- return true for everybody, silently disabling every guard that depends on it.
-- That mistake was caught by tests/database/integrity.test.ts and the tests
-- stay as the regression guard.
--
-- SECURITY INVOKER is safe here: the function only reads pg_roles, which is
-- world-readable, and the pinned search_path still prevents name shadowing.
create or replace function app.is_trusted_backend()
returns boolean
language sql
stable
set search_path = ''
as $$
  -- current_user is an SQL keyword, not a function call: it cannot be
  -- schema-qualified and is unaffected by search_path.
  select
    current_user in ('postgres', 'service_role', 'supabase_admin', 'supabase_auth_admin')
    or exists (
      select 1 from pg_catalog.pg_roles r
      where r.rolname = current_user and r.rolsuper
    );
$$;

comment on function app.is_trusted_backend() is 'True for service_role, the Supabase admin roles and the superuser. Never true for an end user.';

-- -----------------------------------------------------------------------------
-- Identity
-- -----------------------------------------------------------------------------
create or replace function app.current_user_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid();
$$;

create or replace function app.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.platform_role = 'platform_admin'
  );
$$;

-- -----------------------------------------------------------------------------
-- Organisation membership
-- -----------------------------------------------------------------------------
create or replace function app.org_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select m.organisation_id
  from public.organisation_members m
  where m.user_id = auth.uid()
    and m.status = 'active';
$$;

comment on function app.org_ids() is 'The organisations the current user actively belongs to. The single source of tenancy for every RLS policy.';

create or replace function app.is_org_member(p_org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_org is not null and (
    app.is_platform_admin()
    or exists (
      select 1 from public.organisation_members m
      where m.organisation_id = p_org
        and m.user_id = auth.uid()
        and m.status = 'active'
    )
  );
$$;

create or replace function app.org_role_of(p_org uuid)
returns app.org_role
language sql
stable
security definer
set search_path = ''
as $$
  select m.role
  from public.organisation_members m
  where m.organisation_id = p_org
    and m.user_id = auth.uid()
    and m.status = 'active';
$$;

create or replace function app.has_org_role(p_org uuid, p_roles app.org_role[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_org is not null and (
    app.is_platform_admin()
    or exists (
      select 1 from public.organisation_members m
      where m.organisation_id = p_org
        and m.user_id = auth.uid()
        and m.status = 'active'
        and m.role = any (p_roles)
    )
  );
$$;

-- Owner or admin: may change anything inside the organisation, including
-- membership, billing and every location.
create or replace function app.can_admin_org(p_org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select app.has_org_role(
    p_org,
    array['organisation_owner', 'organisation_admin']::app.org_role[]
  );
$$;

create or replace function app.is_org_owner(p_org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select app.has_org_role(p_org, array['organisation_owner']::app.org_role[]);
$$;

-- -----------------------------------------------------------------------------
-- Location scoping
-- -----------------------------------------------------------------------------
-- Owners and admins implicitly manage every location in their organisation.
-- A location_manager manages only the locations explicitly assigned to them.
-- Staff and viewers manage nothing.
create or replace function app.managed_location_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select l.id
  from public.locations l
  join public.organisation_members m
    on m.organisation_id = l.organisation_id
   and m.user_id = auth.uid()
   and m.status = 'active'
  where l.deleted_at is null
    and (
      m.role in ('organisation_owner', 'organisation_admin')
      or (
        m.role = 'location_manager'
        and exists (
          select 1 from public.organisation_member_locations ml
          where ml.member_id = m.id and ml.location_id = l.id
        )
      )
    );
$$;

comment on function app.managed_location_ids() is 'Locations the current user may modify. Owners/admins: all. Location managers: only assigned ones.';

create or replace function app.can_manage_location(p_location uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_location is not null and (
    app.is_platform_admin()
    or exists (select 1 from app.managed_location_ids() lid where lid = p_location)
  );
$$;

-- Approval of customer-facing content (menu, allergens, FAQs, policies) is the
-- same privilege as managing the location. It is deliberately NOT available to
-- staff or viewers: approval is the gate that lets data reach a phone call.
create or replace function app.can_approve_location(p_location uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select app.can_manage_location(p_location);
$$;

-- Staff may update operational records (reservation status, call outcome notes)
-- for locations in their organisation. Viewers may not.
create or replace function app.can_operate_org(p_org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select app.has_org_role(
    p_org,
    array['organisation_owner', 'organisation_admin', 'location_manager', 'staff']::app.org_role[]
  );
$$;

-- -----------------------------------------------------------------------------
-- Automatic profile creation
-- -----------------------------------------------------------------------------
create or replace function app.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, locale)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(
      nullif(new.raw_user_meta_data ->> 'locale', '')::app.language_code,
      'en'::app.language_code
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

comment on function app.handle_new_user() is 'Creates the application profile for a new auth.users row. platform_role is never taken from user metadata.';

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function app.handle_new_user();

-- -----------------------------------------------------------------------------
-- Privilege-escalation guards
-- -----------------------------------------------------------------------------
-- A tenant must never be able to make themselves a platform administrator,
-- even if a bug in the application lets them PATCH their own profile row.
-- SECURITY INVOKER: this guard branches on is_trusted_backend(), which must see
-- the real calling role. Privileged lookups are delegated to the SECURITY
-- DEFINER helpers above.
create or replace function app.guard_profile_platform_role()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.platform_role is distinct from old.platform_role
     and not app.is_trusted_backend()
     and not app.is_platform_admin() then
    raise exception 'platform_role can only be changed by a platform administrator'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger profiles_guard_platform_role
  before update on public.profiles
  for each row execute function app.guard_profile_platform_role();

-- Membership integrity:
--   * nobody may change their own role (no self-promotion),
--   * only an owner may create or modify an organisation_owner membership,
--   * an organisation may never be left without an active owner.
-- SECURITY INVOKER: this guard branches on is_trusted_backend(), which must see
-- the real calling role. Privileged lookups are delegated to the SECURITY
-- DEFINER helpers above.
create or replace function app.guard_membership_changes()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_org           uuid := coalesce(new.organisation_id, old.organisation_id);
  v_remaining_owners integer;
begin
  if not app.is_trusted_backend() then
    if tg_op = 'UPDATE'
       and old.user_id = auth.uid()
       and new.role is distinct from old.role then
      raise exception 'a member cannot change their own role' using errcode = '42501';
    end if;

    if (tg_op = 'INSERT' and new.role = 'organisation_owner')
       or (tg_op = 'UPDATE' and new.role = 'organisation_owner' and old.role <> 'organisation_owner')
       or (tg_op = 'UPDATE' and old.role = 'organisation_owner' and new.role <> 'organisation_owner') then
      if not (app.is_org_owner(v_org) or app.is_platform_admin()) then
        raise exception 'only an organisation owner can grant or revoke ownership'
          using errcode = '42501';
      end if;
    end if;
  end if;

  -- Minimum-cardinality rule: at least one active owner must remain.
  if (tg_op = 'DELETE' and old.role = 'organisation_owner' and old.status = 'active')
     or (tg_op = 'UPDATE' and old.role = 'organisation_owner' and old.status = 'active'
         and (new.role <> 'organisation_owner' or new.status <> 'active')) then
    select count(*) into v_remaining_owners
    from public.organisation_members m
    where m.organisation_id = v_org
      and m.role = 'organisation_owner'
      and m.status = 'active'
      and m.id <> old.id;

    if v_remaining_owners = 0 then
      raise exception 'an organisation must always have at least one active owner'
        using errcode = '23514';
    end if;
  end if;

  return coalesce(new, old);
end;
$$;

create trigger organisation_members_guard
  before insert or update or delete on public.organisation_members
  for each row execute function app.guard_membership_changes();

-- -----------------------------------------------------------------------------
-- Approval integrity — the mechanism behind the allergen guarantee
-- -----------------------------------------------------------------------------
-- Two rules, enforced for every approvable table:
--
--   1. Only someone who may manage the location can set approval_status to
--      'approved'. The user interface also checks this, but the database is
--      what makes it true.
--
--   2. Any change to the *content* of an approved row drops it back to 'draft'
--      and clears its approver. Editing the allergen list of an approved dish
--      therefore un-approves it automatically, and the agent stops quoting it
--      until a manager approves it again.
--
--      This holds even when the same UPDATE also sets approval_status to
--      'approved': SQL cannot distinguish a deliberate re-approval from a client
--      that simply echoed the column back unchanged, so the safe reading is
--      chosen. Approval is a separate, explicit act — Save, then Approve.
--
-- Bookkeeping columns are excluded from the content comparison so that
-- re-ordering or re-reviewing a row does not un-approve it.
create or replace function app.resolve_approval_location(p_row jsonb)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (p_row ->> 'location_id')::uuid,
    (select mi.location_id
       from public.menu_items mi
      where mi.id = (p_row ->> 'menu_item_id')::uuid)
  );
$$;

-- SECURITY INVOKER: this guard branches on is_trusted_backend(), which must see
-- the real calling role. Privileged lookups are delegated to the SECURITY
-- DEFINER helpers above.
create or replace function app.guard_approval()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  bookkeeping constant text[] := array[
    'approval_status', 'approved_by', 'approved_at', 'version',
    'last_reviewed_at', 'created_at', 'created_by', 'updated_at', 'updated_by',
    'display_order'
  ];
  v_new        jsonb := to_jsonb(new);
  v_old        jsonb;
  v_location   uuid;
  v_content_changed boolean := false;
begin
  v_location := app.resolve_approval_location(v_new);

  -- Rule 1: approving requires the privilege.
  if new.approval_status = 'approved'
     and (tg_op = 'INSERT' or old.approval_status is distinct from 'approved')
     and not app.is_trusted_backend()
     and not app.can_approve_location(v_location) then
    raise exception 'not authorised to approve content for this location'
      using errcode = '42501';
  end if;

  if tg_op = 'UPDATE' then
    v_old := to_jsonb(old);
    v_content_changed := (v_old - bookkeeping) is distinct from (v_new - bookkeeping);

    -- Rule 2: content edited on an approved row -> back to draft.
    if v_content_changed and old.approval_status = 'approved' then
      new.approval_status := 'draft';
      new.approved_by := null;
      new.approved_at := null;
    end if;
  end if;

  -- Keep the approval stamp consistent with the status in every direction.
  if new.approval_status = 'approved' then
    if new.approved_at is null then
      new.approved_at := now();
    end if;
    if new.approved_by is null then
      new.approved_by := auth.uid();
    end if;
    if new.last_reviewed_at is null then
      new.last_reviewed_at := new.approved_at;
    end if;
  else
    new.approved_by := null;
    new.approved_at := null;
  end if;

  return new;
end;
$$;

comment on function app.guard_approval() is 'Enforces who may approve content, and un-approves a row whose content changes without a new approval decision.';

do $$
declare
  t text;
begin
  foreach t in array array[
    'knowledge_articles',
    'frequently_asked_questions',
    'menu_categories',
    'menu_items',
    'menu_item_allergens',
    'menu_item_dietary_attributes'
  ]
  loop
    execute format(
      'create trigger %I before insert or update on public.%I
         for each row execute function app.guard_approval()',
      t || '_guard_approval', t);
  end loop;
end
$$;

-- ─── 20260824000800_row_level_security.sql ───
-- =============================================================================
-- 0008 · Row Level Security
-- =============================================================================
-- The tenancy boundary lives here, in the database, not in application code.
--
-- Design notes
-- ------------
-- * Every policy derives access from app.org_ids() / app.is_org_member(), which
--   read organisation_members for auth.uid(). No policy ever trusts an
--   organisation id supplied by the client, so changing an id in a request
--   cannot reach another tenant's data.
--
-- * Policies are granted TO authenticated only. The anon role additionally has
--   every privilege revoked below, so an unauthenticated request is refused by
--   the grant system before RLS is even consulted.
--
-- * RLS is ENABLED but deliberately NOT FORCED. FORCE ROW LEVEL SECURITY also
--   applies to the table owner, which on Supabase is the same role that runs
--   migrations, the SECURITY DEFINER audit triggers and the seed. Forcing it
--   would break the trusted server-side path that the design explicitly
--   reserves for webhooks, the retention job and administrative operations.
--   Least privilege for tenant users is achieved instead by (a) revoking
--   everything from anon, (b) column-level grants where a role may only touch
--   part of a row, and (c) confining the service-role key to webhook, voice-tool
--   and cron routes in the application. Evaluating FORCE against a real
--   Supabase project is tracked as a Milestone 8 hardening item.
--
-- * Append-only tables (call_events, call_transcripts, call_summaries,
--   audit_logs) have SELECT policies only. There is no UPDATE or DELETE policy
--   for any tenant user, so those rows cannot be rewritten through the API.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Helper: do I share an organisation with this user?
-- -----------------------------------------------------------------------------
create or replace function app.shares_org_with(p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organisation_members mine
    join public.organisation_members theirs
      on theirs.organisation_id = mine.organisation_id
    where mine.user_id = auth.uid()
      and mine.status = 'active'
      and theirs.user_id = p_user
  );
$$;

-- -----------------------------------------------------------------------------
-- Enable RLS on every table in public
-- -----------------------------------------------------------------------------
do $$
declare
  t record;
begin
  for t in
    select tablename from pg_tables where schemaname = 'public'
  loop
    execute format('alter table public.%I enable row level security', t.tablename);
  end loop;
end
$$;

-- =============================================================================
-- profiles
-- =============================================================================
create policy profiles_select on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or app.is_platform_admin()
    or app.shares_org_with(id)
  );

create policy profiles_insert_self on public.profiles
  for insert to authenticated
  with check (id = auth.uid());

create policy profiles_update_self on public.profiles
  for update to authenticated
  using (id = auth.uid() or app.is_platform_admin())
  with check (id = auth.uid() or app.is_platform_admin());

-- No DELETE policy: a profile disappears with its auth.users row.

-- =============================================================================
-- organisations
-- =============================================================================
create policy organisations_select on public.organisations
  for select to authenticated
  using (app.is_org_member(id));

-- Anyone signed in may create an organisation (self-serve onboarding). The
-- founding owner membership is created by the application in the same
-- transaction.
create policy organisations_insert on public.organisations
  for insert to authenticated
  with check (created_by = auth.uid());

create policy organisations_update on public.organisations
  for update to authenticated
  using (app.can_admin_org(id))
  with check (app.can_admin_org(id));

create policy organisations_delete on public.organisations
  for delete to authenticated
  using (app.is_org_owner(id));

-- =============================================================================
-- organisation_members
-- =============================================================================
create policy organisation_members_select on public.organisation_members
  for select to authenticated
  using (user_id = auth.uid() or app.is_org_member(organisation_id));

create policy organisation_members_insert on public.organisation_members
  for insert to authenticated
  with check (app.can_admin_org(organisation_id));

create policy organisation_members_update on public.organisation_members
  for update to authenticated
  using (app.can_admin_org(organisation_id))
  with check (app.can_admin_org(organisation_id));

create policy organisation_members_delete on public.organisation_members
  for delete to authenticated
  using (app.can_admin_org(organisation_id));

-- =============================================================================
-- organisation_member_locations
-- =============================================================================
create policy member_locations_select on public.organisation_member_locations
  for select to authenticated
  using (app.is_org_member(organisation_id));

create policy member_locations_insert on public.organisation_member_locations
  for insert to authenticated
  with check (app.can_admin_org(organisation_id));

create policy member_locations_delete on public.organisation_member_locations
  for delete to authenticated
  using (app.can_admin_org(organisation_id));

-- =============================================================================
-- locations
-- =============================================================================
create policy locations_select on public.locations
  for select to authenticated
  using (app.is_org_member(organisation_id));

create policy locations_insert on public.locations
  for insert to authenticated
  with check (app.can_admin_org(organisation_id));

-- A location_manager may edit the locations assigned to them; owners and
-- admins may edit every location in the organisation.
create policy locations_update on public.locations
  for update to authenticated
  using (app.can_manage_location(id))
  with check (app.can_manage_location(id));

create policy locations_delete on public.locations
  for delete to authenticated
  using (app.can_admin_org(organisation_id));

-- =============================================================================
-- subscriptions — billing is owner/admin only, and never writable from a client
-- =============================================================================
create policy subscriptions_select on public.subscriptions
  for select to authenticated
  using (app.can_admin_org(organisation_id));

-- =============================================================================
-- Reference data: readable by any signed-in user, writable only by us
-- =============================================================================
create policy allergens_select on public.allergens
  for select to authenticated using (true);

create policy allergens_write on public.allergens
  for all to authenticated
  using (app.is_platform_admin())
  with check (app.is_platform_admin());

create policy dietary_attributes_select on public.dietary_attributes
  for select to authenticated using (true);

create policy dietary_attributes_write on public.dietary_attributes
  for all to authenticated
  using (app.is_platform_admin())
  with check (app.is_platform_admin());

-- =============================================================================
-- Location-scoped configuration and knowledge
-- -----------------------------------------------------------------------------
-- Identical shape for every table below:
--   SELECT  any active member of the organisation
--   WRITE   only someone who may manage that specific location
-- Generated in a loop so the rule is stated once and cannot drift between
-- tables; the table list is the audit surface.
-- =============================================================================
do $$
declare
  t text;
begin
  foreach t in array array[
    'agent_configurations',
    'business_hours',
    'escalation_rules',
    'knowledge_articles',
    'frequently_asked_questions',
    'menu_categories',
    'menu_items'
  ]
  loop
    execute format($f$
      create policy %1$I on public.%2$I
        for select to authenticated
        using (app.is_org_member(organisation_id));
    $f$, t || '_select', t);

    execute format($f$
      create policy %1$I on public.%2$I
        for insert to authenticated
        with check (app.is_org_member(organisation_id) and app.can_manage_location(location_id));
    $f$, t || '_insert', t);

    execute format($f$
      create policy %1$I on public.%2$I
        for update to authenticated
        using (app.can_manage_location(location_id))
        with check (app.is_org_member(organisation_id) and app.can_manage_location(location_id));
    $f$, t || '_update', t);

    execute format($f$
      create policy %1$I on public.%2$I
        for delete to authenticated
        using (app.can_manage_location(location_id));
    $f$, t || '_delete', t);
  end loop;
end
$$;

-- =============================================================================
-- Menu child tables — location is resolved through the parent menu item
-- =============================================================================
do $$
declare
  t text;
begin
  foreach t in array array['menu_item_allergens', 'menu_item_dietary_attributes']
  loop
    execute format($f$
      create policy %1$I on public.%2$I
        for select to authenticated
        using (app.is_org_member(organisation_id));
    $f$, t || '_select', t);

    execute format($f$
      create policy %1$I on public.%2$I
        for insert to authenticated
        with check (
          app.is_org_member(organisation_id)
          and app.can_manage_location(
                (select mi.location_id from public.menu_items mi where mi.id = menu_item_id))
        );
    $f$, t || '_insert', t);

    execute format($f$
      create policy %1$I on public.%2$I
        for update to authenticated
        using (
          app.can_manage_location(
            (select mi.location_id from public.menu_items mi where mi.id = menu_item_id))
        )
        with check (
          app.is_org_member(organisation_id)
          and app.can_manage_location(
                (select mi.location_id from public.menu_items mi where mi.id = menu_item_id))
        );
    $f$, t || '_update', t);

    execute format($f$
      create policy %1$I on public.%2$I
        for delete to authenticated
        using (
          app.can_manage_location(
            (select mi.location_id from public.menu_items mi where mi.id = menu_item_id))
        );
    $f$, t || '_delete', t);
  end loop;
end
$$;

-- =============================================================================
-- Call records — readable by the organisation, written only by the backend
-- =============================================================================
create policy call_sessions_select on public.call_sessions
  for select to authenticated
  using (app.is_org_member(organisation_id));

-- Staff may annotate a call (caller name, escalation note) but may not rewrite
-- its outcome, timings or transfer state. Which columns that means is enforced
-- by the column-level GRANT further down, not by this policy.
create policy call_sessions_annotate on public.call_sessions
  for update to authenticated
  using (app.can_operate_org(organisation_id))
  with check (app.can_operate_org(organisation_id));

create policy call_events_select on public.call_events
  for select to authenticated
  using (app.is_org_member(organisation_id));

create policy call_transcripts_select on public.call_transcripts
  for select to authenticated
  using (app.is_org_member(organisation_id));

create policy call_summaries_select on public.call_summaries
  for select to authenticated
  using (app.is_org_member(organisation_id));

create policy sms_messages_select on public.sms_messages
  for select to authenticated
  using (app.is_org_member(organisation_id));

-- =============================================================================
-- reservations — the one operational table staff may actually write
-- =============================================================================
create policy reservations_select on public.reservations
  for select to authenticated
  using (app.is_org_member(organisation_id));

create policy reservations_insert on public.reservations
  for insert to authenticated
  with check (app.is_org_member(organisation_id) and app.can_operate_org(organisation_id));

create policy reservations_update on public.reservations
  for update to authenticated
  using (app.can_operate_org(organisation_id))
  with check (app.is_org_member(organisation_id) and app.can_operate_org(organisation_id));

create policy reservations_delete on public.reservations
  for delete to authenticated
  using (app.can_manage_location(location_id));

-- =============================================================================
-- audit_logs — owner/admin may read, nobody may write through the API
-- =============================================================================
create policy audit_logs_select on public.audit_logs
  for select to authenticated
  using (organisation_id is not null and app.can_admin_org(organisation_id));

-- =============================================================================
-- retention_jobs — evidence of deletion, readable by owner/admin
-- =============================================================================
create policy retention_jobs_select on public.retention_jobs
  for select to authenticated
  using (organisation_id is not null and app.can_admin_org(organisation_id));

-- =============================================================================
-- webhook_events — no tenant access at all.
-- RLS is enabled with no policy, which denies every authenticated request.
-- Only the service role (BYPASSRLS) can read or write it.
-- =============================================================================

-- =============================================================================
-- Grants
-- =============================================================================
-- anon gets nothing on business data. An unauthenticated request is refused by
-- the grant system before any policy runs.
revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
revoke all on all functions in schema public from anon;

grant usage on schema public to authenticated, service_role;
grant usage on schema app to authenticated, service_role;

-- Read everything (RLS decides which rows), write only where a policy exists.
grant select on all tables in schema public to authenticated;

grant insert, update, delete on
  public.organisations,
  public.organisation_members,
  public.organisation_member_locations,
  public.locations,
  public.agent_configurations,
  public.business_hours,
  public.escalation_rules,
  public.knowledge_articles,
  public.frequently_asked_questions,
  public.menu_categories,
  public.menu_items,
  public.menu_item_allergens,
  public.menu_item_dietary_attributes,
  public.reservations
to authenticated;

grant insert, update on public.profiles to authenticated;

-- Column-level grant: this is what "staff may update only the operational
-- information explicitly allowed by their role" means in practice for a call
-- record. Even with the annotate policy satisfied, no other column is writable.
grant update (caller_name, escalation_notes) on public.call_sessions to authenticated;

-- Append-only tables: SELECT only for tenant users.
revoke insert, update, delete on
  public.call_events,
  public.call_transcripts,
  public.call_summaries,
  public.audit_logs,
  public.sms_messages,
  public.retention_jobs,
  public.subscriptions,
  public.allergens,
  public.dietary_attributes,
  public.webhook_events
from authenticated;

-- Reference data may be maintained by a platform administrator through the API.
grant insert, update, delete on public.allergens, public.dietary_attributes to authenticated;

-- The trusted backend.
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;

-- Authorisation helpers must be callable from inside policies.
grant execute on all functions in schema app to authenticated, service_role;

-- ─── 20260824000900_agent_read_surface.sql ───
-- =============================================================================
-- 0009 · The agent read surface — approved data only
-- =============================================================================
-- This schema is the ONLY thing the voice agent's tool endpoints are allowed to
-- query. Every object in it filters on approval_status = 'approved'.
--
-- Why a separate schema rather than "remember to add WHERE approved":
--   * a forgotten predicate in one query is a silent safety failure,
--   * a schema boundary is greppable, reviewable and testable,
--   * the regression test in tests/integration/agent-surface.test.ts asserts
--     that nothing unapproved can come out of any object in here, so the rule
--     is checked by CI rather than by discipline.
--
-- Access: EXECUTE / SELECT is granted to service_role only. The dashboard roles
-- read the underlying tables (including drafts) through RLS instead.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Views
-- -----------------------------------------------------------------------------
create view agent.approved_menu_categories
with (security_barrier = true) as
  select c.id, c.organisation_id, c.location_id, c.slug,
         c.name_en, c.name_it, c.description_en, c.description_it, c.display_order
  from public.menu_categories c
  where c.approval_status = 'approved'
    and c.is_active;

create view agent.approved_menu_items
with (security_barrier = true) as
  select i.id, i.organisation_id, i.location_id, i.category_id, i.slug,
         i.name_en, i.name_it, i.description_en, i.description_it,
         i.price_cents, i.currency, i.cross_contamination_notes,
         i.display_order, i.last_reviewed_at, i.version
  from public.menu_items i
  join agent.approved_menu_categories c on c.id = i.category_id
  where i.approval_status = 'approved'
    and i.is_available;

comment on view agent.approved_menu_items is 'Approved, available dishes in approved categories. An unapproved category hides its items too.';

create view agent.approved_menu_item_allergens
with (security_barrier = true) as
  select a.id, a.organisation_id, a.menu_item_id, a.allergen_id,
         a.presence, a.notes_en, a.notes_it, a.cross_contamination_notes,
         a.last_reviewed_at, a.version,
         al.code as allergen_code, al.name_en as allergen_name_en, al.name_it as allergen_name_it
  from public.menu_item_allergens a
  join public.allergens al on al.id = a.allergen_id
  join agent.approved_menu_items mi on mi.id = a.menu_item_id
  where a.approval_status = 'approved';

comment on view agent.approved_menu_item_allergens is 'Approved allergen declarations for approved dishes. Both rows must be approved; either draft hides the fact.';

create view agent.approved_menu_item_dietary_attributes
with (security_barrier = true) as
  select d.id, d.organisation_id, d.menu_item_id, d.dietary_attribute_id,
         d.notes_en, d.notes_it,
         da.code as attribute_code, da.name_en as attribute_name_en, da.name_it as attribute_name_it
  from public.menu_item_dietary_attributes d
  join public.dietary_attributes da on da.id = d.dietary_attribute_id
  join agent.approved_menu_items mi on mi.id = d.menu_item_id
  where d.approval_status = 'approved';

create view agent.approved_faqs
with (security_barrier = true) as
  select f.id, f.organisation_id, f.location_id,
         f.question_en, f.question_it, f.answer_en, f.answer_it,
         f.tags, f.display_order
  from public.frequently_asked_questions f
  where f.approval_status = 'approved';

create view agent.approved_knowledge_articles
with (security_barrier = true) as
  select k.id, k.organisation_id, k.location_id, k.category, k.slug,
         k.title_en, k.title_it, k.body_en, k.body_it, k.tags, k.display_order
  from public.knowledge_articles k
  where k.approval_status = 'approved';

-- -----------------------------------------------------------------------------
-- agent.get_business_info — hours, address, contact
-- -----------------------------------------------------------------------------
create or replace function agent.get_business_info(p_location uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'location_id', l.id,
    'name', l.name,
    'address', concat_ws(', ',
      nullif(l.address_line1, ''), nullif(l.address_line2, ''),
      nullif(l.city, ''), nullif(l.postal_code, '')),
    'directions_note', l.directions_note,
    'phone', l.phone_e164,
    'timezone', l.timezone,
    'max_party_size_auto_book', l.max_party_size_auto_book,
    'hours', coalesce((
      select jsonb_agg(jsonb_build_object(
        'day_of_week', h.day_of_week,
        'service', h.service_label,
        'opens_at', h.opens_at,
        'closes_at', h.closes_at,
        'is_closed', h.is_closed,
        'valid_from', h.valid_from,
        'valid_to', h.valid_to,
        'note', h.note
      ) order by h.day_of_week nulls last, h.opens_at)
      from public.business_hours h
      where h.location_id = l.id
    ), '[]'::jsonb),
    'articles', coalesce((
      select jsonb_agg(jsonb_build_object(
        'category', k.category,
        'title_en', k.title_en, 'title_it', k.title_it,
        'body_en', k.body_en, 'body_it', k.body_it
      ) order by k.display_order)
      from agent.approved_knowledge_articles k
      where k.location_id = l.id
    ), '[]'::jsonb)
  )
  from public.locations l
  where l.id = p_location
    and l.is_active
    and l.deleted_at is null;
$$;

comment on function agent.get_business_info(uuid) is 'Business facts for one location. Knowledge articles are approved-only; opening hours are structured data and are not approval-gated.';

-- -----------------------------------------------------------------------------
-- agent.search_menu
-- -----------------------------------------------------------------------------
create or replace function agent.search_menu(
  p_location uuid,
  p_query text default null,
  p_limit integer default 10
)
returns table (
  menu_item_id uuid,
  name_en text,
  name_it text,
  description_en text,
  description_it text,
  price_cents integer,
  currency char(3),
  category_en text,
  category_it text
)
language sql
stable
security definer
set search_path = ''
as $$
  select i.id, i.name_en, i.name_it, i.description_en, i.description_it,
         i.price_cents, i.currency, c.name_en, c.name_it
  from agent.approved_menu_items i
  join agent.approved_menu_categories c on c.id = i.category_id
  where i.location_id = p_location
    and (
      p_query is null
      or i.name_en ilike '%' || p_query || '%'
      or coalesce(i.name_it, '') ilike '%' || p_query || '%'
      or coalesce(i.description_en, '') ilike '%' || p_query || '%'
    )
  order by c.display_order, i.display_order
  limit greatest(1, least(coalesce(p_limit, 10), 50));
$$;

-- -----------------------------------------------------------------------------
-- agent.get_allergen_info — the safety-critical read
-- -----------------------------------------------------------------------------
-- Returns declared facts only. It never computes "safe", it never infers from a
-- dish name, and the absence of a row is explicitly reported as "not declared"
-- rather than as "free from".
create or replace function agent.get_allergen_info(
  p_location uuid,
  p_menu_item uuid
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'menu_item_id', i.id,
    'name_en', i.name_en,
    'name_it', i.name_it,
    'cross_contamination_notes', i.cross_contamination_notes,
    'last_reviewed_at', i.last_reviewed_at,
    'contains', coalesce((
      select jsonb_agg(jsonb_build_object(
        'code', a.allergen_code, 'name_en', a.allergen_name_en, 'name_it', a.allergen_name_it,
        'notes_en', a.notes_en, 'notes_it', a.notes_it) order by a.allergen_code)
      from agent.approved_menu_item_allergens a
      where a.menu_item_id = i.id and a.presence = 'contains'
    ), '[]'::jsonb),
    'may_contain', coalesce((
      select jsonb_agg(jsonb_build_object(
        'code', a.allergen_code, 'name_en', a.allergen_name_en, 'name_it', a.allergen_name_it,
        'cross_contamination_notes', a.cross_contamination_notes) order by a.allergen_code)
      from agent.approved_menu_item_allergens a
      where a.menu_item_id = i.id and a.presence = 'may_contain'
    ), '[]'::jsonb),
    'declared_free_from', coalesce((
      select jsonb_agg(jsonb_build_object(
        'code', a.allergen_code, 'name_en', a.allergen_name_en, 'name_it', a.allergen_name_it,
        'cross_contamination_notes', a.cross_contamination_notes) order by a.allergen_code)
      from agent.approved_menu_item_allergens a
      where a.menu_item_id = i.id and a.presence = 'free_from'
    ), '[]'::jsonb),
    -- Allergens with no approved declaration at all. The agent must say
    -- "not confirmed" for these, never "does not contain".
    'undeclared', coalesce((
      select jsonb_agg(jsonb_build_object(
        'code', al.code, 'name_en', al.name_en, 'name_it', al.name_it) order by al.code)
      from public.allergens al
      where not exists (
        select 1 from agent.approved_menu_item_allergens a
        where a.menu_item_id = i.id and a.allergen_id = al.id
      )
    ), '[]'::jsonb),
    -- Machine-readable reminder carried alongside the data, so a tool endpoint
    -- cannot lose it on the way to the model.
    'safety_directive',
      'Report declared facts only. Never state that a dish is safe for a severe allergy. Transfer severe allergy enquiries to staff.'
  )
  from agent.approved_menu_items i
  where i.id = p_menu_item
    and i.location_id = p_location;
$$;

comment on function agent.get_allergen_info(uuid, uuid) is 'Declared allergen facts for one approved dish, separating contains / may_contain / declared free-from / undeclared. Never asserts safety.';

-- -----------------------------------------------------------------------------
-- agent.search_faqs
-- -----------------------------------------------------------------------------
create or replace function agent.search_faqs(
  p_location uuid,
  p_query text default null,
  p_limit integer default 5
)
returns table (
  faq_id uuid,
  question_en text,
  question_it text,
  answer_en text,
  answer_it text
)
language sql
stable
security definer
set search_path = ''
as $$
  select f.id, f.question_en, f.question_it, f.answer_en, f.answer_it
  from agent.approved_faqs f
  where f.location_id = p_location
    and (
      p_query is null
      or f.question_en ilike '%' || p_query || '%'
      or coalesce(f.question_it, '') ilike '%' || p_query || '%'
      or f.tags && string_to_array(lower(coalesce(p_query, '')), ' ')
    )
  order by f.display_order
  limit greatest(1, least(coalesce(p_limit, 5), 20));
$$;

-- -----------------------------------------------------------------------------
-- Access control for the agent schema
-- -----------------------------------------------------------------------------
-- Only the trusted backend may use it. The dashboard never reads from here.
revoke all on schema agent from public;
revoke all on all tables in schema agent from public, anon, authenticated;
revoke all on all functions in schema agent from public, anon, authenticated;

grant usage on schema agent to service_role;
grant select on all tables in schema agent to service_role;
grant execute on all functions in schema agent to service_role;

-- ─── 20260824001000_onboarding_rpc.sql ───
-- =============================================================================
-- 0010 · Organisation bootstrap
-- =============================================================================
-- Creating an organisation is the one operation RLS cannot express on its own:
-- the founding owner membership can only be written by somebody who is already
-- an admin of the organisation, which does not exist yet. Rather than weaken the
-- organisation_members policy (the single most sensitive policy in the schema),
-- the bootstrap is a single SECURITY DEFINER function that does the whole thing
-- in one transaction and grants ownership only to the caller.
-- =============================================================================

create or replace function public.create_organisation(
  p_name text,
  p_slug text,
  p_timezone text default 'Europe/Dublin',
  p_country_code text default 'IE'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_org  uuid;
begin
  if v_user is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  if p_name is null or length(btrim(p_name)) < 2 then
    raise exception 'organisation name is too short' using errcode = '22023';
  end if;

  insert into public.organisations (name, slug, timezone, country_code, created_by)
  values (btrim(p_name), lower(btrim(p_slug)), p_timezone, upper(p_country_code), v_user)
  returning id into v_org;

  -- The caller becomes the owner. This is the only path that can mint an
  -- organisation_owner membership without an existing owner's approval, and it
  -- can only ever name the caller.
  insert into public.organisation_members (organisation_id, user_id, role, status, accepted_at)
  values (v_org, v_user, 'organisation_owner', 'active', now());

  insert into public.subscriptions (organisation_id, status, plan, trial_ends_at)
  values (v_org, 'trialing', 'pilot', now() + interval '30 days');

  return v_org;
end;
$$;

comment on function public.create_organisation(text, text, text, text) is
  'Creates an organisation and makes the caller its owner, atomically. The only way to bootstrap a tenant.';

revoke all on function public.create_organisation(text, text, text, text) from public, anon;
grant execute on function public.create_organisation(text, text, text, text) to authenticated;
