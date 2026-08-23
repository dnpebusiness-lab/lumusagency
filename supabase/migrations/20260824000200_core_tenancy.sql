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
