-- =============================================================================
-- SEED — FICTIONAL DEMONSTRATION DATA
-- =============================================================================
--  ⚠️  EVERYTHING IN THIS FILE IS INVENTED.
--
--  "Osteria Vindaro" and "Kestrel Coffee House" are fictional businesses.
--  The addresses, phone numbers, people, prices, menus, allergen declarations,
--  calls and reservations do not describe any real business or real person.
--  Every organisation and location row is flagged is_demo = true, and the
--  dashboard shows a demonstration-data banner for them.
--
--  The allergen data is realistic in *shape* but must never be treated as
--  factual: it exists to exercise the approval gate and the safety rules.
--
--  This file must never be loaded into a production project. It creates demo
--  login accounts with a known password.
--
--  Deterministic UUIDs are used throughout so that tests can assert on them.
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- Demo accounts
-- -----------------------------------------------------------------------------
-- Password for every demo account: AstraDemo!2026
-- Documented in SUPABASE_SETUP.md. Demo-only; never reuse it anywhere real.
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  ('c0000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'owner.demo@example.com',
   crypt('AstraDemo!2026', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"full_name":"Rosa Vindaro","locale":"it"}'::jsonb, now(), now()),

  ('c0000000-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'admin.demo@example.com',
   crypt('AstraDemo!2026', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"full_name":"Declan Moore","locale":"en"}'::jsonb, now(), now()),

  ('c0000000-0000-4000-8000-000000000003', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'manager.demo@example.com',
   crypt('AstraDemo!2026', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"full_name":"Giulia Ferrante","locale":"it"}'::jsonb, now(), now()),

  ('c0000000-0000-4000-8000-000000000004', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'staff.demo@example.com',
   crypt('AstraDemo!2026', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"full_name":"Aoife Byrne","locale":"en"}'::jsonb, now(), now()),

  ('c0000000-0000-4000-8000-000000000005', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'viewer.demo@example.com',
   crypt('AstraDemo!2026', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"full_name":"Tom Hegarty","locale":"en"}'::jsonb, now(), now()),

  -- Belongs to the SECOND demo organisation. Exists so the cross-tenant
  -- isolation tests have a real neighbour to fail to reach.
  ('c0000000-0000-4000-8000-000000000006', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'kestrel.owner.demo@example.com',
   crypt('AstraDemo!2026', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"full_name":"Niamh Kelleher","locale":"en"}'::jsonb, now(), now())
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- GoTrue token columns must be '' and never NULL
-- -----------------------------------------------------------------------------
-- Supabase's auth service reads these columns into non-nullable Go strings. A
-- NULL makes the sign-in query fail server-side with "Database error querying
-- schema", which reaches the browser as a generic authentication failure — so
-- the symptom is "wrong password" on a password that is perfectly correct.
--
-- Supabase's own inserts always write ''. A seed that creates users directly
-- has to do the same, or every demo account it creates is unusable.
--
-- Done column-by-column through the catalogue rather than in a fixed INSERT
-- list: the exact set of these columns varies between GoTrue versions, and a
-- seed that names a column the project does not have fails outright.
do $$
declare
  v_column text;
begin
  foreach v_column in array array[
    'confirmation_token', 'recovery_token', 'email_change', 'email_change_token_new',
    'email_change_token_current', 'phone_change', 'phone_change_token',
    'reauthentication_token'
  ]
  loop
    if exists (
      select 1 from information_schema.columns
      where table_schema = 'auth' and table_name = 'users' and column_name = v_column
    ) then
      execute format(
        'update auth.users set %I = coalesce(%I, %L) where email like %L',
        v_column, v_column, '', '%.demo@example.com'
      );
    end if;
  end loop;
end
$$;

-- auth.identities.email is a GENERATED column on Supabase: it derives itself from
-- identity_data ->> 'email'. Listing it here fails with "cannot insert a
-- non-DEFAULT value into column email", so identity_data is the only place the
-- address is written and the column fills itself.
insert into auth.identities (provider, provider_id, user_id, identity_data, created_at, updated_at)
select 'email', u.id::text, u.id,
       jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
       now(), now()
from auth.users u
where u.email like '%.demo@example.com'
on conflict (provider, provider_id) do nothing;

-- profiles rows were created automatically by the on_auth_user_created trigger.
-- Confirm that, and fill in the details the trigger cannot know.
do $$
begin
  if (select count(*) from public.profiles
      where id in ('c0000000-0000-4000-8000-000000000001',
                   'c0000000-0000-4000-8000-000000000006')) <> 2 then
    raise exception 'seed: the automatic profile-creation trigger did not fire';
  end if;
end
$$;

update public.profiles set phone_e164 = '+353015550101' where id = 'c0000000-0000-4000-8000-000000000001';
update public.profiles set phone_e164 = '+353015550102' where id = 'c0000000-0000-4000-8000-000000000003';

-- -----------------------------------------------------------------------------
-- Organisations
-- -----------------------------------------------------------------------------
insert into public.organisations (
  id, name, slug, legal_name, country_code, timezone, currency, is_demo,
  transcript_retention_days, metadata_retention_days, created_by
) values
  -- 30-day transcript retention is the Milestone 4A pilot default (TPR-5.1).
  ('a0000000-0000-4000-8000-000000000001', 'Osteria Vindaro', 'osteria-vindaro-demo',
   'Vindaro Hospitality Ltd (fictional)', 'IE', 'Europe/Dublin', 'EUR', true,
   30, 730, 'c0000000-0000-4000-8000-000000000001'),
  ('a0000000-0000-4000-8000-000000000002', 'Kestrel Coffee House', 'kestrel-coffee-demo',
   'Kestrel Hospitality Ltd (fictional)', 'IE', 'Europe/Dublin', 'EUR', true,
   30, 365, 'c0000000-0000-4000-8000-000000000006');

insert into public.subscriptions (organisation_id, status, plan, trial_ends_at, max_locations, max_monthly_minutes)
values
  ('a0000000-0000-4000-8000-000000000001', 'trialing', 'pilot', now() + interval '30 days', 2, 1500),
  ('a0000000-0000-4000-8000-000000000002', 'trialing', 'pilot', now() + interval '30 days', 1, 500);

-- -----------------------------------------------------------------------------
-- Locations
-- -----------------------------------------------------------------------------
insert into public.locations (
  id, organisation_id, name, slug, address_line1, city, postal_code, country_code,
  latitude, longitude, timezone, phone_e164, public_email, website_url, directions_note,
  booking_provider, max_party_size_auto_book, default_reservation_minutes, seats_total,
  is_active, is_demo
) values
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001',
   'Osteria Vindaro — City Quay', 'city-quay',
   '18 Cormorant Quay', 'Dublin', 'D02 XY45', 'IE',
   53.346500, -6.246800, 'Europe/Dublin',
   '+353015550140', 'hello@example.com', 'https://example.com',
   'Two minutes on foot from the south quays, between the bridge and the bus stop. The blue door is the entrance; the green one is the private room.',
   'internal', 8, 90, 62, true, true),

  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002',
   'Kestrel Coffee House', 'kestrel-main',
   '4 Harrow Lane', 'Dublin', 'D08 KE22', 'IE',
   53.339000, -6.271000, 'Europe/Dublin',
   '+353015550190', 'hello2@example.com', null, null,
   'internal', 6, 60, 28, true, true);

-- -----------------------------------------------------------------------------
-- Memberships — one of every role
-- -----------------------------------------------------------------------------
insert into public.organisation_members (id, organisation_id, user_id, role, status, accepted_at)
values
  ('11110000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001',
   'c0000000-0000-4000-8000-000000000001', 'organisation_owner', 'active', now()),
  ('11110000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001',
   'c0000000-0000-4000-8000-000000000002', 'organisation_admin', 'active', now()),
  ('11110000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001',
   'c0000000-0000-4000-8000-000000000003', 'location_manager', 'active', now()),
  ('11110000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001',
   'c0000000-0000-4000-8000-000000000004', 'staff', 'active', now()),
  ('11110000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000001',
   'c0000000-0000-4000-8000-000000000005', 'viewer', 'active', now()),
  ('11110000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000002',
   'c0000000-0000-4000-8000-000000000006', 'organisation_owner', 'active', now());

-- The location_manager is scoped to the one location they actually run.
insert into public.organisation_member_locations (organisation_id, member_id, location_id)
values ('a0000000-0000-4000-8000-000000000001',
        '11110000-0000-4000-8000-000000000003',
        'b0000000-0000-4000-8000-000000000001');

commit;

-- =============================================================================
-- Reference data: the 14 allergens of EU Regulation 1169/2011, Annex II
-- =============================================================================
begin;

insert into public.allergens (id, code, annex_ii_number, name_en, name_it, description_en, description_it) values
  ('a1100000-0000-4000-8000-000000000001', 'cereals_gluten', 1, 'Cereals containing gluten', 'Cereali contenenti glutine', 'Wheat, rye, barley, oats, spelt, kamut and products thereof.', 'Grano, segale, orzo, avena, farro, kamut e prodotti derivati.'),
  ('a1100000-0000-4000-8000-000000000002', 'crustaceans', 2, 'Crustaceans', 'Crostacei', 'Prawns, crab, lobster and products thereof.', 'Gamberi, granchio, aragosta e prodotti derivati.'),
  ('a1100000-0000-4000-8000-000000000003', 'eggs', 3, 'Eggs', 'Uova', 'Eggs and products thereof.', 'Uova e prodotti derivati.'),
  ('a1100000-0000-4000-8000-000000000004', 'fish', 4, 'Fish', 'Pesce', 'Fish and products thereof.', 'Pesce e prodotti derivati.'),
  ('a1100000-0000-4000-8000-000000000005', 'peanuts', 5, 'Peanuts', 'Arachidi', 'Peanuts and products thereof.', 'Arachidi e prodotti derivati.'),
  ('a1100000-0000-4000-8000-000000000006', 'soybeans', 6, 'Soybeans', 'Soia', 'Soybeans and products thereof.', 'Soia e prodotti derivati.'),
  ('a1100000-0000-4000-8000-000000000007', 'milk', 7, 'Milk', 'Latte', 'Milk and products thereof, including lactose.', 'Latte e prodotti derivati, compreso il lattosio.'),
  ('a1100000-0000-4000-8000-000000000008', 'nuts', 8, 'Nuts', 'Frutta a guscio', 'Almonds, hazelnuts, walnuts, cashews, pecans, brazil nuts, pistachios, macadamia.', 'Mandorle, nocciole, noci, anacardi, noci pecan, noci del Brasile, pistacchi, macadamia.'),
  ('a1100000-0000-4000-8000-000000000009', 'celery', 9, 'Celery', 'Sedano', 'Celery and products thereof, including celeriac and stock.', 'Sedano e prodotti derivati, compresi sedano rapa e brodo.'),
  ('a1100000-0000-4000-8000-000000000010', 'mustard', 10, 'Mustard', 'Senape', 'Mustard and products thereof.', 'Senape e prodotti derivati.'),
  ('a1100000-0000-4000-8000-000000000011', 'sesame', 11, 'Sesame seeds', 'Semi di sesamo', 'Sesame seeds and products thereof.', 'Semi di sesamo e prodotti derivati.'),
  ('a1100000-0000-4000-8000-000000000012', 'sulphites', 12, 'Sulphur dioxide and sulphites', 'Anidride solforosa e solfiti', 'At concentrations of more than 10 mg/kg or 10 mg/litre.', 'In concentrazioni superiori a 10 mg/kg o 10 mg/litro.'),
  ('a1100000-0000-4000-8000-000000000013', 'lupin', 13, 'Lupin', 'Lupini', 'Lupin and products thereof.', 'Lupini e prodotti derivati.'),
  ('a1100000-0000-4000-8000-000000000014', 'molluscs', 14, 'Molluscs', 'Molluschi', 'Mussels, clams, squid, octopus and products thereof.', 'Cozze, vongole, calamari, polpo e prodotti derivati.');

-- Dietary attributes are preference labels, never safety claims.
insert into public.dietary_attributes (id, code, name_en, name_it, description_en, description_it, is_safety_claim) values
  ('d1100000-0000-4000-8000-000000000001', 'vegetarian', 'Vegetarian', 'Vegetariano', 'Contains no meat or fish.', 'Non contiene carne né pesce.', false),
  ('d1100000-0000-4000-8000-000000000002', 'vegan', 'Vegan', 'Vegano', 'Contains no animal products.', 'Non contiene prodotti di origine animale.', false),
  ('d1100000-0000-4000-8000-000000000003', 'gluten_free_option', 'Gluten-free option available', 'Disponibile senza glutine', 'The kitchen can prepare a gluten-free version on request. This is a preparation option, not an allergen guarantee.', 'La cucina può preparare una versione senza glutine su richiesta. È un''opzione di preparazione, non una garanzia sugli allergeni.', false),
  ('d1100000-0000-4000-8000-000000000004', 'dairy_free', 'Dairy-free', 'Senza latticini', 'Prepared without dairy ingredients.', 'Preparato senza latticini.', false),
  ('d1100000-0000-4000-8000-000000000005', 'contains_alcohol', 'Contains alcohol', 'Contiene alcol', 'Prepared with alcohol which may not fully cook off.', 'Preparato con alcol che potrebbe non evaporare completamente.', false),
  ('d1100000-0000-4000-8000-000000000006', 'spicy', 'Spicy', 'Piccante', 'Noticeably hot.', 'Decisamente piccante.', false);

commit;

-- =============================================================================
-- Opening hours — Osteria Vindaro (closed Mondays, split lunch/dinner service)
-- =============================================================================
begin;

insert into public.business_hours
  (organisation_id, location_id, day_of_week, service_label, opens_at, closes_at, is_closed)
values
  -- 0 = Sunday … 6 = Saturday
  ('a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001', 1, null, null, null, true),
  ('a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001', 2, 'lunch',  '12:00', '15:00', false),
  ('a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001', 2, 'dinner', '17:30', '22:30', false),
  ('a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001', 3, 'lunch',  '12:00', '15:00', false),
  ('a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001', 3, 'dinner', '17:30', '22:30', false),
  ('a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001', 4, 'lunch',  '12:00', '15:00', false),
  ('a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001', 4, 'dinner', '17:30', '22:30', false),
  ('a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001', 5, 'lunch',  '12:00', '15:00', false),
  ('a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001', 5, 'dinner', '17:30', '23:30', false),
  ('a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001', 6, 'lunch',  '12:00', '16:00', false),
  ('a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001', 6, 'dinner', '17:30', '23:30', false),
  ('a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001', 0, 'lunch',  '12:30', '16:00', false);

-- A dated override: closed for the fictional annual staff holiday.
insert into public.business_hours
  (organisation_id, location_id, day_of_week, opens_at, closes_at, is_closed, valid_from, valid_to, note)
values
  ('a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001',
   null, null, null, true, date '2026-12-24', date '2026-12-26',
   'Closed for Christmas (fictional demonstration data).');

-- Kestrel, minimal hours so the second tenant is not empty.
insert into public.business_hours
  (organisation_id, location_id, day_of_week, service_label, opens_at, closes_at, is_closed)
select 'a0000000-0000-4000-8000-000000000002','b0000000-0000-4000-8000-000000000002',
       d, 'all-day', '08:00', '17:00', false
from generate_series(1, 5) as d;

commit;

-- =============================================================================
-- Agent configuration and escalation rules
-- =============================================================================
begin;

insert into public.agent_configurations (
  organisation_id, location_id, is_active,
  default_language, supported_languages,
  greeting_en, greeting_it,
  ai_disclosure_en, ai_disclosure_it,
  voice_provider, voice_id,
  transfer_enabled, transfer_number_e164, transfer_hours_only,
  closed_behaviour, recording_enabled, sms_enabled, prompt_version
) values (
  'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', true,
  'en', array['en','it']::app.language_code[],
  'Good evening, Osteria Vindaro. How can I help?',
  'Buonasera, Osteria Vindaro. Come posso aiutarla?',
  'You are speaking with an automated assistant.',
  'Sta parlando con un assistente automatico.',
  'retell', 'demo-voice-placeholder',
  true, '+353015550141', true,
  'answer_and_book', false, true, 1
);

-- The Milestone 4A webhook resolves a call to a location through the agent id
-- the vendor reports. Fixtures and the replay script use this value.
update public.agent_configurations
   set retell_agent_id = 'agent_demo_vindaro'
 where location_id = 'b0000000-0000-4000-8000-000000000001';

insert into public.agent_configurations (
  organisation_id, location_id, is_active,
  default_language, supported_languages,
  greeting_en, greeting_it, ai_disclosure_en, ai_disclosure_it,
  transfer_enabled, transfer_number_e164
) values (
  'a0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000002', false,
  'en', array['en','it']::app.language_code[],
  'Kestrel Coffee House, how can I help?',
  'Kestrel Coffee House, come posso aiutarla?',
  'You are speaking with an automated assistant.',
  'Sta parlando con un assistente automatico.',
  true, '+353015550191'
);

insert into public.escalation_rules (
  organisation_id, location_id, reason, is_enabled, threshold_value,
  transfer_number_e164, message_en, message_it, priority
) values
  ('a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001','severe_allergy', true, null,
   '+353015550141',
   'For a serious allergy I''ll put you through to a member of the team right now.',
   'Per un''allergia grave la metto subito in contatto con una persona del team.', 10),
  ('a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001','complaint', true, null,
   '+353015550141',
   'I''m sorry about that. Let me pass you to the manager.',
   'Mi dispiace. La passo subito al responsabile.', 20),
  ('a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001','caller_request', true, null,
   '+353015550141', 'Of course, one moment.', 'Certamente, un attimo.', 30),
  ('a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001','outside_approved_information', true, null,
   '+353015550141',
   'I don''t have that confirmed. Let me pass you to someone who does.',
   'Non ho quell''informazione confermata. La passo a un collega.', 40),
  ('a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001','large_group', true, 8,
   '+353015550141',
   'For a group that size I''ll pass you to the team so they can look after it properly.',
   'Per un gruppo così numeroso la passo al team, che potrà seguirla al meglio.', 50),
  ('a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001','agent_uncertainty', true, null,
   '+353015550141',
   'I''m not certain about that, so I''ll pass you to a colleague.',
   'Non ne sono certo, quindi la passo a un collega.', 60),
  ('a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001','tool_failure', true, null,
   '+353015550141',
   'I can''t complete that right now. Let me pass you to a colleague.',
   'Non riesco a completare l''operazione adesso. La passo a un collega.', 70);

insert into public.escalation_rules
  (organisation_id, location_id, reason, is_enabled, transfer_number_e164, message_en, message_it)
values
  ('a0000000-0000-4000-8000-000000000002','b0000000-0000-4000-8000-000000000002','severe_allergy', true,
   '+353015550191', 'Let me put you through to the team.', 'La metto in contatto con il team.'),
  ('a0000000-0000-4000-8000-000000000002','b0000000-0000-4000-8000-000000000002','caller_request', true,
   '+353015550191', 'Of course, one moment.', 'Certamente, un attimo.'),
  ('a0000000-0000-4000-8000-000000000002','b0000000-0000-4000-8000-000000000002','complaint', true,
   '+353015550191', 'I''m sorry, let me pass you to the manager.', 'Mi dispiace, la passo al responsabile.'),
  ('a0000000-0000-4000-8000-000000000002','b0000000-0000-4000-8000-000000000002','outside_approved_information', true,
   '+353015550191', 'Let me pass you to a colleague.', 'La passo a un collega.');

commit;

-- =============================================================================
-- Menu — Osteria Vindaro
-- =============================================================================
-- Deliberately mixed approval states so the approval gate is exercised by the
-- seed itself:
--   * "Calamari Fritti"      -> draft          (must never reach a caller)
--   * "Bistecca ai Ferri"    -> pending_review (must never reach a caller)
--   * one allergen row on an approved dish -> draft (a chef's note the manager
--     has not signed off; the agent must not quote it)
-- =============================================================================
begin;

insert into public.menu_categories (
  id, organisation_id, location_id, slug, name_en, name_it, display_order,
  approval_status, approved_by, approved_at, last_reviewed_at, created_by
)
select v.id, 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001',
       v.slug, v.name_en, v.name_it, v.ord,
       'approved', 'c0000000-0000-4000-8000-000000000003', now() - interval '20 days',
       now() - interval '20 days', 'c0000000-0000-4000-8000-000000000003'
from (values
  ('21100000-0000-4000-8000-000000000001'::uuid, 'antipasti', 'Starters', 'Antipasti', 10),
  ('21100000-0000-4000-8000-000000000002'::uuid, 'primi',     'Pasta and rice', 'Primi', 20),
  ('21100000-0000-4000-8000-000000000003'::uuid, 'secondi',   'Main courses', 'Secondi', 30),
  ('21100000-0000-4000-8000-000000000004'::uuid, 'contorni',  'Sides', 'Contorni', 40),
  ('21100000-0000-4000-8000-000000000005'::uuid, 'dolci',     'Desserts', 'Dolci', 50)
) as v(id, slug, name_en, name_it, ord);

insert into public.menu_items (
  id, organisation_id, location_id, category_id, slug,
  name_en, name_it, description_en, description_it,
  price_cents, currency, is_available, display_order,
  cross_contamination_notes,
  approval_status, approved_by, approved_at, last_reviewed_at, created_by
)
select v.id, 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001',
       v.category, v.slug, v.name_en, v.name_it, v.desc_en, v.desc_it,
       v.price, 'EUR', true, v.ord, v.cc,
       v.status::app.approval_status,
       case when v.status = 'approved' then 'c0000000-0000-4000-8000-000000000003'::uuid end,
       case when v.status = 'approved' then now() - interval '18 days' end,
       case when v.status = 'approved' then now() - interval '18 days' end,
       'c0000000-0000-4000-8000-000000000003'
from (values
  -- Antipasti
  ('31100000-0000-4000-8000-000000000001'::uuid, '21100000-0000-4000-8000-000000000001'::uuid, 'bruschetta-vindaro',
   'Bruschetta Vindaro', 'Bruschetta Vindaro',
   'Grilled sourdough, datterini tomatoes, basil, olive oil.',
   'Pane a lievitazione naturale grigliato, pomodorini datterini, basilico, olio d''oliva.',
   850, 10, 'Bread is sliced on a board also used for wheat loaves.', 'approved'),
  ('31100000-0000-4000-8000-000000000002'::uuid, '21100000-0000-4000-8000-000000000001'::uuid, 'burrata-pomodorini',
   'Burrata with datterini tomatoes', 'Burrata con pomodorini',
   'Burrata from a small Puglian dairy, datterini tomatoes, basil oil.',
   'Burrata di un piccolo caseificio pugliese, pomodorini datterini, olio al basilico.',
   1200, 20, null, 'approved'),
  ('31100000-0000-4000-8000-000000000003'::uuid, '21100000-0000-4000-8000-000000000001'::uuid, 'tagliere-salumi',
   'Cured meat and cheese board', 'Tagliere di salumi e formaggi',
   'Selection of cured meats and cheeses, pickles, grissini.',
   'Selezione di salumi e formaggi, sottaceti, grissini.',
   1450, 30, 'Sliced on shared equipment with wheat products.', 'approved'),
  ('31100000-0000-4000-8000-000000000004'::uuid, '21100000-0000-4000-8000-000000000001'::uuid, 'calamari-fritti',
   'Fried calamari', 'Calamari fritti',
   'Lightly floured squid, lemon, aioli.',
   'Calamari infarinati, limone, aioli.',
   1100, 40, 'Fried in the shared fryer.', 'draft'),

  -- Primi
  ('31100000-0000-4000-8000-000000000005'::uuid, '21100000-0000-4000-8000-000000000002'::uuid, 'spaghetti-vongole',
   'Spaghetti with clams', 'Spaghetti alle vongole',
   'Clams, garlic, white wine, parsley.',
   'Vongole, aglio, vino bianco, prezzemolo.',
   1800, 10, null, 'approved'),
  ('31100000-0000-4000-8000-000000000006'::uuid, '21100000-0000-4000-8000-000000000002'::uuid, 'risotto-porcini',
   'Porcini mushroom risotto', 'Risotto ai funghi porcini',
   'Carnaroli rice, porcini, butter, aged parmesan.',
   'Riso carnaroli, porcini, burro, parmigiano stagionato.',
   1750, 20, null, 'approved'),
  ('31100000-0000-4000-8000-000000000007'::uuid, '21100000-0000-4000-8000-000000000002'::uuid, 'tagliatelle-ragu',
   'Tagliatelle with beef ragù', 'Tagliatelle al ragù',
   'Slow-cooked beef ragù, fresh egg tagliatelle.',
   'Ragù di manzo a cottura lenta, tagliatelle fresche all''uovo.',
   1700, 30, 'Fresh pasta is rolled on a shared floured surface.', 'approved'),
  ('31100000-0000-4000-8000-000000000008'::uuid, '21100000-0000-4000-8000-000000000002'::uuid, 'gnocchi-pesto',
   'Potato gnocchi with basil pesto', 'Gnocchi al pesto di basilico',
   'Potato gnocchi, basil pesto with pine nuts and cashews, pecorino.',
   'Gnocchi di patate, pesto di basilico con pinoli e anacardi, pecorino.',
   1650, 40, 'Pesto is made in a blender also used for nut-based sauces.', 'approved'),
  ('31100000-0000-4000-8000-000000000009'::uuid, '21100000-0000-4000-8000-000000000002'::uuid, 'zuppa-ceci',
   'Chickpea and rosemary soup', 'Zuppa di ceci e rosmarino',
   'Chickpeas, rosemary, vegetable stock, olive oil.',
   'Ceci, rosmarino, brodo vegetale, olio d''oliva.',
   950, 50, null, 'approved'),

  -- Secondi
  ('31100000-0000-4000-8000-000000000010'::uuid, '21100000-0000-4000-8000-000000000003'::uuid, 'branzino-forno',
   'Baked sea bass', 'Branzino al forno',
   'Whole sea bass baked with lemon, herbs and potatoes.',
   'Branzino intero al forno con limone, erbe e patate.',
   2400, 10, null, 'approved'),
  ('31100000-0000-4000-8000-000000000011'::uuid, '21100000-0000-4000-8000-000000000003'::uuid, 'pollo-cacciatora',
   'Chicken cacciatora', 'Pollo alla cacciatora',
   'Braised chicken, tomato, olives, peppers.',
   'Pollo brasato, pomodoro, olive, peperoni.',
   2100, 20, null, 'approved'),
  ('31100000-0000-4000-8000-000000000012'::uuid, '21100000-0000-4000-8000-000000000003'::uuid, 'melanzane-parmigiana',
   'Aubergine parmigiana', 'Melanzane alla parmigiana',
   'Layered aubergine, tomato, mozzarella, parmesan, breadcrumbs.',
   'Melanzane a strati, pomodoro, mozzarella, parmigiano, pangrattato.',
   1600, 30, null, 'approved'),
  ('31100000-0000-4000-8000-000000000013'::uuid, '21100000-0000-4000-8000-000000000003'::uuid, 'bistecca-ferri',
   'Grilled ribeye', 'Bistecca ai ferri',
   'Dry-aged ribeye, rosemary salt.',
   'Costata frollata, sale al rosmarino.',
   2950, 40, 'Grilled on the same grill as marinated items.', 'pending_review'),

  -- Contorni
  ('31100000-0000-4000-8000-000000000014'::uuid, '21100000-0000-4000-8000-000000000004'::uuid, 'patate-rosmarino',
   'Rosemary potatoes', 'Patate al rosmarino',
   'Oven-roasted potatoes, rosemary, sea salt.',
   'Patate al forno, rosmarino, sale marino.',
   500, 10, 'Finished in the shared fryer, which is also used for floured items.', 'approved'),
  ('31100000-0000-4000-8000-000000000015'::uuid, '21100000-0000-4000-8000-000000000004'::uuid, 'insalata-mista',
   'Mixed leaf salad', 'Insalata mista',
   'Seasonal leaves, house dressing.',
   'Insalata di stagione, condimento della casa.',
   550, 20, null, 'approved'),

  -- Dolci
  ('31100000-0000-4000-8000-000000000016'::uuid, '21100000-0000-4000-8000-000000000005'::uuid, 'tiramisu',
   'Tiramisù', 'Tiramisù',
   'Mascarpone, espresso-soaked savoiardi, cocoa.',
   'Mascarpone, savoiardi inzuppati nell''espresso, cacao.',
   800, 10, 'Assembled in the same area as flour-based desserts.', 'approved'),
  ('31100000-0000-4000-8000-000000000017'::uuid, '21100000-0000-4000-8000-000000000005'::uuid, 'panna-cotta',
   'Panna cotta with berries', 'Panna cotta ai frutti di bosco',
   'Vanilla panna cotta, seasonal berry compote.',
   'Panna cotta alla vaniglia, composta di frutti di bosco.',
   750, 20, null, 'approved'),
  ('31100000-0000-4000-8000-000000000018'::uuid, '21100000-0000-4000-8000-000000000005'::uuid, 'sorbetto-limone',
   'Lemon sorbet', 'Sorbetto al limone',
   'Lemon sorbet made in-house.',
   'Sorbetto al limone di produzione propria.',
   600, 30, 'Made in a dedicated sorbet machine that is not used for dairy ice cream.', 'approved')
) as v(id, category, slug, name_en, name_it, desc_en, desc_it, price, ord, cc, status);

commit;

-- =============================================================================
-- Allergen declarations
-- =============================================================================
-- Three-state facts, exactly as the kitchen would declare them:
--   contains     — the dish contains the allergen
--   may_contain  — cross-contamination risk (shared fryer, shared board)
--   free_from    — the restaurant has explicitly declared its absence.
--                  An approved free_from row is required by constraint to carry
--                  a review date and a cross-contamination note.
--
-- "insalata-mista / sulphites" is intentionally left in draft: it models a
-- chef's note the manager has not signed off. The agent must not quote it, and
-- tests/integration/agent-surface.test.ts asserts exactly that.
-- =============================================================================
begin;

insert into public.menu_item_allergens (
  organisation_id, menu_item_id, allergen_id, presence,
  notes_en, notes_it, cross_contamination_notes,
  approval_status, approved_by, approved_at, last_reviewed_at, created_by
)
select
  'a0000000-0000-4000-8000-000000000001',
  mi.id, al.id, v.presence::app.allergen_presence,
  v.notes_en, v.notes_it, v.cc,
  v.status::app.approval_status,
  case when v.status = 'approved' then 'c0000000-0000-4000-8000-000000000003'::uuid end,
  case when v.status = 'approved' then now() - interval '18 days' end,
  case when v.status = 'approved' then now() - interval '18 days' end,
  'c0000000-0000-4000-8000-000000000003'
from (values
  ('bruschetta-vindaro','cereals_gluten','contains', 'Sourdough bread (wheat).', 'Pane a lievitazione naturale (grano).', null, 'approved'),
  ('burrata-pomodorini','milk','contains', 'Burrata.', 'Burrata.', null, 'approved'),
  ('tagliere-salumi','milk','contains', 'Cheese selection.', 'Selezione di formaggi.', null, 'approved'),
  ('tagliere-salumi','cereals_gluten','contains', 'Grissini (wheat).', 'Grissini (grano).', null, 'approved'),
  ('tagliere-salumi','sulphites','contains', 'Pickles and cured meats.', 'Sottaceti e salumi.', null, 'approved'),

  ('calamari-fritti','molluscs','contains', 'Squid.', 'Calamaro.', null, 'draft'),
  ('calamari-fritti','cereals_gluten','contains', 'Flour coating.', 'Infarinatura.', null, 'draft'),
  ('calamari-fritti','eggs','contains', 'Aioli.', 'Aioli.', null, 'draft'),

  ('spaghetti-vongole','cereals_gluten','contains', 'Durum wheat pasta.', 'Pasta di grano duro.', null, 'approved'),
  ('spaghetti-vongole','molluscs','contains', 'Clams.', 'Vongole.', null, 'approved'),

  ('risotto-porcini','milk','contains', 'Butter and parmesan.', 'Burro e parmigiano.', null, 'approved'),
  ('risotto-porcini','sulphites','may_contain', null, null, 'White wine is used in the base.', 'approved'),

  ('tagliatelle-ragu','cereals_gluten','contains', 'Fresh egg pasta (wheat).', 'Pasta fresca all''uovo (grano).', null, 'approved'),
  ('tagliatelle-ragu','eggs','contains', 'Fresh egg pasta.', 'Pasta fresca all''uovo.', null, 'approved'),
  ('tagliatelle-ragu','celery','contains', 'Soffritto base.', 'Base di soffritto.', null, 'approved'),
  ('tagliatelle-ragu','milk','may_contain', null, null, 'Finished with parmesan at the pass unless requested otherwise.', 'approved'),

  ('gnocchi-pesto','cereals_gluten','contains', 'Flour in the gnocchi dough.', 'Farina nell''impasto degli gnocchi.', null, 'approved'),
  ('gnocchi-pesto','milk','contains', 'Pecorino in the pesto.', 'Pecorino nel pesto.', null, 'approved'),
  ('gnocchi-pesto','nuts','contains', 'Pine nuts and cashews in the pesto.', 'Pinoli e anacardi nel pesto.', null, 'approved'),

  ('zuppa-ceci','celery','contains', 'Vegetable stock.', 'Brodo vegetale.', null, 'approved'),

  ('branzino-forno','fish','contains', 'Sea bass.', 'Branzino.', null, 'approved'),

  ('pollo-cacciatora','celery','contains', 'Soffritto base.', 'Base di soffritto.', null, 'approved'),
  ('pollo-cacciatora','sulphites','contains', 'Olives and wine.', 'Olive e vino.', null, 'approved'),

  ('melanzane-parmigiana','milk','contains', 'Mozzarella and parmesan.', 'Mozzarella e parmigiano.', null, 'approved'),
  ('melanzane-parmigiana','cereals_gluten','contains', 'Breadcrumbs.', 'Pangrattato.', null, 'approved'),
  ('melanzane-parmigiana','eggs','may_contain', null, null, 'Breadcrumb mix is prepared alongside egg-washed items.', 'approved'),

  -- Parent dish is pending_review, so this row can never reach a caller either.
  ('bistecca-ferri','cereals_gluten','free_from', 'No flour or marinade is used.', 'Non si usano farina né marinature.',
   'Cooked on a grill shared with marinated items that contain wheat.', 'pending_review'),

  -- The clearest "may contain" case in the menu: a shared fryer.
  ('patate-rosmarino','cereals_gluten','may_contain', null, null,
   'Finished in the shared fryer, which is also used for floured items.', 'approved'),

  ('insalata-mista','mustard','contains', 'House dressing.', 'Condimento della casa.', null, 'approved'),
  -- Intentionally unapproved: a chef''s note awaiting manager sign-off.
  ('insalata-mista','sulphites','contains', 'Added to the dressing from this week.', 'Aggiunti al condimento da questa settimana.', null, 'draft'),

  ('tiramisu','eggs','contains', 'Zabaione base.', 'Base di zabaione.', null, 'approved'),
  ('tiramisu','milk','contains', 'Mascarpone.', 'Mascarpone.', null, 'approved'),
  ('tiramisu','cereals_gluten','contains', 'Savoiardi (wheat).', 'Savoiardi (grano).', null, 'approved'),

  ('panna-cotta','milk','contains', 'Cream.', 'Panna.', null, 'approved'),

  ('sorbetto-limone','milk','free_from', 'Made without any dairy ingredient.', 'Preparato senza alcun ingrediente lattiero-caseario.',
   'Produced in a dedicated sorbet machine that is not used for dairy ice cream. Serving utensils are shared.', 'approved')
) as v(item_slug, allergen_code, presence, notes_en, notes_it, cc, status)
join public.menu_items mi
  on mi.slug = v.item_slug and mi.location_id = 'b0000000-0000-4000-8000-000000000001'
join public.allergens al on al.code = v.allergen_code;

-- -----------------------------------------------------------------------------
-- Dietary attributes (preference labels, never safety claims)
-- -----------------------------------------------------------------------------
insert into public.menu_item_dietary_attributes (
  organisation_id, menu_item_id, dietary_attribute_id,
  approval_status, approved_by, approved_at, last_reviewed_at, created_by
)
select
  'a0000000-0000-4000-8000-000000000001', mi.id, da.id,
  'approved', 'c0000000-0000-4000-8000-000000000003', now() - interval '18 days',
  now() - interval '18 days', 'c0000000-0000-4000-8000-000000000003'
from (values
  ('bruschetta-vindaro','vegan'),
  ('bruschetta-vindaro','dairy_free'),
  ('burrata-pomodorini','vegetarian'),
  ('risotto-porcini','vegetarian'),
  ('risotto-porcini','contains_alcohol'),
  ('gnocchi-pesto','vegetarian'),
  ('zuppa-ceci','vegan'),
  ('zuppa-ceci','dairy_free'),
  ('branzino-forno','gluten_free_option'),
  ('melanzane-parmigiana','vegetarian'),
  ('patate-rosmarino','vegan'),
  ('patate-rosmarino','dairy_free'),
  ('insalata-mista','vegan'),
  ('insalata-mista','dairy_free'),
  ('tiramisu','vegetarian'),
  ('tiramisu','contains_alcohol'),
  ('panna-cotta','vegetarian'),
  ('panna-cotta','gluten_free_option'),
  ('sorbetto-limone','vegan'),
  ('sorbetto-limone','dairy_free')
) as v(item_slug, attribute_code)
join public.menu_items mi
  on mi.slug = v.item_slug and mi.location_id = 'b0000000-0000-4000-8000-000000000001'
join public.dietary_attributes da on da.code = v.attribute_code;

commit;

-- =============================================================================
-- Knowledge articles and FAQs (English + Italian)
-- =============================================================================
begin;

insert into public.knowledge_articles (
  organisation_id, location_id, category, slug, title_en, title_it, body_en, body_it,
  tags, display_order, approval_status, approved_by, approved_at, last_reviewed_at, created_by
)
select 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001',
       v.category::app.knowledge_category, v.slug, v.title_en, v.title_it, v.body_en, v.body_it,
       v.tags, v.ord, v.status::app.approval_status,
       case when v.status = 'approved' then 'c0000000-0000-4000-8000-000000000003'::uuid end,
       case when v.status = 'approved' then now() - interval '15 days' end,
       case when v.status = 'approved' then now() - interval '15 days' end,
       'c0000000-0000-4000-8000-000000000003'
from (values
  ('directions', 'getting-here', 'Getting here', 'Come raggiungerci',
   'We are on Cormorant Quay, on the south side of the river. The nearest tram stop is a four-minute walk. The blue door is the restaurant entrance; the green door beside it is the private room and is only open for booked events.',
   'Siamo su Cormorant Quay, sul lato sud del fiume. La fermata del tram più vicina è a quattro minuti a piedi. La porta blu è l''ingresso del ristorante; la porta verde accanto è la sala privata e si apre solo per eventi prenotati.',
   array['directions','transport'], 10, 'approved'),

  ('parking', 'parking', 'Parking', 'Parcheggio',
   'We do not have our own car park. There is a public multi-storey car park two streets away, open until midnight. On-street parking is metered until 19:00 and free after that.',
   'Non abbiamo un parcheggio nostro. C''è un parcheggio pubblico multipiano a due strade di distanza, aperto fino a mezzanotte. I posti su strada sono a pagamento fino alle 19:00 e gratuiti dopo.',
   array['parking','car'], 20, 'approved'),

  ('accessibility', 'accessibility', 'Accessibility', 'Accessibilità',
   'The dining room and the accessible toilet are at street level with no steps. The private room upstairs is reached by stairs only and has no lift. Please tell us when booking if you need a step-free table and we will reserve one in the main room.',
   'La sala e il bagno accessibile sono a livello strada, senza gradini. La sala privata al piano superiore è raggiungibile solo tramite scale e non c''è ascensore. Se le serve un tavolo senza gradini, ce lo dica al momento della prenotazione e ne riserveremo uno in sala principale.',
   array['accessibility','wheelchair','step-free'], 30, 'approved'),

  ('policies', 'booking-policy', 'Booking and cancellation policy', 'Politica di prenotazione e cancellazione',
   'Tables are held for fifteen minutes past the booking time. For parties of six or more we ask for a card to hold the booking and a cancellation at least twenty-four hours in advance. We do not charge a service fee; tips are entirely at your discretion.',
   'I tavoli vengono tenuti per quindici minuti oltre l''orario prenotato. Per tavoli da sei persone in su chiediamo una carta a garanzia e la cancellazione con almeno ventiquattro ore di anticipo. Non applichiamo coperto o costi di servizio; la mancia è totalmente a sua discrezione.',
   array['booking','cancellation','policy'], 40, 'approved'),

  ('services', 'services', 'What we offer', 'Cosa offriamo',
   'We serve lunch and dinner, we have a full bar, and we welcome children with a smaller portion of most pasta dishes. We are dog friendly at the two outside tables only. We do not offer takeaway or delivery.',
   'Serviamo pranzo e cena, abbiamo un bar completo e accogliamo i bambini con porzioni ridotte della maggior parte dei primi. Accettiamo cani solo ai due tavoli esterni. Non facciamo asporto né consegne.',
   array['services','children','dogs'], 50, 'approved'),

  ('events', 'private-events', 'Private events and large groups', 'Eventi privati e gruppi numerosi',
   'The upstairs room seats up to twenty-eight people and is available for private events. Group bookings and events are always arranged directly with the team rather than over the automated line.',
   'La sala al piano superiore ospita fino a ventotto persone ed è disponibile per eventi privati. Le prenotazioni di gruppo e gli eventi vengono sempre organizzati direttamente con il team e non tramite la linea automatica.',
   array['events','groups','private'], 60, 'approved'),

  -- Left unapproved on purpose: a draft the manager has not signed off.
  ('policies', 'corkage-draft', 'Corkage (draft)', 'Diritto di tappo (bozza)',
   'Proposed corkage of fifteen euro per bottle on Tuesdays. NOT YET APPROVED — do not quote this to guests.',
   'Diritto di tappo proposto di quindici euro a bottiglia il martedì. NON ANCORA APPROVATO — non comunicarlo ai clienti.',
   array['corkage','draft'], 70, 'draft')
) as v(category, slug, title_en, title_it, body_en, body_it, tags, ord, status);

insert into public.frequently_asked_questions (
  organisation_id, location_id, question_en, question_it, answer_en, answer_it,
  tags, display_order, approval_status, approved_by, approved_at, last_reviewed_at, created_by
)
select 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001',
       v.q_en, v.q_it, v.a_en, v.a_it, v.tags, v.ord,
       v.status::app.approval_status,
       case when v.status = 'approved' then 'c0000000-0000-4000-8000-000000000003'::uuid end,
       case when v.status = 'approved' then now() - interval '15 days' end,
       case when v.status = 'approved' then now() - interval '15 days' end,
       'c0000000-0000-4000-8000-000000000003'
from (values
  ('What are your opening hours?', 'Quali sono i vostri orari?',
   'We are closed on Mondays. Tuesday to Sunday we serve lunch from midday, and dinner from half past five, later on Friday and Saturday.',
   'Il lunedì siamo chiusi. Da martedì a domenica serviamo il pranzo da mezzogiorno e la cena dalle diciassette e trenta, più tardi il venerdì e il sabato.',
   array['hours','opening'], 10, 'approved'),
  ('Where are you?', 'Dove vi trovate?',
   'On Cormorant Quay in Dublin two, on the south side of the river.',
   'Su Cormorant Quay, a Dublino due, sul lato sud del fiume.',
   array['address','location'], 20, 'approved'),
  ('Do you have parking?', 'Avete il parcheggio?',
   'Not our own, but there is a public car park two streets away, open until midnight.',
   'Non uno nostro, ma c''è un parcheggio pubblico a due strade, aperto fino a mezzanotte.',
   array['parking'], 30, 'approved'),
  ('Is the restaurant wheelchair accessible?', 'Il ristorante è accessibile in sedia a rotelle?',
   'The main dining room and the accessible toilet are step-free. The upstairs room is not.',
   'La sala principale e il bagno accessibile sono senza gradini. La sala al piano superiore no.',
   array['accessibility'], 40, 'approved'),
  ('Do you have vegetarian dishes?', 'Avete piatti vegetariani?',
   'Yes, several, including the aubergine parmigiana and the porcini risotto.',
   'Sì, diversi, tra cui le melanzane alla parmigiana e il risotto ai porcini.',
   array['vegetarian','dietary'], 50, 'approved'),
  ('Do you have vegan dishes?', 'Avete piatti vegani?',
   'Yes. The chickpea and rosemary soup and the mixed salad are prepared without animal products.',
   'Sì. La zuppa di ceci e rosmarino e l''insalata mista sono preparate senza prodotti animali.',
   array['vegan','dietary'], 60, 'approved'),
  ('Can you cater for allergies?', 'Gestite le allergie?',
   'We hold detailed allergen information for every dish, and for any serious allergy we will always put you through to a member of the team.',
   'Abbiamo informazioni dettagliate sugli allergeni per ogni piatto e, per qualsiasi allergia grave, la mettiamo sempre in contatto con una persona del team.',
   array['allergy','allergens'], 70, 'approved'),
  ('Do you take walk-ins?', 'Si può venire senza prenotare?',
   'Yes, we keep a few tables for walk-ins, though at the weekend booking is safer.',
   'Sì, teniamo qualche tavolo per chi arriva senza prenotare, ma nel fine settimana è più sicuro prenotare.',
   array['booking','walk-in'], 80, 'approved'),
  ('Are children welcome?', 'I bambini sono benvenuti?',
   'Very much so. We can do smaller portions of most pasta dishes.',
   'Assolutamente sì. Possiamo fare porzioni ridotte della maggior parte dei primi.',
   array['children','family'], 90, 'approved'),
  ('Can we bring a dog?', 'Possiamo portare il cane?',
   'Dogs are welcome at the two outside tables.',
   'I cani sono benvenuti ai due tavoli esterni.',
   array['dogs','pets'], 100, 'approved'),
  ('Do you do takeaway or delivery?', 'Fate asporto o consegne?',
   'No, we serve in the restaurant only.',
   'No, serviamo solo in ristorante.',
   array['takeaway','delivery'], 110, 'approved'),
  ('Can we book the private room?', 'Si può prenotare la sala privata?',
   'Yes, it seats up to twenty-eight. Private events are arranged directly with the team.',
   'Sì, ospita fino a ventotto persone. Gli eventi privati si organizzano direttamente con il team.',
   array['events','private','groups'], 120, 'approved'),
  -- Unapproved: demonstrates that a draft FAQ is invisible to the agent.
  ('Do you offer a tasting menu?', 'Fate un menu degustazione?',
   'Under discussion for the autumn. NOT YET APPROVED.',
   'In discussione per l''autunno. NON ANCORA APPROVATO.',
   array['menu','draft'], 130, 'draft')
) as v(q_en, q_it, a_en, a_it, tags, ord, status);

commit;

-- =============================================================================
-- Sample calls, reservations and their transcripts
-- =============================================================================
-- Twelve fictional calls covering the outcomes the dashboard has to display:
-- successful bookings in both languages, information-only calls, all five
-- escalation reasons, a booking-provider failure, an SMS failure, a failed
-- transfer and an abandoned call.
--
-- Note what the failure cases do NOT contain: in call 08 the caller is told the
-- booking could not be completed, and the reservation row is 'failed' with a
-- reason. There is no confirmed reservation anywhere without a provider
-- reference, because the database constraint forbids it.
-- =============================================================================
begin;

insert into public.call_sessions (
  id, organisation_id, location_id, provider, provider_call_id, direction, status, outcome,
  started_at, ended_at, caller_number_e164, caller_ref, caller_name,
  initial_language, detected_language, primary_intent, intents,
  transfer_status, transfer_target_e164, escalation_reason, escalation_notes,
  recording_consent_given, retention_expires_at, cost_cents
)
select
  v.id, 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001',
  'retell', v.provider_call_id, 'inbound', 'completed', v.outcome::app.call_outcome,
  now() - v.age, now() - v.age + make_interval(secs => v.secs),
  v.caller, encode(sha256(convert_to('demo-salt' || v.caller, 'UTF8')), 'hex'), v.caller_name,
  v.lang::app.language_code, v.lang::app.language_code, v.intent, v.intents,
  v.transfer::app.transfer_status,
  case when v.transfer <> 'not_requested' then '+353015550141' end,
  v.reason::app.escalation_reason, v.notes,
  false, now() + interval '90 days', v.cost
from (values
  ('41100000-0000-4000-8000-000000000001'::uuid, 'demo_call_001', 'reservation_created',
   interval '2 days', 168, '+353871110001', 'Sarah Nolan', 'en', 'reservation',
   array['reservation'], 'not_requested', null, null, 41),
  ('41100000-0000-4000-8000-000000000002'::uuid, 'demo_call_002', 'reservation_created',
   interval '2 days 3 hours', 194, '+393331110002', 'Marco Bellini', 'it', 'reservation',
   array['reservation','hours'], 'not_requested', null, null, 47),
  ('41100000-0000-4000-8000-000000000003'::uuid, 'demo_call_003', 'resolved_information',
   interval '3 days', 52, '+353871110003', null, 'en', 'hours',
   array['hours','directions'], 'not_requested', null, null, 13),
  ('41100000-0000-4000-8000-000000000004'::uuid, 'demo_call_004', 'transferred',
   interval '3 days 5 hours', 74, '+393331110004', 'Elena Rossi', 'it', 'allergen',
   array['allergen','menu'], 'succeeded', 'severe_allergy',
   'Caller reported a severe nut allergy. Transferred immediately per policy.', 19),
  ('41100000-0000-4000-8000-000000000005'::uuid, 'demo_call_005', 'transferred',
   interval '4 days', 88, '+353871110005', 'Conor Walsh', 'en', 'large_group',
   array['reservation','large_group'], 'succeeded', 'large_group',
   'Party of 14 requested. Above the auto-book threshold of 8.', 22),
  ('41100000-0000-4000-8000-000000000006'::uuid, 'demo_call_006', 'transferred',
   interval '4 days 2 hours', 63, '+353871110006', null, 'en', 'complaint',
   array['complaint'], 'succeeded', 'complaint',
   'Caller unhappy about a previous visit. Transferred to the manager.', 16),
  ('41100000-0000-4000-8000-000000000007'::uuid, 'demo_call_007', 'transferred',
   interval '5 days', 31, '+353871110007', null, 'en', 'human_request',
   array['human_request'], 'succeeded', 'caller_request', 'Caller asked for a person straight away.', 8),
  ('41100000-0000-4000-8000-000000000008'::uuid, 'demo_call_008', 'reservation_failed',
   interval '5 days 4 hours', 142, '+353871110008', 'Aisling Doyle', 'en', 'reservation',
   array['reservation'], 'succeeded', 'tool_failure',
   'Booking provider returned 503 twice. Caller told the booking could NOT be completed, then transferred.', 35),
  ('41100000-0000-4000-8000-000000000009'::uuid, 'demo_call_009', 'transferred',
   interval '6 days', 57, '+393331110009', null, 'it', 'menu',
   array['menu'], 'succeeded', 'outside_approved_information',
   'Caller asked about a tasting menu. No approved record exists, so the agent did not answer.', 14),
  ('41100000-0000-4000-8000-000000000010'::uuid, 'demo_call_010', 'abandoned',
   interval '6 days 6 hours', 9, '+353871110010', null, 'en', 'unknown',
   array[]::text[], 'not_requested', null, null, 3),
  ('41100000-0000-4000-8000-000000000011'::uuid, 'demo_call_011', 'reservation_created',
   interval '7 days', 155, '+353871110011', 'Peter Hughes', 'en', 'reservation',
   array['reservation'], 'not_requested', null, null, 38),
  ('41100000-0000-4000-8000-000000000012'::uuid, 'demo_call_012', 'transfer_failed',
   interval '8 days', 96, '+353871110012', null, 'en', 'human_request',
   array['human_request'], 'failed', 'caller_request',
   'Transfer target did not answer. Agent admitted the failure and offered a call back.', 24)
) as v(id, provider_call_id, outcome, age, secs, caller, caller_name, lang, intent, intents,
       transfer, reason, notes, cost);

-- One call for the second tenant, so cross-tenant tests have something real to
-- fail to reach.
insert into public.call_sessions (
  organisation_id, location_id, provider, provider_call_id, direction, status, outcome,
  started_at, ended_at, caller_number_e164, primary_intent, initial_language, detected_language
) values (
  'a0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000002',
  'retell', 'demo_call_kestrel_001', 'inbound', 'completed', 'resolved_information',
  now() - interval '1 day', now() - interval '1 day' + interval '40 seconds',
  '+353871119001', 'hours', 'en', 'en'
);

-- -----------------------------------------------------------------------------
-- Reservations
-- -----------------------------------------------------------------------------
insert into public.reservations (
  id, organisation_id, location_id, source, source_call_id, status, provider,
  provider_reservation_id, customer_name, customer_phone_e164, party_size,
  reserved_for, duration_minutes, special_requirements, allergy_notes, has_allergy_flag,
  confirmation_sms_status, failure_reason
) values
  ('51100000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001',
   'b0000000-0000-4000-8000-000000000001', 'voice_agent', '41100000-0000-4000-8000-000000000001',
   'confirmed', 'internal', 'demo-int-0001', 'Sarah Nolan', '+353871110001', 4,
   date_trunc('day', now()) + interval '3 days 19 hours 30 minutes', 90,
   'Window table if possible.', null, false, 'delivered', null),

  ('51100000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001',
   'b0000000-0000-4000-8000-000000000001', 'voice_agent', '41100000-0000-4000-8000-000000000002',
   'confirmed', 'internal', 'demo-int-0002', 'Marco Bellini', '+393331110002', 2,
   date_trunc('day', now()) + interval '4 days 20 hours', 90,
   'Anniversario.', null, false, 'delivered', null),

  -- The booking-provider failure. Status 'failed', no provider reference, and a
  -- reason the constraint requires. The caller was never told it succeeded.
  ('51100000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001',
   'b0000000-0000-4000-8000-000000000001', 'voice_agent', '41100000-0000-4000-8000-000000000008',
   'failed', 'internal', null, 'Aisling Doyle', '+353871110008', 3,
   date_trunc('day', now()) + interval '2 days 18 hours', 90,
   null, null, false, null,
   'Booking provider unavailable (503) after one retry. Caller was told the booking could not be completed and was transferred to staff.'),

  -- Reservation succeeded, SMS did not. The reservation stays confirmed.
  ('51100000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001',
   'b0000000-0000-4000-8000-000000000001', 'voice_agent', '41100000-0000-4000-8000-000000000011',
   'confirmed', 'internal', 'demo-int-0004', 'Peter Hughes', '+353871110011', 2,
   date_trunc('day', now()) + interval '5 days 19 hours', 90,
   'Coeliac in the party — please speak to them at the table.',
   'Guest reported coeliac disease. Kitchen notified; staff to confirm at the table.', true,
   'failed', null),

  -- Taken by a member of staff over the phone, not by the agent.
  ('51100000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000001',
   'b0000000-0000-4000-8000-000000000001', 'staff', null,
   'confirmed', 'internal', 'demo-int-0005', 'Niamh Brady', '+353871110020', 6,
   date_trunc('day', now()) + interval '6 days 19 hours 30 minutes', 120,
   'Birthday, bringing a cake.', null, false, null, null);

update public.call_sessions set reservation_id = '51100000-0000-4000-8000-000000000001'
  where id = '41100000-0000-4000-8000-000000000001';
update public.call_sessions set reservation_id = '51100000-0000-4000-8000-000000000002'
  where id = '41100000-0000-4000-8000-000000000002';
update public.call_sessions set reservation_id = '51100000-0000-4000-8000-000000000003'
  where id = '41100000-0000-4000-8000-000000000008';
update public.call_sessions set reservation_id = '51100000-0000-4000-8000-000000000004'
  where id = '41100000-0000-4000-8000-000000000011';

commit;

-- =============================================================================
-- Transcripts, summaries, events and SMS records
-- =============================================================================
begin;

insert into public.call_transcripts (
  organisation_id, call_session_id, turn_index, speaker, content, language, confidence
)
select 'a0000000-0000-4000-8000-000000000001', cs.id, v.turn, v.speaker::app.speaker,
       v.content, v.lang::app.language_code, v.conf
from (values
  -- 001 · English reservation, read-back before confirming
  ('demo_call_001', 0, 'agent',  'Good evening, Osteria Vindaro. You are speaking with an automated assistant. How can I help?', 'en', null),
  ('demo_call_001', 1, 'caller', 'Hi, I''d like a table for Friday evening.', 'en', 0.962),
  ('demo_call_001', 2, 'agent',  'Of course. How many people will there be?', 'en', null),
  ('demo_call_001', 3, 'caller', 'Four of us.', 'en', 0.981),
  ('demo_call_001', 4, 'agent',  'And what time would suit you?', 'en', null),
  ('demo_call_001', 5, 'caller', 'Half seven if you have it.', 'en', 0.944),
  ('demo_call_001', 6, 'agent',  'We have half past seven on Friday. Can I take a name?', 'en', null),
  ('demo_call_001', 7, 'caller', 'Sarah Nolan.', 'en', 0.938),
  ('demo_call_001', 8, 'agent',  'Thank you. So that is Friday, half past seven, four people, under Sarah Nolan. Is that right?', 'en', null),
  ('demo_call_001', 9, 'caller', 'That''s right. Could we have a window table?', 'en', 0.951),
  ('demo_call_001', 10, 'agent', 'I''ll note the window request, though I can''t promise it. Your table is booked and I''ve sent you a text.', 'en', null),

  -- 002 · Italian reservation
  ('demo_call_002', 0, 'agent',  'Buonasera, Osteria Vindaro. Sta parlando con un assistente automatico. Come posso aiutarla?', 'it', null),
  ('demo_call_002', 1, 'caller', 'Buonasera, vorrei prenotare un tavolo per due sabato sera.', 'it', 0.958),
  ('demo_call_002', 2, 'agent',  'Certamente. A che ora preferisce?', 'it', null),
  ('demo_call_002', 3, 'caller', 'Alle otto, se possibile.', 'it', 0.973),
  ('demo_call_002', 4, 'agent',  'Alle otto abbiamo posto. Mi lascia un nome?', 'it', null),
  ('demo_call_002', 5, 'caller', 'Marco Bellini. È il nostro anniversario.', 'it', 0.929),
  ('demo_call_002', 6, 'agent',  'Riepilogo: sabato, ore venti, due persone, a nome Marco Bellini, per un anniversario. Confermo?', 'it', null),
  ('demo_call_002', 7, 'caller', 'Sì, perfetto.', 'it', 0.986),
  ('demo_call_002', 8, 'agent',  'Prenotazione confermata. Le ho inviato un messaggio con i dettagli.', 'it', null),

  -- 003 · Information only
  ('demo_call_003', 0, 'agent',  'Good afternoon, Osteria Vindaro. You are speaking with an automated assistant. How can I help?', 'en', null),
  ('demo_call_003', 1, 'caller', 'Are you open on a Monday?', 'en', 0.967),
  ('demo_call_003', 2, 'agent',  'We''re closed on Mondays. Tuesday to Sunday we do lunch from midday and dinner from half five.', 'en', null),
  ('demo_call_003', 3, 'caller', 'Grand, thanks.', 'en', 0.955),

  -- 004 · Severe allergy: the agent does not answer, it transfers
  ('demo_call_004', 0, 'agent',  'Buonasera, Osteria Vindaro. Sta parlando con un assistente automatico. Come posso aiutarla?', 'it', null),
  ('demo_call_004', 1, 'caller', 'Mia figlia è fortemente allergica alla frutta a guscio. Gli gnocchi al pesto sono sicuri?', 'it', 0.912),
  ('demo_call_004', 2, 'agent',  'Le posso dire che gli gnocchi al pesto contengono pinoli e anacardi, quindi frutta a guscio. Per un''allergia grave non posso darle garanzie: la metto subito in contatto con una persona del team.', 'it', null),
  ('demo_call_004', 3, 'caller', 'Sì, grazie.', 'it', 0.978),
  ('demo_call_004', 4, 'system', 'Transfer to +353015550141 initiated (reason: severe_allergy).', 'en', null),

  -- 005 · Large group above the auto-book threshold
  ('demo_call_005', 0, 'agent',  'Good evening, Osteria Vindaro. You are speaking with an automated assistant. How can I help?', 'en', null),
  ('demo_call_005', 1, 'caller', 'I need a table for fourteen people for a work night out.', 'en', 0.949),
  ('demo_call_005', 2, 'agent',  'For a group that size I''ll pass you to the team so they can look after it properly. One moment.', 'en', null),
  ('demo_call_005', 3, 'system', 'Transfer to +353015550141 initiated (reason: large_group).', 'en', null),

  -- 006 · Complaint
  ('demo_call_006', 0, 'agent',  'Good evening, Osteria Vindaro. You are speaking with an automated assistant. How can I help?', 'en', null),
  ('demo_call_006', 1, 'caller', 'We were in on Saturday and the service was very poor. I want to speak to somebody about it.', 'en', 0.933),
  ('demo_call_006', 2, 'agent',  'I''m sorry about that. Let me pass you to the manager now.', 'en', null),
  ('demo_call_006', 3, 'system', 'Transfer to +353015550141 initiated (reason: complaint).', 'en', null),

  -- 007 · Explicit request for a human
  ('demo_call_007', 0, 'agent',  'Good evening, Osteria Vindaro. You are speaking with an automated assistant. How can I help?', 'en', null),
  ('demo_call_007', 1, 'caller', 'Can I talk to a real person please?', 'en', 0.971),
  ('demo_call_007', 2, 'agent',  'Of course, one moment.', 'en', null),
  ('demo_call_007', 3, 'system', 'Transfer to +353015550141 initiated (reason: caller_request).', 'en', null),

  -- 008 · Booking provider failure — note what the agent does NOT say
  ('demo_call_008', 0, 'agent',  'Good evening, Osteria Vindaro. You are speaking with an automated assistant. How can I help?', 'en', null),
  ('demo_call_008', 1, 'caller', 'A table for three on Wednesday at six, please.', 'en', 0.957),
  ('demo_call_008', 2, 'agent',  'Can I take a name for that?', 'en', null),
  ('demo_call_008', 3, 'caller', 'Aisling Doyle.', 'en', 0.921),
  ('demo_call_008', 4, 'agent',  'Thank you. That is Wednesday at six, three people, under Aisling Doyle. Shall I book that?', 'en', null),
  ('demo_call_008', 5, 'caller', 'Yes please.', 'en', 0.984),
  ('demo_call_008', 6, 'system', 'Tool create_reservation failed: provider_unavailable (503). Retry 1 failed.', 'en', null),
  ('demo_call_008', 7, 'agent',  'I''m sorry — I can''t complete that booking right now, so it is not booked. Let me pass you to a colleague who can take it.', 'en', null),
  ('demo_call_008', 8, 'caller', 'Okay, thanks for telling me.', 'en', 0.962),
  ('demo_call_008', 9, 'system', 'Transfer to +353015550141 initiated (reason: tool_failure).', 'en', null),

  -- 009 · Outside approved information
  ('demo_call_009', 0, 'agent',  'Buonasera, Osteria Vindaro. Sta parlando con un assistente automatico. Come posso aiutarla?', 'it', null),
  ('demo_call_009', 1, 'caller', 'Avete un menu degustazione?', 'it', 0.945),
  ('demo_call_009', 2, 'agent',  'Non ho quell''informazione confermata, quindi preferisco non risponderle io. La passo a un collega.', 'it', null),
  ('demo_call_009', 3, 'system', 'Transfer to +353015550141 initiated (reason: outside_approved_information).', 'en', null),

  -- 010 · Abandoned
  ('demo_call_010', 0, 'agent',  'Good evening, Osteria Vindaro. You are speaking with an automated assistant. How can I help?', 'en', null),
  ('demo_call_010', 1, 'system', 'Caller disconnected after 9 seconds.', 'en', null),

  -- 011 · Booked, but the SMS failed
  ('demo_call_011', 0, 'agent',  'Good evening, Osteria Vindaro. You are speaking with an automated assistant. How can I help?', 'en', null),
  ('demo_call_011', 1, 'caller', 'Table for two on Sunday at seven. One of us is coeliac.', 'en', 0.940),
  ('demo_call_011', 2, 'agent',  'I''ve noted that. Because it''s coeliac disease, please mention it to the team at the table as well. Can I take a name?', 'en', null),
  ('demo_call_011', 3, 'caller', 'Peter Hughes.', 'en', 0.958),
  ('demo_call_011', 4, 'agent',  'Sunday at seven, two people, under Peter Hughes, with a coeliac note. Shall I book it?', 'en', null),
  ('demo_call_011', 5, 'caller', 'Yes.', 'en', 0.990),
  ('demo_call_011', 6, 'system', 'Reservation created (demo-int-0004). Tool send_sms failed: undeliverable.', 'en', null),
  ('demo_call_011', 7, 'agent',  'Your table is booked. The text message didn''t go through, but you are confirmed for Sunday at seven.', 'en', null),

  -- 012 · Transfer failed — admitted, not hidden
  ('demo_call_012', 0, 'agent',  'Good evening, Osteria Vindaro. You are speaking with an automated assistant. How can I help?', 'en', null),
  ('demo_call_012', 1, 'caller', 'Put me through to somebody, please.', 'en', 0.966),
  ('demo_call_012', 2, 'agent',  'Of course, one moment.', 'en', null),
  ('demo_call_012', 3, 'system', 'Transfer to +353015550141 failed: no_answer.', 'en', null),
  ('demo_call_012', 4, 'agent',  'I''m sorry, I can''t reach a colleague at the moment. May I take your number so somebody can call you back?', 'en', null),
  ('demo_call_012', 5, 'caller', 'Yes, they have my number.', 'en', 0.954)
) as v(provider_call_id, turn, speaker, content, lang, conf)
join public.call_sessions cs on cs.provider_call_id = v.provider_call_id;

insert into public.call_summaries (
  organisation_id, call_session_id, language, summary, key_points, detected_intent, sentiment, model
)
select 'a0000000-0000-4000-8000-000000000001', cs.id, v.lang::app.language_code,
       v.summary, v.key_points::jsonb, v.intent, v.sentiment, 'demo-seed'
from (values
  ('demo_call_001','en','Caller booked a table for four on Friday at 19:30 under Sarah Nolan. Window table requested but not guaranteed. Confirmation SMS delivered.','["reservation confirmed","party of 4","window table requested"]','reservation','positive'),
  ('demo_call_002','it','Prenotazione confermata per due persone sabato alle 20:00 a nome Marco Bellini, per un anniversario. SMS di conferma consegnato.','["prenotazione confermata","2 persone","anniversario"]','reservation','positive'),
  ('demo_call_003','en','Caller asked whether the restaurant opens on Mondays. Answered from approved opening hours. No booking requested.','["hours enquiry","closed Mondays"]','hours','neutral'),
  ('demo_call_004','it','Allergia grave alla frutta a guscio. L''agente ha riportato la dichiarazione approvata (gnocchi al pesto contengono pinoli e anacardi), non ha dato garanzie di sicurezza e ha trasferito immediatamente al personale.','["allergia grave","frutta a guscio","trasferimento obbligatorio"]','allergen','neutral'),
  ('demo_call_005','en','Request for a party of 14, above the auto-book threshold of 8. Escalated to staff without attempting to book.','["large group","14 guests","escalated"]','large_group','neutral'),
  ('demo_call_006','en','Complaint about service on a previous visit. Transferred to the manager without attempting to resolve it.','["complaint","transferred to manager"]','complaint','negative'),
  ('demo_call_007','en','Caller asked for a person immediately. Transferred without further questions.','["human requested","transferred"]','human_request','neutral'),
  ('demo_call_008','en','Booking for three on Wednesday at 18:00 could not be created: the booking provider returned 503 twice. The caller was told explicitly that the table was NOT booked, then transferred to staff.','["booking provider failure","no false confirmation","transferred"]','reservation','negative'),
  ('demo_call_009','it','Domanda su un menu degustazione. Nessun dato approvato disponibile: l''agente non ha risposto e ha trasferito.','["informazione non approvata","trasferimento"]','menu','neutral'),
  ('demo_call_010','en','Caller disconnected after nine seconds without stating a reason.','["abandoned"]','unknown','neutral'),
  ('demo_call_011','en','Table for two on Sunday at 19:00 booked under Peter Hughes with a coeliac note. The confirmation SMS failed; the caller was told the booking stands and the SMS did not go through.','["reservation confirmed","sms failed","coeliac noted"]','reservation','positive'),
  ('demo_call_012','en','Caller asked for a person. The transfer failed (no answer). The agent admitted the failure and offered a call back.','["transfer failed","admitted honestly","callback offered"]','human_request','negative')
) as v(provider_call_id, lang, summary, key_points, intent, sentiment)
join public.call_sessions cs on cs.provider_call_id = v.provider_call_id;

insert into public.call_events (
  organisation_id, call_session_id, sequence, event_type, tool_name, payload, error_code, error_message, occurred_at
)
select 'a0000000-0000-4000-8000-000000000001', cs.id, v.seq, v.event::app.call_event_type,
       v.tool, v.payload::jsonb, v.error_code, v.error_message, cs.started_at + make_interval(secs => v.offset_s)
from (values
  ('demo_call_001', 0, 'call_started', null, '{}', null, null, 0),
  ('demo_call_001', 1, 'tool_called', 'check_availability', '{"party_size":4,"date":"friday","time":"19:30"}', null, null, 22),
  ('demo_call_001', 2, 'tool_succeeded', 'check_availability', '{"slots_returned":3}', null, null, 23),
  ('demo_call_001', 3, 'reservation_created', 'create_reservation', '{"provider":"internal","party_size":4}', null, null, 120),
  ('demo_call_001', 4, 'sms_sent', 'send_sms', '{"template":"reservation_confirmation","language":"en"}', null, null, 128),
  ('demo_call_001', 5, 'call_ended', null, '{"outcome":"reservation_created"}', null, null, 168),

  ('demo_call_004', 0, 'call_started', null, '{}', null, null, 0),
  ('demo_call_004', 1, 'tool_called', 'get_allergen_info', '{"menu_item":"gnocchi-pesto"}', null, null, 18),
  ('demo_call_004', 2, 'tool_succeeded', 'get_allergen_info', '{"contains":["nuts","milk","cereals_gluten"]}', null, null, 19),
  ('demo_call_004', 3, 'escalation_raised', null, '{"reason":"severe_allergy"}', null, null, 40),
  ('demo_call_004', 4, 'transfer_requested', 'request_transfer', '{"target":"+353015550141"}', null, null, 42),
  ('demo_call_004', 5, 'transfer_succeeded', 'request_transfer', '{}', null, null, 48),
  ('demo_call_004', 6, 'call_ended', null, '{"outcome":"transferred"}', null, null, 74),

  ('demo_call_008', 0, 'call_started', null, '{}', null, null, 0),
  ('demo_call_008', 1, 'tool_called', 'check_availability', '{"party_size":3}', null, null, 20),
  ('demo_call_008', 2, 'tool_succeeded', 'check_availability', '{"slots_returned":2}', null, null, 21),
  ('demo_call_008', 3, 'tool_called', 'create_reservation', '{"party_size":3}', null, null, 88),
  ('demo_call_008', 4, 'tool_failed', 'create_reservation', '{"attempt":1}', 'provider_unavailable', 'Booking provider returned 503', 90),
  ('demo_call_008', 5, 'tool_failed', 'create_reservation', '{"attempt":2}', 'provider_unavailable', 'Booking provider returned 503', 96),
  ('demo_call_008', 6, 'reservation_failed', null, '{"told_caller":true}', 'provider_unavailable', 'Reservation not created; caller informed', 100),
  ('demo_call_008', 7, 'escalation_raised', null, '{"reason":"tool_failure"}', null, null, 104),
  ('demo_call_008', 8, 'transfer_succeeded', 'request_transfer', '{}', null, null, 112),
  ('demo_call_008', 9, 'call_ended', null, '{"outcome":"reservation_failed"}', null, null, 142),

  ('demo_call_011', 0, 'call_started', null, '{}', null, null, 0),
  ('demo_call_011', 1, 'reservation_created', 'create_reservation', '{"provider_reservation_id":"demo-int-0004"}', null, null, 110),
  ('demo_call_011', 2, 'sms_failed', 'send_sms', '{"template":"reservation_confirmation"}', 'undeliverable', 'Carrier rejected the message', 118),
  ('demo_call_011', 3, 'call_ended', null, '{"outcome":"reservation_created","sms":"failed"}', null, null, 155),

  ('demo_call_012', 0, 'call_started', null, '{}', null, null, 0),
  ('demo_call_012', 1, 'transfer_requested', 'request_transfer', '{"target":"+353015550141"}', null, null, 20),
  ('demo_call_012', 2, 'transfer_failed', 'request_transfer', '{"attempts":1}', 'no_answer', 'Transfer target did not answer', 55),
  ('demo_call_012', 3, 'call_ended', null, '{"outcome":"transfer_failed"}', null, null, 96)
) as v(provider_call_id, seq, event, tool, payload, error_code, error_message, offset_s)
join public.call_sessions cs on cs.provider_call_id = v.provider_call_id;

insert into public.sms_messages (
  organisation_id, location_id, call_session_id, reservation_id, provider, provider_message_id,
  to_number_e164, template_key, language, status, error_code, sent_at
)
select 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001',
       cs.id, v.reservation::uuid, 'twilio', v.msg_id, v.to_number, v.template,
       v.lang::app.language_code, v.status::app.sms_status, v.error_code,
       case when v.status <> 'failed' then cs.started_at + interval '2 minutes' end
from (values
  ('demo_call_001', '51100000-0000-4000-8000-000000000001', 'demo-sms-0001', '+353871110001', 'reservation_confirmation', 'en', 'delivered', null),
  ('demo_call_002', '51100000-0000-4000-8000-000000000002', 'demo-sms-0002', '+393331110002', 'reservation_confirmation', 'it', 'delivered', null),
  ('demo_call_011', '51100000-0000-4000-8000-000000000004', null,            '+353871110011', 'reservation_confirmation', 'en', 'failed', 'undeliverable')
) as v(provider_call_id, reservation, msg_id, to_number, template, lang, status, error_code)
join public.call_sessions cs on cs.provider_call_id = v.provider_call_id;

commit;

-- =============================================================================
-- Explicit audit examples
-- =============================================================================
-- Most audit rows already exist: the audit triggers fired on every insert above.
-- These two are the actions a trigger cannot infer — a manager revealing a
-- caller's full phone number, and a platform operator opening a support session.
begin;

insert into public.audit_logs (
  organisation_id, actor_user_id, actor_email, actor_role, action,
  entity_type, entity_id, reason, ip_address, occurred_at
) values
  ('a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000003',
   'manager.demo@example.com', 'location_manager', 'unmask_pii',
   'call_sessions', '41100000-0000-4000-8000-000000000008',
   'Calling the guest back after the booking failure.', '203.0.113.24', now() - interval '5 days'),
  ('a0000000-0000-4000-8000-000000000001', null, 'support@example.com', null, 'support_access',
   'organisations', 'a0000000-0000-4000-8000-000000000001',
   'Investigating the reported booking-provider outage (demo record).', '203.0.113.9', now() - interval '5 days');

commit;

-- =============================================================================
-- Seed self-check
-- =============================================================================
do $$
declare
  v_approved_items integer;
  v_unapproved_items integer;
  v_confirmed_without_ref integer;
begin
  select count(*) into v_approved_items from public.menu_items where approval_status = 'approved';
  select count(*) into v_unapproved_items from public.menu_items where approval_status <> 'approved';
  select count(*) into v_confirmed_without_ref from public.reservations
    where status = 'confirmed' and provider_reservation_id is null;

  if v_approved_items < 15 then
    raise exception 'seed: expected at least 15 approved menu items, found %', v_approved_items;
  end if;
  if v_unapproved_items = 0 then
    raise exception 'seed: expected at least one unapproved menu item to exercise the approval gate';
  end if;
  if v_confirmed_without_ref > 0 then
    raise exception 'seed: found a confirmed reservation with no provider reference';
  end if;

  raise notice 'seed complete: % approved menu items, % unapproved, 0 false confirmations',
    v_approved_items, v_unapproved_items;
end
$$;
