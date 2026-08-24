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
