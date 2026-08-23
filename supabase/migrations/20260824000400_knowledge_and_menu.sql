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
