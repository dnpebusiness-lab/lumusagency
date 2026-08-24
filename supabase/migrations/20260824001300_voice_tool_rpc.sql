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
