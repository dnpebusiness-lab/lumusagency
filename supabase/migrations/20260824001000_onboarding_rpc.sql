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
