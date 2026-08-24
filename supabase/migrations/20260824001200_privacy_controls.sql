-- =============================================================================
-- 0012 · Milestone 4A — disclosure evidence, recording lockout, pilot retention
-- =============================================================================
-- Implements TECHNICAL_PRIVACY_REQUIREMENTS.md TPR-1, TPR-2.5 and TPR-5.
-- Additive only.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- TPR-2.5 · Disclosure evidence on the call record
-- -----------------------------------------------------------------------------
-- The authoritative record is the append-only call_events pair
-- (ai_disclosure_started / ai_disclosure_completed). These columns are a
-- denormalised copy so the dashboard can show "disclosed at 19:02, v1, English"
-- without walking the event timeline for every row in a list.
alter table public.call_sessions
  add column if not exists disclosure_version text,
  add column if not exists disclosure_language app.language_code,
  add column if not exists disclosure_completed_at timestamptz,
  -- Marks a call placed as part of the internal, non-paying technical
  -- evaluation of the voice vendor. See RETELL_VENDOR_CONSTRAINTS.md.
  add column if not exists is_internal_evaluation boolean not null default true;

comment on column public.call_sessions.disclosure_version is
  'Version of the AI/transcription disclosure the caller actually heard. Evidence, not configuration.';
comment on column public.call_sessions.is_internal_evaluation is
  'True for calls placed under the internal vendor evaluation. Defaults true: a call is only ever non-internal by an explicit, gated decision.';

-- A completed disclosure must say which version and which language. A
-- completion timestamp with no version is not evidence of anything.
alter table public.call_sessions
  drop constraint if exists call_sessions_disclosure_evidence_complete;
alter table public.call_sessions
  add constraint call_sessions_disclosure_evidence_complete
  check (
    disclosure_completed_at is null
    or (disclosure_version is not null and disclosure_language is not null)
  );

create index if not exists call_sessions_disclosure_idx
  on public.call_sessions (organisation_id)
  where disclosure_completed_at is null;

-- -----------------------------------------------------------------------------
-- TPR-1 · Recording lockout, fail-closed
-- -----------------------------------------------------------------------------
-- Milestone 2 already forbids a recording without recorded consent. That is not
-- enough for Milestone 4A, where the rule is stronger: while the location has
-- recording switched off, a recording URL must be impossible, whatever the
-- vendor sent and whatever the application layer forgot to strip.
--
-- SECURITY INVOKER: this guard makes no privileged read, and a DEFINER function
-- that consults is_trusted_backend() would see its owner rather than its caller
-- (the mistake caught during Milestone 2 and kept as a regression test).
create or replace function app.guard_recording_disabled()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_recording_enabled boolean;
begin
  if new.recording_url is null then
    return new;
  end if;

  select c.recording_enabled into v_recording_enabled
  from public.agent_configurations c
  where c.location_id = new.location_id;

  if coalesce(v_recording_enabled, false) = false then
    raise exception
      'recording_url rejected: audio recording is disabled for this location (TPR-1.3)'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

comment on function app.guard_recording_disabled() is
  'Rejects any attempt to store an audio recording URL while recording is disabled for the location. Fail-closed: an absent agent configuration counts as disabled.';

drop trigger if exists call_sessions_guard_recording on public.call_sessions;
create trigger call_sessions_guard_recording
  before insert or update on public.call_sessions
  for each row execute function app.guard_recording_disabled();

-- -----------------------------------------------------------------------------
-- TPR-5.1 · Pilot retention default of 30 days
-- -----------------------------------------------------------------------------
-- Within the existing 1..365 CHECK. Existing demo organisations are moved to the
-- pilot default; a real organisation that has deliberately chosen a different
-- value is left alone.
alter table public.organisations
  alter column transcript_retention_days set default 30;

update public.organisations
   set transcript_retention_days = 30
 where is_demo = true
   and transcript_retention_days = 90;

-- -----------------------------------------------------------------------------
-- TPR-5.2 · Set the expiry from the organisation's policy at write time
-- -----------------------------------------------------------------------------
create or replace function app.set_call_retention()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_days integer;
begin
  if new.retention_expires_at is null then
    select o.transcript_retention_days into v_days
    from public.organisations o
    where o.id = new.organisation_id;

    -- Fail-closed on a missing organisation: the shortest supported window,
    -- never "keep forever".
    new.retention_expires_at := new.started_at + make_interval(days => coalesce(v_days, 30));
  end if;
  return new;
end;
$$;

comment on function app.set_call_retention() is
  'Stamps the transcript retention deadline from the organisation policy. A missing policy falls back to the shortest window, never to unlimited.';

drop trigger if exists call_sessions_set_retention on public.call_sessions;
create trigger call_sessions_set_retention
  before insert on public.call_sessions
  for each row execute function app.set_call_retention();

-- -----------------------------------------------------------------------------
-- TPR-5.3 · Deletion that can be tested
-- -----------------------------------------------------------------------------
-- Deletes transcripts and summaries whose call is past its retention deadline,
-- and writes a retention_jobs row as evidence that it ran and what it removed.
--
-- Deliberately narrow: it does not touch call metadata, which has a separate and
-- longer policy, and it does not schedule itself. Scheduling and the settings UI
-- are Milestone 6.
create or replace function app.run_transcript_retention(
  p_organisation uuid default null,
  p_now timestamptz default now()
)
returns table (transcripts_deleted integer, summaries_deleted integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_job uuid;
  v_transcripts integer := 0;
  v_summaries integer := 0;
begin
  insert into public.retention_jobs (organisation_id, started_at, status)
  values (p_organisation, p_now, 'running')
  returning id into v_job;

  with expired as (
    select cs.id
    from public.call_sessions cs
    where cs.retention_expires_at is not null
      and cs.retention_expires_at < p_now
      and (p_organisation is null or cs.organisation_id = p_organisation)
  ),
  deleted as (
    delete from public.call_transcripts t
    using expired e
    where t.call_session_id = e.id
    returning 1
  )
  select count(*)::integer into v_transcripts from deleted;

  with expired as (
    select cs.id
    from public.call_sessions cs
    where cs.retention_expires_at is not null
      and cs.retention_expires_at < p_now
      and (p_organisation is null or cs.organisation_id = p_organisation)
  ),
  deleted as (
    delete from public.call_summaries s
    using expired e
    where s.call_session_id = e.id
    returning 1
  )
  select count(*)::integer into v_summaries from deleted;

  update public.retention_jobs
     set finished_at = clock_timestamp(),
         status = 'succeeded',
         transcripts_deleted = v_transcripts,
         summaries_deleted = v_summaries
   where id = v_job;

  return query select v_transcripts, v_summaries;
end;
$$;

comment on function app.run_transcript_retention(uuid, timestamptz) is
  'Deletes transcripts and summaries past their retention deadline and records the run in retention_jobs. Call metadata is untouched.';

-- Reserved for the trusted backend (the cron route). No tenant user may run it.
revoke all on function app.run_transcript_retention(uuid, timestamptz) from public, anon, authenticated;
grant execute on function app.run_transcript_retention(uuid, timestamptz) to service_role;
