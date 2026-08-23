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
