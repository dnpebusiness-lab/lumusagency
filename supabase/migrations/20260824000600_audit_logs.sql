-- =============================================================================
-- 0006 · Audit logging
-- =============================================================================

create table public.audit_logs (
  id               uuid primary key default gen_random_uuid(),
  -- Nullable: platform-level actions (support access, plan changes) are not
  -- owned by a tenant.
  organisation_id  uuid references public.organisations (id) on delete cascade,
  actor_user_id    uuid references public.profiles (id) on delete set null,
  actor_email      citext,
  actor_role       app.org_role,
  action           app.audit_action not null,
  entity_type      text not null,
  entity_id        uuid,
  before           jsonb,
  after            jsonb,
  -- Free-text justification, required for the actions where "why" matters.
  reason           text,
  ip_address       inet,
  user_agent       text,
  occurred_at      timestamptz not null default now(),

  constraint audit_logs_unmask_has_reason
    check (action <> 'unmask_pii' or reason is not null),
  constraint audit_logs_change_has_payload
    check (action not in ('insert', 'update', 'delete') or before is not null or after is not null)
);

comment on table public.audit_logs is 'Append-only. Tenant users may read their organisation''s entries; nobody may update or delete them through the API.';
comment on constraint audit_logs_unmask_has_reason on public.audit_logs
  is 'Revealing a caller''s full phone number requires a stated reason.';

create index audit_logs_org_time_idx on public.audit_logs (organisation_id, occurred_at desc);
create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);
create index audit_logs_actor_idx on public.audit_logs (actor_user_id, occurred_at desc);

-- -----------------------------------------------------------------------------
-- Generic row auditor
-- -----------------------------------------------------------------------------
-- Attached to every table where a silent change would matter. Records the full
-- before/after image, plus a distinct 'approve'/'unapprove' action when the
-- approval_status of a safety-relevant row changes, so an allergen approval is
-- searchable as such rather than buried inside a generic UPDATE.
create or replace function app.audit_row()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_action        app.audit_action;
  v_org           uuid;
  v_before        jsonb;
  v_after         jsonb;
  v_actor         uuid := auth.uid();
  -- text, not citext: search_path is pinned to '' inside this function, so an
  -- extension type would not resolve by bare name.
  v_actor_email   text;
  v_old_status    text;
  v_new_status    text;
begin
  if tg_op = 'INSERT' then
    v_action := 'insert';
    v_after  := to_jsonb(new);
    v_org    := (v_after ->> 'organisation_id')::uuid;
  elsif tg_op = 'UPDATE' then
    v_action := 'update';
    v_before := to_jsonb(old);
    v_after  := to_jsonb(new);
    v_org    := (v_after ->> 'organisation_id')::uuid;

    v_old_status := v_before ->> 'approval_status';
    v_new_status := v_after ->> 'approval_status';
    if v_old_status is distinct from v_new_status then
      if v_new_status = 'approved' then
        v_action := 'approve';
      elsif v_old_status = 'approved' then
        v_action := 'unapprove';
      end if;
    end if;
  else
    v_action := 'delete';
    v_before := to_jsonb(old);
    v_org    := (v_before ->> 'organisation_id')::uuid;
  end if;

  select p.email into v_actor_email from public.profiles p where p.id = v_actor;

  insert into public.audit_logs (
    organisation_id, actor_user_id, actor_email, action, entity_type, entity_id, before, after
  )
  values (
    v_org,
    v_actor,
    v_actor_email,
    v_action,
    tg_table_name,
    coalesce((v_after ->> 'id')::uuid, (v_before ->> 'id')::uuid),
    v_before,
    v_after
  );

  return coalesce(new, old);
end;
$$;

comment on function app.audit_row() is 'AFTER INSERT/UPDATE/DELETE trigger: writes a full before/after image to audit_logs.';

-- Tables where every change is audited.
do $$
declare
  t text;
begin
  foreach t in array array[
    'organisations',
    'organisation_members',
    'organisation_member_locations',
    'locations',
    'agent_configurations',
    'business_hours',
    'escalation_rules',
    'knowledge_articles',
    'frequently_asked_questions',
    'menu_categories',
    'menu_items',
    'menu_item_allergens',
    'menu_item_dietary_attributes',
    'subscriptions'
  ]
  loop
    execute format(
      'create trigger %I after insert or update or delete on public.%I
         for each row execute function app.audit_row()',
      t || '_audit', t);
  end loop;
end
$$;
