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
