-- =============================================================================
-- PART 3 of 4 · Privacy controls, voice tools and call ingest
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

-- ─── 20260824001200_privacy_controls.sql ───
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

-- ─── 20260824001300_voice_tool_rpc.sql ───
-- =============================================================================
-- 0013 · Milestone 4A — voice tool entry points
-- =============================================================================
-- The voice tool endpoints reach the database through supabase-js, which speaks
-- PostgREST, which only exposes the `public` schema. The `agent` schema stays
-- unexposed on purpose (migration 0009), so this migration adds three thin
-- wrappers in `public` that forward to it.
--
-- The boundary is unchanged and is still privilege-based, not obscurity-based:
--   * each wrapper is SECURITY DEFINER and forwards to the approved-data-only
--     agent function, so no caller can widen what comes back;
--   * EXECUTE is revoked from public, anon and authenticated, and granted to
--     service_role alone;
--   * tests/database/agent-surface.test.ts already asserts that a dashboard user
--     is refused, and now asserts the same for these wrappers.
--
-- Naming: the voice_ prefix marks them as the voice agent's entry points, so a
-- reviewer scanning `public` can see immediately which functions the phone can
-- reach.
-- =============================================================================

create or replace function public.voice_get_business_info(p_location uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select agent.get_business_info(p_location);
$$;

create or replace function public.voice_search_menu(
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
  select * from agent.search_menu(p_location, p_query, p_limit);
$$;

create or replace function public.voice_get_allergen_info(
  p_location uuid,
  p_menu_item uuid
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select agent.get_allergen_info(p_location, p_menu_item);
$$;

-- Resolve a dish the caller named in speech to an APPROVED menu item.
-- Lives here rather than in application code so the approved-only filter cannot
-- be forgotten by whoever writes the next matcher.
create or replace function public.voice_resolve_menu_item(
  p_location uuid,
  p_text text
)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select i.id
  from agent.approved_menu_items i
  where i.location_id = p_location
    and (
      i.slug = lower(btrim(p_text))
      or i.name_en ilike '%' || btrim(p_text) || '%'
      or coalesce(i.name_it, '') ilike '%' || btrim(p_text) || '%'
    )
  order by
    -- Prefer an exact slug hit, then the shortest name, so "gnocchi" does not
    -- resolve to a longer dish that merely contains the word.
    (i.slug = lower(btrim(p_text))) desc,
    length(i.name_en)
  limit 1;
$$;

comment on function public.voice_get_business_info(uuid) is 'Voice tool entry point. Approved data only; service_role only.';
comment on function public.voice_search_menu(uuid, text, integer) is 'Voice tool entry point. Approved data only; service_role only.';
comment on function public.voice_get_allergen_info(uuid, uuid) is 'Voice tool entry point. Approved data only; service_role only.';
comment on function public.voice_resolve_menu_item(uuid, text) is 'Resolves spoken dish text to an APPROVED menu item, or null.';

revoke all on function public.voice_get_business_info(uuid) from public, anon, authenticated;
revoke all on function public.voice_search_menu(uuid, text, integer) from public, anon, authenticated;
revoke all on function public.voice_get_allergen_info(uuid, uuid) from public, anon, authenticated;
revoke all on function public.voice_resolve_menu_item(uuid, text) from public, anon, authenticated;

grant execute on function public.voice_get_business_info(uuid) to service_role;
grant execute on function public.voice_search_menu(uuid, text, integer) to service_role;
grant execute on function public.voice_get_allergen_info(uuid, uuid) to service_role;
grant execute on function public.voice_resolve_menu_item(uuid, text) to service_role;

-- ─── 20260824001400_voice_call_ingest.sql ───
-- =============================================================================
-- 0014 · Milestone 4A — transactional call ingest
-- =============================================================================
-- A single lifecycle webhook can write a call, its transcript, its summary and
-- several events. supabase-js speaks PostgREST, which has no multi-statement
-- transaction, so doing this from TypeScript would leave half-written calls
-- whenever anything failed mid-way.
--
-- This function does the whole ingest in ONE transaction, with the idempotency
-- gate as its first act:
--
--   1. claim (vendor, event_id) in webhook_events   -> conflict means duplicate
--   2. upsert the call session
--   3. replace the transcript (vendors send it cumulatively, not incrementally)
--   4. upsert the summary
--   5. append the call events
--   6. mark the webhook processed
--
-- A duplicate delivery short-circuits at step 1 and returns success without
-- writing anything, which is what a vendor retry needs.
-- =============================================================================

create or replace function public.voice_ingest_call_event(p_input jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_vendor        text := p_input ->> 'vendor';
  v_event_id      text := p_input ->> 'event_id';
  v_event_kind    text := p_input ->> 'event_kind';
  v_provider      text := coalesce(p_input ->> 'provider', 'retell');
  v_call_ref      text := p_input ->> 'provider_call_id';
  v_org           uuid := (p_input ->> 'organisation_id')::uuid;
  v_location      uuid := (p_input ->> 'location_id')::uuid;
  v_caller_salt   text := coalesce(p_input ->> 'caller_salt', 'astra');
  v_claimed       uuid;
  v_call          uuid;
  v_turn          jsonb;
  v_event         jsonb;
  v_next_sequence integer;
  v_transcripts   integer := 0;
begin
  if v_vendor is null or v_event_id is null or v_call_ref is null
     or v_org is null or v_location is null then
    raise exception 'voice_ingest_call_event: vendor, event_id, provider_call_id, organisation_id and location_id are all required'
      using errcode = '22023';
  end if;

  -- 1. Idempotency gate. The unique index on (vendor, event_id) is the actual
  --    mechanism; this is just how we read its answer.
  insert into public.webhook_events (vendor, event_id, event_type, organisation_id, payload_digest)
  values (v_vendor, v_event_id, v_event_kind, v_org, p_input ->> 'payload_digest')
  on conflict (vendor, event_id) do nothing
  returning id into v_claimed;

  if v_claimed is null then
    return jsonb_build_object('duplicate', true, 'processed', false);
  end if;

  -- 2. The call itself.
  insert into public.call_sessions (
    organisation_id, location_id, provider, provider_call_id,
    direction, status, outcome, started_at, ended_at,
    caller_number_e164, caller_ref, initial_language, detected_language,
    primary_intent, intents,
    disclosure_version, disclosure_language, disclosure_completed_at,
    is_internal_evaluation, cost_cents, metadata
  )
  values (
    v_org, v_location, v_provider, v_call_ref,
    'inbound',
    coalesce((p_input ->> 'status')::app.call_status, 'in_progress'),
    (p_input ->> 'outcome')::app.call_outcome,
    coalesce((p_input ->> 'started_at')::timestamptz, now()),
    (p_input ->> 'ended_at')::timestamptz,
    p_input ->> 'caller_number_e164',
    case
      when p_input ->> 'caller_number_e164' is null then null
      -- pg_catalog.sha256 is a PostgreSQL built-in (11+). Deliberately not
      -- pgcrypto's digest(): pgcrypto lives in `public` locally and in
      -- `extensions` on Supabase, and this function pins search_path to ''.
      else encode(
        pg_catalog.sha256(
          pg_catalog.convert_to(v_caller_salt || (p_input ->> 'caller_number_e164'), 'UTF8')),
        'hex')
    end,
    (p_input ->> 'initial_language')::app.language_code,
    (p_input ->> 'detected_language')::app.language_code,
    p_input ->> 'primary_intent',
    coalesce(
      (select array_agg(value::text) from jsonb_array_elements_text(p_input -> 'intents')),
      '{}'::text[]),
    p_input ->> 'disclosure_version',
    (p_input ->> 'disclosure_language')::app.language_code,
    (p_input ->> 'disclosure_completed_at')::timestamptz,
    coalesce((p_input ->> 'is_internal_evaluation')::boolean, true),
    (p_input ->> 'cost_cents')::integer,
    coalesce(p_input -> 'metadata', '{}'::jsonb)
  )
  on conflict (provider, provider_call_id) do update set
    -- COALESCE in this direction so a later event enriches the record and a
    -- re-delivery of an earlier one cannot blank a field we already have.
    status                  = coalesce(excluded.status, public.call_sessions.status),
    outcome                 = coalesce(excluded.outcome, public.call_sessions.outcome),
    ended_at                = coalesce(excluded.ended_at, public.call_sessions.ended_at),
    detected_language       = coalesce(excluded.detected_language, public.call_sessions.detected_language),
    primary_intent          = coalesce(excluded.primary_intent, public.call_sessions.primary_intent),
    intents                 = case when array_length(excluded.intents, 1) is null
                                   then public.call_sessions.intents else excluded.intents end,
    disclosure_version      = coalesce(excluded.disclosure_version, public.call_sessions.disclosure_version),
    disclosure_language     = coalesce(excluded.disclosure_language, public.call_sessions.disclosure_language),
    disclosure_completed_at = coalesce(excluded.disclosure_completed_at, public.call_sessions.disclosure_completed_at),
    cost_cents              = coalesce(excluded.cost_cents, public.call_sessions.cost_cents),
    metadata                = public.call_sessions.metadata || excluded.metadata
  returning id into v_call;

  -- 3. Transcript. Vendors resend the whole transcript on each event, so the
  --    correct operation is replace, not append: appending would duplicate every
  --    turn on the analysed event.
  if jsonb_typeof(p_input -> 'transcript') = 'array'
     and jsonb_array_length(p_input -> 'transcript') > 0 then
    delete from public.call_transcripts where call_session_id = v_call;

    for v_turn in select * from jsonb_array_elements(p_input -> 'transcript')
    loop
      insert into public.call_transcripts (
        organisation_id, call_session_id, turn_index, speaker, content, language,
        started_at_ms, ended_at_ms
      )
      values (
        v_org, v_call,
        (v_turn ->> 'turnIndex')::integer,
        (v_turn ->> 'speaker')::app.speaker,
        v_turn ->> 'content',
        (p_input ->> 'detected_language')::app.language_code,
        (v_turn ->> 'startedAtMs')::integer,
        (v_turn ->> 'endedAtMs')::integer
      );
      v_transcripts := v_transcripts + 1;
    end loop;
  end if;

  -- 4. Summary.
  if p_input ->> 'summary' is not null then
    insert into public.call_summaries (
      organisation_id, call_session_id, language, summary, detected_intent, sentiment, model
    )
    values (
      v_org, v_call,
      coalesce((p_input ->> 'detected_language')::app.language_code, 'en'),
      p_input ->> 'summary',
      p_input ->> 'primary_intent',
      p_input ->> 'sentiment',
      p_input ->> 'summary_model'
    )
    on conflict (call_session_id) do update set
      summary        = excluded.summary,
      detected_intent = coalesce(excluded.detected_intent, public.call_summaries.detected_intent),
      sentiment      = coalesce(excluded.sentiment, public.call_summaries.sentiment),
      generated_at   = now();
  end if;

  -- 5. Events, appended after whatever is already on the call.
  select coalesce(max(sequence), -1) + 1 into v_next_sequence
  from public.call_events where call_session_id = v_call;

  if jsonb_typeof(p_input -> 'events') = 'array' then
    for v_event in select * from jsonb_array_elements(p_input -> 'events')
    loop
      insert into public.call_events (
        organisation_id, call_session_id, sequence, event_type, tool_name,
        payload, error_code, error_message, occurred_at
      )
      values (
        v_org, v_call, v_next_sequence,
        (v_event ->> 'event_type')::app.call_event_type,
        v_event ->> 'tool_name',
        coalesce(v_event -> 'payload', '{}'::jsonb),
        v_event ->> 'error_code',
        v_event ->> 'error_message',
        coalesce((v_event ->> 'occurred_at')::timestamptz, now())
      );
      v_next_sequence := v_next_sequence + 1;
    end loop;
  end if;

  -- 6. Done.
  update public.webhook_events
     set processed_at = now(), attempts = attempts + 1
   where id = v_claimed;

  return jsonb_build_object(
    'duplicate', false,
    'processed', true,
    'call_session_id', v_call,
    'transcript_turns', v_transcripts
  );
end;
$$;

comment on function public.voice_ingest_call_event(jsonb) is
  'Transactional ingest of one normalised voice lifecycle event. Idempotent on (vendor, event_id). service_role only.';

revoke all on function public.voice_ingest_call_event(jsonb) from public, anon, authenticated;
grant execute on function public.voice_ingest_call_event(jsonb) to service_role;

-- ─── 20260824001500_business_info_faqs.sql ───
-- =============================================================================
-- 0015 · The approved answers reach the agent
-- =============================================================================
-- agent.approved_faqs has existed since Milestone 2, with its approval gate and
-- its row-level security, and nothing ever read it. Every question a restaurant
-- answers in its own words — what time the kitchen closes, is there parking, do
-- you have high chairs, who is the chef — was invisible to the voice agent.
--
-- Found the only way it could be: on a live call. Opening hours came back
-- correctly, because hours are structured data returned by this same function,
-- while every question answered from the FAQ table produced "I could not
-- confirm that". The data was approved, present and unreachable.
--
-- Additive: the function gains one key. Hours, address, contact and knowledge
-- articles are returned exactly as before.
-- =============================================================================

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
    ), '[]'::jsonb),
    -- Approved answers, in the restaurant's own words. Bounded at fifty: this
    -- travels into a prompt on every call, and a knowledge base that grows
    -- without limit would quietly become a latency and cost problem on the
    -- telephone, where both are heard.
    'faqs', coalesce((
      select jsonb_agg(jsonb_build_object(
        'question_en', f.question_en, 'question_it', f.question_it,
        'answer_en', f.answer_en, 'answer_it', f.answer_it,
        'tags', f.tags
      ) order by f.display_order)
      from (
        select * from agent.approved_faqs af
        where af.location_id = l.id
        order by af.display_order
        limit 50
      ) f
    ), '[]'::jsonb)
  )
  from public.locations l
  where l.id = p_location
    and l.is_active
    and l.deleted_at is null;
$$;

comment on function agent.get_business_info(uuid) is
  'Business facts for one location: hours (structured, not approval-gated), plus approved knowledge articles and approved FAQs.';
