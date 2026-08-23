-- =============================================================================
-- 0008 · Row Level Security
-- =============================================================================
-- The tenancy boundary lives here, in the database, not in application code.
--
-- Design notes
-- ------------
-- * Every policy derives access from app.org_ids() / app.is_org_member(), which
--   read organisation_members for auth.uid(). No policy ever trusts an
--   organisation id supplied by the client, so changing an id in a request
--   cannot reach another tenant's data.
--
-- * Policies are granted TO authenticated only. The anon role additionally has
--   every privilege revoked below, so an unauthenticated request is refused by
--   the grant system before RLS is even consulted.
--
-- * RLS is ENABLED but deliberately NOT FORCED. FORCE ROW LEVEL SECURITY also
--   applies to the table owner, which on Supabase is the same role that runs
--   migrations, the SECURITY DEFINER audit triggers and the seed. Forcing it
--   would break the trusted server-side path that the design explicitly
--   reserves for webhooks, the retention job and administrative operations.
--   Least privilege for tenant users is achieved instead by (a) revoking
--   everything from anon, (b) column-level grants where a role may only touch
--   part of a row, and (c) confining the service-role key to webhook, voice-tool
--   and cron routes in the application. Evaluating FORCE against a real
--   Supabase project is tracked as a Milestone 8 hardening item.
--
-- * Append-only tables (call_events, call_transcripts, call_summaries,
--   audit_logs) have SELECT policies only. There is no UPDATE or DELETE policy
--   for any tenant user, so those rows cannot be rewritten through the API.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Helper: do I share an organisation with this user?
-- -----------------------------------------------------------------------------
create or replace function app.shares_org_with(p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organisation_members mine
    join public.organisation_members theirs
      on theirs.organisation_id = mine.organisation_id
    where mine.user_id = auth.uid()
      and mine.status = 'active'
      and theirs.user_id = p_user
  );
$$;

-- -----------------------------------------------------------------------------
-- Enable RLS on every table in public
-- -----------------------------------------------------------------------------
do $$
declare
  t record;
begin
  for t in
    select tablename from pg_tables where schemaname = 'public'
  loop
    execute format('alter table public.%I enable row level security', t.tablename);
  end loop;
end
$$;

-- =============================================================================
-- profiles
-- =============================================================================
create policy profiles_select on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or app.is_platform_admin()
    or app.shares_org_with(id)
  );

create policy profiles_insert_self on public.profiles
  for insert to authenticated
  with check (id = auth.uid());

create policy profiles_update_self on public.profiles
  for update to authenticated
  using (id = auth.uid() or app.is_platform_admin())
  with check (id = auth.uid() or app.is_platform_admin());

-- No DELETE policy: a profile disappears with its auth.users row.

-- =============================================================================
-- organisations
-- =============================================================================
create policy organisations_select on public.organisations
  for select to authenticated
  using (app.is_org_member(id));

-- Anyone signed in may create an organisation (self-serve onboarding). The
-- founding owner membership is created by the application in the same
-- transaction.
create policy organisations_insert on public.organisations
  for insert to authenticated
  with check (created_by = auth.uid());

create policy organisations_update on public.organisations
  for update to authenticated
  using (app.can_admin_org(id))
  with check (app.can_admin_org(id));

create policy organisations_delete on public.organisations
  for delete to authenticated
  using (app.is_org_owner(id));

-- =============================================================================
-- organisation_members
-- =============================================================================
create policy organisation_members_select on public.organisation_members
  for select to authenticated
  using (user_id = auth.uid() or app.is_org_member(organisation_id));

create policy organisation_members_insert on public.organisation_members
  for insert to authenticated
  with check (app.can_admin_org(organisation_id));

create policy organisation_members_update on public.organisation_members
  for update to authenticated
  using (app.can_admin_org(organisation_id))
  with check (app.can_admin_org(organisation_id));

create policy organisation_members_delete on public.organisation_members
  for delete to authenticated
  using (app.can_admin_org(organisation_id));

-- =============================================================================
-- organisation_member_locations
-- =============================================================================
create policy member_locations_select on public.organisation_member_locations
  for select to authenticated
  using (app.is_org_member(organisation_id));

create policy member_locations_insert on public.organisation_member_locations
  for insert to authenticated
  with check (app.can_admin_org(organisation_id));

create policy member_locations_delete on public.organisation_member_locations
  for delete to authenticated
  using (app.can_admin_org(organisation_id));

-- =============================================================================
-- locations
-- =============================================================================
create policy locations_select on public.locations
  for select to authenticated
  using (app.is_org_member(organisation_id));

create policy locations_insert on public.locations
  for insert to authenticated
  with check (app.can_admin_org(organisation_id));

-- A location_manager may edit the locations assigned to them; owners and
-- admins may edit every location in the organisation.
create policy locations_update on public.locations
  for update to authenticated
  using (app.can_manage_location(id))
  with check (app.can_manage_location(id));

create policy locations_delete on public.locations
  for delete to authenticated
  using (app.can_admin_org(organisation_id));

-- =============================================================================
-- subscriptions — billing is owner/admin only, and never writable from a client
-- =============================================================================
create policy subscriptions_select on public.subscriptions
  for select to authenticated
  using (app.can_admin_org(organisation_id));

-- =============================================================================
-- Reference data: readable by any signed-in user, writable only by us
-- =============================================================================
create policy allergens_select on public.allergens
  for select to authenticated using (true);

create policy allergens_write on public.allergens
  for all to authenticated
  using (app.is_platform_admin())
  with check (app.is_platform_admin());

create policy dietary_attributes_select on public.dietary_attributes
  for select to authenticated using (true);

create policy dietary_attributes_write on public.dietary_attributes
  for all to authenticated
  using (app.is_platform_admin())
  with check (app.is_platform_admin());

-- =============================================================================
-- Location-scoped configuration and knowledge
-- -----------------------------------------------------------------------------
-- Identical shape for every table below:
--   SELECT  any active member of the organisation
--   WRITE   only someone who may manage that specific location
-- Generated in a loop so the rule is stated once and cannot drift between
-- tables; the table list is the audit surface.
-- =============================================================================
do $$
declare
  t text;
begin
  foreach t in array array[
    'agent_configurations',
    'business_hours',
    'escalation_rules',
    'knowledge_articles',
    'frequently_asked_questions',
    'menu_categories',
    'menu_items'
  ]
  loop
    execute format($f$
      create policy %1$I on public.%2$I
        for select to authenticated
        using (app.is_org_member(organisation_id));
    $f$, t || '_select', t);

    execute format($f$
      create policy %1$I on public.%2$I
        for insert to authenticated
        with check (app.is_org_member(organisation_id) and app.can_manage_location(location_id));
    $f$, t || '_insert', t);

    execute format($f$
      create policy %1$I on public.%2$I
        for update to authenticated
        using (app.can_manage_location(location_id))
        with check (app.is_org_member(organisation_id) and app.can_manage_location(location_id));
    $f$, t || '_update', t);

    execute format($f$
      create policy %1$I on public.%2$I
        for delete to authenticated
        using (app.can_manage_location(location_id));
    $f$, t || '_delete', t);
  end loop;
end
$$;

-- =============================================================================
-- Menu child tables — location is resolved through the parent menu item
-- =============================================================================
do $$
declare
  t text;
begin
  foreach t in array array['menu_item_allergens', 'menu_item_dietary_attributes']
  loop
    execute format($f$
      create policy %1$I on public.%2$I
        for select to authenticated
        using (app.is_org_member(organisation_id));
    $f$, t || '_select', t);

    execute format($f$
      create policy %1$I on public.%2$I
        for insert to authenticated
        with check (
          app.is_org_member(organisation_id)
          and app.can_manage_location(
                (select mi.location_id from public.menu_items mi where mi.id = menu_item_id))
        );
    $f$, t || '_insert', t);

    execute format($f$
      create policy %1$I on public.%2$I
        for update to authenticated
        using (
          app.can_manage_location(
            (select mi.location_id from public.menu_items mi where mi.id = menu_item_id))
        )
        with check (
          app.is_org_member(organisation_id)
          and app.can_manage_location(
                (select mi.location_id from public.menu_items mi where mi.id = menu_item_id))
        );
    $f$, t || '_update', t);

    execute format($f$
      create policy %1$I on public.%2$I
        for delete to authenticated
        using (
          app.can_manage_location(
            (select mi.location_id from public.menu_items mi where mi.id = menu_item_id))
        );
    $f$, t || '_delete', t);
  end loop;
end
$$;

-- =============================================================================
-- Call records — readable by the organisation, written only by the backend
-- =============================================================================
create policy call_sessions_select on public.call_sessions
  for select to authenticated
  using (app.is_org_member(organisation_id));

-- Staff may annotate a call (caller name, escalation note) but may not rewrite
-- its outcome, timings or transfer state. Which columns that means is enforced
-- by the column-level GRANT further down, not by this policy.
create policy call_sessions_annotate on public.call_sessions
  for update to authenticated
  using (app.can_operate_org(organisation_id))
  with check (app.can_operate_org(organisation_id));

create policy call_events_select on public.call_events
  for select to authenticated
  using (app.is_org_member(organisation_id));

create policy call_transcripts_select on public.call_transcripts
  for select to authenticated
  using (app.is_org_member(organisation_id));

create policy call_summaries_select on public.call_summaries
  for select to authenticated
  using (app.is_org_member(organisation_id));

create policy sms_messages_select on public.sms_messages
  for select to authenticated
  using (app.is_org_member(organisation_id));

-- =============================================================================
-- reservations — the one operational table staff may actually write
-- =============================================================================
create policy reservations_select on public.reservations
  for select to authenticated
  using (app.is_org_member(organisation_id));

create policy reservations_insert on public.reservations
  for insert to authenticated
  with check (app.is_org_member(organisation_id) and app.can_operate_org(organisation_id));

create policy reservations_update on public.reservations
  for update to authenticated
  using (app.can_operate_org(organisation_id))
  with check (app.is_org_member(organisation_id) and app.can_operate_org(organisation_id));

create policy reservations_delete on public.reservations
  for delete to authenticated
  using (app.can_manage_location(location_id));

-- =============================================================================
-- audit_logs — owner/admin may read, nobody may write through the API
-- =============================================================================
create policy audit_logs_select on public.audit_logs
  for select to authenticated
  using (organisation_id is not null and app.can_admin_org(organisation_id));

-- =============================================================================
-- retention_jobs — evidence of deletion, readable by owner/admin
-- =============================================================================
create policy retention_jobs_select on public.retention_jobs
  for select to authenticated
  using (organisation_id is not null and app.can_admin_org(organisation_id));

-- =============================================================================
-- webhook_events — no tenant access at all.
-- RLS is enabled with no policy, which denies every authenticated request.
-- Only the service role (BYPASSRLS) can read or write it.
-- =============================================================================

-- =============================================================================
-- Grants
-- =============================================================================
-- anon gets nothing on business data. An unauthenticated request is refused by
-- the grant system before any policy runs.
revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
revoke all on all functions in schema public from anon;

grant usage on schema public to authenticated, service_role;
grant usage on schema app to authenticated, service_role;

-- Read everything (RLS decides which rows), write only where a policy exists.
grant select on all tables in schema public to authenticated;

grant insert, update, delete on
  public.organisations,
  public.organisation_members,
  public.organisation_member_locations,
  public.locations,
  public.agent_configurations,
  public.business_hours,
  public.escalation_rules,
  public.knowledge_articles,
  public.frequently_asked_questions,
  public.menu_categories,
  public.menu_items,
  public.menu_item_allergens,
  public.menu_item_dietary_attributes,
  public.reservations
to authenticated;

grant insert, update on public.profiles to authenticated;

-- Column-level grant: this is what "staff may update only the operational
-- information explicitly allowed by their role" means in practice for a call
-- record. Even with the annotate policy satisfied, no other column is writable.
grant update (caller_name, escalation_notes) on public.call_sessions to authenticated;

-- Append-only tables: SELECT only for tenant users.
revoke insert, update, delete on
  public.call_events,
  public.call_transcripts,
  public.call_summaries,
  public.audit_logs,
  public.sms_messages,
  public.retention_jobs,
  public.subscriptions,
  public.allergens,
  public.dietary_attributes,
  public.webhook_events
from authenticated;

-- Reference data may be maintained by a platform administrator through the API.
grant insert, update, delete on public.allergens, public.dietary_attributes to authenticated;

-- The trusted backend.
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;

-- Authorisation helpers must be callable from inside policies.
grant execute on all functions in schema app to authenticated, service_role;
