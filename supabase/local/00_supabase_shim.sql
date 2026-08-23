-- =============================================================================
-- LOCAL TEST SHIM — NOT A MIGRATION, NEVER RUN THIS AGAINST A REAL PROJECT
-- =============================================================================
-- This file recreates the small part of the Supabase platform that our
-- migrations depend on (the auth schema, auth.uid(), and the anon /
-- authenticated / service_role database roles) so the schema, the policies and
-- the seed data can be executed and tested against a plain PostgreSQL server
-- when Docker and the Supabase CLI are unavailable.
--
-- On a real Supabase project all of this already exists and is managed by
-- Supabase. Running this file there would be harmful.
--
-- It is loaded only by scripts/db-local.sh, which refuses to touch anything
-- other than a local database.
-- =============================================================================

create extension if not exists pgcrypto;

create schema if not exists auth;

-- Column set mirrors the subset of Supabase's auth.users that our migrations,
-- seed and tests actually touch.
create table if not exists auth.users (
  instance_id          uuid default '00000000-0000-0000-0000-000000000000',
  id                   uuid primary key default gen_random_uuid(),
  aud                  varchar(255) default 'authenticated',
  role                 varchar(255) default 'authenticated',
  email                varchar(255) unique,
  encrypted_password   varchar(255),
  email_confirmed_at   timestamptz,
  invited_at           timestamptz,
  confirmation_token   varchar(255),
  recovery_token       varchar(255),
  last_sign_in_at      timestamptz,
  raw_app_meta_data    jsonb default '{}'::jsonb,
  raw_user_meta_data   jsonb default '{}'::jsonb,
  is_super_admin       boolean default false,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now(),
  phone                text unique,
  deleted_at           timestamptz
);

create table if not exists auth.identities (
  id              uuid primary key default gen_random_uuid(),
  provider_id     text not null,
  user_id         uuid not null references auth.users (id) on delete cascade,
  identity_data   jsonb not null,
  provider        text not null,
  last_sign_in_at timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  email           text,
  unique (provider, provider_id)
);

-- Supabase resolves the current user from the verified JWT claims that PostgREST
-- puts into the "request.jwt.claims" GUC. The tests set that GUC directly, which
-- is exactly what PostgREST does after it has verified the token signature.
create or replace function auth.jwt()
returns jsonb
language sql
stable
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claims', true), '')::jsonb,
    '{}'::jsonb
  );
$$;

create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(auth.jwt() ->> 'sub', '')::uuid;
$$;

create or replace function auth.role()
returns text
language sql
stable
as $$
  select coalesce(auth.jwt() ->> 'role', 'anon');
$$;

create or replace function auth.email()
returns text
language sql
stable
as $$
  select auth.jwt() ->> 'email';
$$;

-- PostgREST connection roles.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
  end if;
  -- service_role bypasses RLS on Supabase. Reproducing that here is what makes
  -- the "service role is reserved for trusted server-side code" test meaningful.
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin noinherit bypassrls;
  end if;
end
$$;

grant usage on schema auth to anon, authenticated, service_role;
grant select on auth.users to authenticated, service_role;
