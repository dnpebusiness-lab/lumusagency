-- =============================================================================
-- 0007 · Authorisation helpers and integrity triggers
-- =============================================================================
-- Every function here is SECURITY DEFINER with a pinned empty search_path.
--
-- SECURITY DEFINER is required, not cosmetic: RLS policies on the business
-- tables need to consult organisation_members, which is itself protected by
-- RLS. Reading it through a definer function is what breaks that recursion.
-- The empty search_path stops a tenant from shadowing a name and hijacking
-- execution inside a privileged function.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Trusted backend detection
-- -----------------------------------------------------------------------------
-- service_role (webhooks, voice tools, cron) and the database superuser
-- (migrations, seed) operate without an end-user identity. They are trusted;
-- everybody else must prove authorisation through a membership.
-- SECURITY INVOKER, deliberately and importantly.
--
-- This function asks "who is calling?". SECURITY DEFINER would replace
-- current_user with the function's owner — postgres on Supabase — so it would
-- return true for everybody, silently disabling every guard that depends on it.
-- That mistake was caught by tests/database/integrity.test.ts and the tests
-- stay as the regression guard.
--
-- SECURITY INVOKER is safe here: the function only reads pg_roles, which is
-- world-readable, and the pinned search_path still prevents name shadowing.
create or replace function app.is_trusted_backend()
returns boolean
language sql
stable
set search_path = ''
as $$
  -- current_user is an SQL keyword, not a function call: it cannot be
  -- schema-qualified and is unaffected by search_path.
  select
    current_user in ('postgres', 'service_role', 'supabase_admin', 'supabase_auth_admin')
    or exists (
      select 1 from pg_catalog.pg_roles r
      where r.rolname = current_user and r.rolsuper
    );
$$;

comment on function app.is_trusted_backend() is 'True for service_role, the Supabase admin roles and the superuser. Never true for an end user.';

-- -----------------------------------------------------------------------------
-- Identity
-- -----------------------------------------------------------------------------
create or replace function app.current_user_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid();
$$;

create or replace function app.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.platform_role = 'platform_admin'
  );
$$;

-- -----------------------------------------------------------------------------
-- Organisation membership
-- -----------------------------------------------------------------------------
create or replace function app.org_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select m.organisation_id
  from public.organisation_members m
  where m.user_id = auth.uid()
    and m.status = 'active';
$$;

comment on function app.org_ids() is 'The organisations the current user actively belongs to. The single source of tenancy for every RLS policy.';

create or replace function app.is_org_member(p_org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_org is not null and (
    app.is_platform_admin()
    or exists (
      select 1 from public.organisation_members m
      where m.organisation_id = p_org
        and m.user_id = auth.uid()
        and m.status = 'active'
    )
  );
$$;

create or replace function app.org_role_of(p_org uuid)
returns app.org_role
language sql
stable
security definer
set search_path = ''
as $$
  select m.role
  from public.organisation_members m
  where m.organisation_id = p_org
    and m.user_id = auth.uid()
    and m.status = 'active';
$$;

create or replace function app.has_org_role(p_org uuid, p_roles app.org_role[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_org is not null and (
    app.is_platform_admin()
    or exists (
      select 1 from public.organisation_members m
      where m.organisation_id = p_org
        and m.user_id = auth.uid()
        and m.status = 'active'
        and m.role = any (p_roles)
    )
  );
$$;

-- Owner or admin: may change anything inside the organisation, including
-- membership, billing and every location.
create or replace function app.can_admin_org(p_org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select app.has_org_role(
    p_org,
    array['organisation_owner', 'organisation_admin']::app.org_role[]
  );
$$;

create or replace function app.is_org_owner(p_org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select app.has_org_role(p_org, array['organisation_owner']::app.org_role[]);
$$;

-- -----------------------------------------------------------------------------
-- Location scoping
-- -----------------------------------------------------------------------------
-- Owners and admins implicitly manage every location in their organisation.
-- A location_manager manages only the locations explicitly assigned to them.
-- Staff and viewers manage nothing.
create or replace function app.managed_location_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select l.id
  from public.locations l
  join public.organisation_members m
    on m.organisation_id = l.organisation_id
   and m.user_id = auth.uid()
   and m.status = 'active'
  where l.deleted_at is null
    and (
      m.role in ('organisation_owner', 'organisation_admin')
      or (
        m.role = 'location_manager'
        and exists (
          select 1 from public.organisation_member_locations ml
          where ml.member_id = m.id and ml.location_id = l.id
        )
      )
    );
$$;

comment on function app.managed_location_ids() is 'Locations the current user may modify. Owners/admins: all. Location managers: only assigned ones.';

create or replace function app.can_manage_location(p_location uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_location is not null and (
    app.is_platform_admin()
    or exists (select 1 from app.managed_location_ids() lid where lid = p_location)
  );
$$;

-- Approval of customer-facing content (menu, allergens, FAQs, policies) is the
-- same privilege as managing the location. It is deliberately NOT available to
-- staff or viewers: approval is the gate that lets data reach a phone call.
create or replace function app.can_approve_location(p_location uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select app.can_manage_location(p_location);
$$;

-- Staff may update operational records (reservation status, call outcome notes)
-- for locations in their organisation. Viewers may not.
create or replace function app.can_operate_org(p_org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select app.has_org_role(
    p_org,
    array['organisation_owner', 'organisation_admin', 'location_manager', 'staff']::app.org_role[]
  );
$$;

-- -----------------------------------------------------------------------------
-- Automatic profile creation
-- -----------------------------------------------------------------------------
create or replace function app.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, locale)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(
      nullif(new.raw_user_meta_data ->> 'locale', '')::app.language_code,
      'en'::app.language_code
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

comment on function app.handle_new_user() is 'Creates the application profile for a new auth.users row. platform_role is never taken from user metadata.';

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function app.handle_new_user();

-- -----------------------------------------------------------------------------
-- Privilege-escalation guards
-- -----------------------------------------------------------------------------
-- A tenant must never be able to make themselves a platform administrator,
-- even if a bug in the application lets them PATCH their own profile row.
-- SECURITY INVOKER: this guard branches on is_trusted_backend(), which must see
-- the real calling role. Privileged lookups are delegated to the SECURITY
-- DEFINER helpers above.
create or replace function app.guard_profile_platform_role()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.platform_role is distinct from old.platform_role
     and not app.is_trusted_backend()
     and not app.is_platform_admin() then
    raise exception 'platform_role can only be changed by a platform administrator'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger profiles_guard_platform_role
  before update on public.profiles
  for each row execute function app.guard_profile_platform_role();

-- Membership integrity:
--   * nobody may change their own role (no self-promotion),
--   * only an owner may create or modify an organisation_owner membership,
--   * an organisation may never be left without an active owner.
-- SECURITY INVOKER: this guard branches on is_trusted_backend(), which must see
-- the real calling role. Privileged lookups are delegated to the SECURITY
-- DEFINER helpers above.
create or replace function app.guard_membership_changes()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_org           uuid := coalesce(new.organisation_id, old.organisation_id);
  v_remaining_owners integer;
begin
  if not app.is_trusted_backend() then
    if tg_op = 'UPDATE'
       and old.user_id = auth.uid()
       and new.role is distinct from old.role then
      raise exception 'a member cannot change their own role' using errcode = '42501';
    end if;

    if (tg_op = 'INSERT' and new.role = 'organisation_owner')
       or (tg_op = 'UPDATE' and new.role = 'organisation_owner' and old.role <> 'organisation_owner')
       or (tg_op = 'UPDATE' and old.role = 'organisation_owner' and new.role <> 'organisation_owner') then
      if not (app.is_org_owner(v_org) or app.is_platform_admin()) then
        raise exception 'only an organisation owner can grant or revoke ownership'
          using errcode = '42501';
      end if;
    end if;
  end if;

  -- Minimum-cardinality rule: at least one active owner must remain.
  if (tg_op = 'DELETE' and old.role = 'organisation_owner' and old.status = 'active')
     or (tg_op = 'UPDATE' and old.role = 'organisation_owner' and old.status = 'active'
         and (new.role <> 'organisation_owner' or new.status <> 'active')) then
    select count(*) into v_remaining_owners
    from public.organisation_members m
    where m.organisation_id = v_org
      and m.role = 'organisation_owner'
      and m.status = 'active'
      and m.id <> old.id;

    if v_remaining_owners = 0 then
      raise exception 'an organisation must always have at least one active owner'
        using errcode = '23514';
    end if;
  end if;

  return coalesce(new, old);
end;
$$;

create trigger organisation_members_guard
  before insert or update or delete on public.organisation_members
  for each row execute function app.guard_membership_changes();

-- -----------------------------------------------------------------------------
-- Approval integrity — the mechanism behind the allergen guarantee
-- -----------------------------------------------------------------------------
-- Two rules, enforced for every approvable table:
--
--   1. Only someone who may manage the location can set approval_status to
--      'approved'. The user interface also checks this, but the database is
--      what makes it true.
--
--   2. Any change to the *content* of an approved row drops it back to 'draft'
--      and clears its approver. Editing the allergen list of an approved dish
--      therefore un-approves it automatically, and the agent stops quoting it
--      until a manager approves it again.
--
--      This holds even when the same UPDATE also sets approval_status to
--      'approved': SQL cannot distinguish a deliberate re-approval from a client
--      that simply echoed the column back unchanged, so the safe reading is
--      chosen. Approval is a separate, explicit act — Save, then Approve.
--
-- Bookkeeping columns are excluded from the content comparison so that
-- re-ordering or re-reviewing a row does not un-approve it.
create or replace function app.resolve_approval_location(p_row jsonb)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (p_row ->> 'location_id')::uuid,
    (select mi.location_id
       from public.menu_items mi
      where mi.id = (p_row ->> 'menu_item_id')::uuid)
  );
$$;

-- SECURITY INVOKER: this guard branches on is_trusted_backend(), which must see
-- the real calling role. Privileged lookups are delegated to the SECURITY
-- DEFINER helpers above.
create or replace function app.guard_approval()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  bookkeeping constant text[] := array[
    'approval_status', 'approved_by', 'approved_at', 'version',
    'last_reviewed_at', 'created_at', 'created_by', 'updated_at', 'updated_by',
    'display_order'
  ];
  v_new        jsonb := to_jsonb(new);
  v_old        jsonb;
  v_location   uuid;
  v_content_changed boolean := false;
begin
  v_location := app.resolve_approval_location(v_new);

  -- Rule 1: approving requires the privilege.
  if new.approval_status = 'approved'
     and (tg_op = 'INSERT' or old.approval_status is distinct from 'approved')
     and not app.is_trusted_backend()
     and not app.can_approve_location(v_location) then
    raise exception 'not authorised to approve content for this location'
      using errcode = '42501';
  end if;

  if tg_op = 'UPDATE' then
    v_old := to_jsonb(old);
    v_content_changed := (v_old - bookkeeping) is distinct from (v_new - bookkeeping);

    -- Rule 2: content edited on an approved row -> back to draft.
    if v_content_changed and old.approval_status = 'approved' then
      new.approval_status := 'draft';
      new.approved_by := null;
      new.approved_at := null;
    end if;
  end if;

  -- Keep the approval stamp consistent with the status in every direction.
  if new.approval_status = 'approved' then
    if new.approved_at is null then
      new.approved_at := now();
    end if;
    if new.approved_by is null then
      new.approved_by := auth.uid();
    end if;
    if new.last_reviewed_at is null then
      new.last_reviewed_at := new.approved_at;
    end if;
  else
    new.approved_by := null;
    new.approved_at := null;
  end if;

  return new;
end;
$$;

comment on function app.guard_approval() is 'Enforces who may approve content, and un-approves a row whose content changes without a new approval decision.';

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
      'create trigger %I before insert or update on public.%I
         for each row execute function app.guard_approval()',
      t || '_guard_approval', t);
  end loop;
end
$$;
