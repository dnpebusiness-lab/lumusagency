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
