-- =============================================================================
-- OSTERIA VINDARO — dati "impossibili da indovinare", per una prova a prova di dubbio
-- =============================================================================
-- Nomi volutamente strani: nessun modello linguistico li inventerebbe mai.
-- Se Astra li pronuncia, li ha letti dal database. Se sbaglia, sta improvvisando.
--
-- Contiene di proposito UN piatto NON approvato: Astra non deve conoscerlo.
-- =============================================================================

begin;

-- Indirizzo e contatti nuovi
update public.locations
   set address_line1 = 'Via Praga 14',
       address_line2 = 'Silicon Docks',
       city = 'Dublin',
       postal_code = 'D02 XK71',
       phone_e164 = '+353015550199',
       directions_note = 'The green door beside the bicycle shop, first floor.'
 where id = 'b0000000-0000-4000-8000-000000000001';

-- Piatti riconoscibilissimi
insert into public.menu_items (
  id, organisation_id, location_id, category_id, slug, name_en, name_it,
  description_en, description_it, price_cents, currency, is_available,
  display_order, approval_status, approved_at, approved_by
) values
  ('ab900000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001','21100000-0000-4000-8000-000000000003',
   'pamela-pistolin','Pamela Pistolin','Pamela Pistolin',
   'The house special. Slow braised lamb shoulder, burnt honey, smoked ricotta and a pistachio crust.',
   'Lo speciale della casa. Spalla di agnello brasata, miele bruciato, ricotta affumicata e crosta di pistacchi.',
   2750,'EUR',true,50,'approved',now(),'c0000000-0000-4000-8000-000000000001'),

  ('ab900000-0000-4000-8000-000000000002','a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001','21100000-0000-4000-8000-000000000001',
   'zuppa-ottovolante','Zuppa Ottovolante','Zuppa Ottovolante',
   'Chickpeas, burnt lemon and a great deal of black pepper.',
   'Ceci, limone bruciato e molto pepe nero.',
   980,'EUR',true,51,'approved',now(),'c0000000-0000-4000-8000-000000000001'),

  ('ab900000-0000-4000-8000-000000000003','a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001','21100000-0000-4000-8000-000000000002',
   'risotto-barnaba','Risotto Barnaba','Risotto Barnaba',
   'Carnaroli rice, nettle, aged Coolea cheese.',
   'Riso carnaroli, ortica, formaggio Coolea stagionato.',
   1820,'EUR',true,52,'approved',now(),'c0000000-0000-4000-8000-000000000001'),

  ('ab900000-0000-4000-8000-000000000004','a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001','21100000-0000-4000-8000-000000000005',
   'torta-miradolo','Torta Miradolo','Torta Miradolo',
   'Almond and blood orange cake, served warm.',
   'Torta di mandorle e arancia rossa, servita tiepida.',
   740,'EUR',true,53,'approved',now(),'c0000000-0000-4000-8000-000000000001'),

  -- NON approvato di proposito: Astra non deve conoscerlo.
  ('ab900000-0000-4000-8000-000000000005','a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001','21100000-0000-4000-8000-000000000002',
   'gnocchi-fenoglio','Gnocchi Fenoglio','Gnocchi Fenoglio',
   'Potato gnocchi, wild garlic, brown butter.',
   'Gnocchi di patate, aglio orsino, burro nocciola.',
   1690,'EUR',true,54,'draft',null,null)
on conflict (id) do nothing;

-- Allergeni dei piatti nuovi (inventati: il ristorante e' di fantasia)
insert into public.menu_item_allergens (
  organisation_id, menu_item_id, allergen_id, presence, notes_en, notes_it,
  approval_status, approved_at, approved_by
) values
  -- Pamela Pistolin: latte + frutta a guscio dichiarati
  ('a0000000-0000-4000-8000-000000000001','ab900000-0000-4000-8000-000000000001','a1100000-0000-4000-8000-000000000007','contains',null,null,'approved',now(),'c0000000-0000-4000-8000-000000000001'),
  ('a0000000-0000-4000-8000-000000000001','ab900000-0000-4000-8000-000000000001','a1100000-0000-4000-8000-000000000008','contains',null,null,'approved',now(),'c0000000-0000-4000-8000-000000000001'),
  -- Risotto Barnaba: latte; puo' contenere sedano
  ('a0000000-0000-4000-8000-000000000001','ab900000-0000-4000-8000-000000000003','a1100000-0000-4000-8000-000000000007','contains',null,null,'approved',now(),'c0000000-0000-4000-8000-000000000001'),
  ('a0000000-0000-4000-8000-000000000001','ab900000-0000-4000-8000-000000000003','a1100000-0000-4000-8000-000000000009','may_contain','Stock is made in a pan shared with the celery broth.','Il brodo si prepara in una pentola condivisa con il brodo di sedano.','approved',now(),'c0000000-0000-4000-8000-000000000001'),
  -- Torta Miradolo: frutta a guscio, uova, latte
  ('a0000000-0000-4000-8000-000000000001','ab900000-0000-4000-8000-000000000004','a1100000-0000-4000-8000-000000000008','contains',null,null,'approved',now(),'c0000000-0000-4000-8000-000000000001'),
  ('a0000000-0000-4000-8000-000000000001','ab900000-0000-4000-8000-000000000004','a1100000-0000-4000-8000-000000000003','contains',null,null,'approved',now(),'c0000000-0000-4000-8000-000000000001'),
  ('a0000000-0000-4000-8000-000000000001','ab900000-0000-4000-8000-000000000004','a1100000-0000-4000-8000-000000000007','contains',null,null,'approved',now(),'c0000000-0000-4000-8000-000000000001')
on conflict do nothing;

-- Fatti riconoscibili
insert into public.frequently_asked_questions (
  id, organisation_id, location_id, question_en, question_it, answer_en, answer_it,
  tags, display_order, approval_status, approved_at, approved_by
) values
  ('ab800000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001',
   'Who is the head chef?','Chi è lo chef?',
   'The head chef is Ottavia Mengoni. She has been with us since the restaurant opened.',
   'La chef è Ottavia Mengoni. È con noi da quando il ristorante ha aperto.',
   array['about'], 40, 'approved', now(), 'c0000000-0000-4000-8000-000000000001'),

  ('ab800000-0000-4000-8000-000000000002','a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001',
   'Do you have wifi?','Avete il wifi?',
   'Yes. The network is Vindaro Guest and the password is calamaro nine nine.',
   'Sì. La rete si chiama Vindaro Guest e la password è calamaro nove nove.',
   array['wifi'], 41, 'approved', now(), 'c0000000-0000-4000-8000-000000000001'),

  ('ab800000-0000-4000-8000-000000000003','a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001',
   'What is the special today?','Qual è lo speciale di oggi?',
   'The house special is the Pamela Pistolin, twenty seven fifty. Slow braised lamb shoulder with burnt honey, smoked ricotta and a pistachio crust.',
   'Lo speciale della casa è la Pamela Pistolin, ventisette e cinquanta. Spalla di agnello brasata con miele bruciato, ricotta affumicata e crosta di pistacchi.',
   array['menu','special'], 42, 'approved', now(), 'c0000000-0000-4000-8000-000000000001'),

  ('ab800000-0000-4000-8000-000000000004','a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001',
   'Is there a table with a view?','C''è un tavolo con vista?',
   'Table nine, by the corner window over the water. Ask for it when you book, we cannot always promise it.',
   'Il tavolo nove, all''angolo con la finestra sull''acqua. Chiedetelo alla prenotazione, non possiamo sempre garantirlo.',
   array['seating'], 43, 'approved', now(), 'c0000000-0000-4000-8000-000000000001')
on conflict (id) do nothing;

commit;

select
  (select address_line1 || ', ' || city from public.locations
    where id = 'b0000000-0000-4000-8000-000000000001')                  as indirizzo,
  (select count(*) from public.menu_items
    where location_id = 'b0000000-0000-4000-8000-000000000001'
      and approval_status = 'approved')                                 as piatti_approvati,
  (select count(*) from public.menu_items
    where location_id = 'b0000000-0000-4000-8000-000000000001'
      and approval_status = 'draft')                                    as piatti_in_bozza,
  (select count(*) from public.frequently_asked_questions
    where location_id = 'b0000000-0000-4000-8000-000000000001'
      and approval_status = 'approved')                                 as risposte_approvate;
