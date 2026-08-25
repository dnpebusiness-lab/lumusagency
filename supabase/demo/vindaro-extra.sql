-- =============================================================================
-- OSTERIA VINDARO — informazioni aggiuntive per una telefonata realistica
-- =============================================================================
-- Tutto inventato: Osteria Vindaro e' un ristorante di fantasia. Gli allergeni
-- qui sotto sono plausibili ma immaginari, e vanno bene proprio perche' il
-- ristorante non esiste. Per un locale vero devono venire dalla cucina.
--
-- Aggiunge: 12 risposte a domande frequenti (compresa l'ora di chiusura della
-- cucina), 7 piatti nuovi con le loro dichiarazioni allergeni, e una nota di
-- ultimi ordini su ogni fascia oraria.
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- Pulizia: la sede ha gia' una risposta approvata sul parcheggio nel seed.
-- Questa riga toglie l'eventuale doppione aggiunto a mano durante le prove.
-- -----------------------------------------------------------------------------
delete from public.frequently_asked_questions
 where id = '99900000-0000-4000-8000-000000000002';

-- -----------------------------------------------------------------------------
-- Ultimi ordini, scritti sulla fascia oraria a cui appartengono
-- -----------------------------------------------------------------------------
update public.business_hours
   set note = 'Last orders thirty minutes before closing.'
 where location_id = 'b0000000-0000-4000-8000-000000000001'
   and is_closed = false;

-- -----------------------------------------------------------------------------
-- Domande frequenti
-- -----------------------------------------------------------------------------
insert into public.frequently_asked_questions (
  id, organisation_id, location_id, question_en, question_it, answer_en, answer_it,
  tags, display_order, approval_status, approved_at, approved_by
) values
  ('aa800000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001',
   'What time does the kitchen close?','A che ora chiude la cucina?',
   'The kitchen takes last orders half an hour before we close. At lunch that is half past two, Tuesday to Friday, and half past three on Saturday and Sunday. In the evening it is ten o''clock Tuesday to Thursday, and eleven on Friday and Saturday.',
   'La cucina prende le ultime ordinazioni mezz''ora prima della chiusura. A pranzo sono le due e mezza da martedì a venerdì, e le tre e mezza il sabato e la domenica. La sera sono le dieci da martedì a giovedì, e le undici il venerdì e il sabato.',
   array['hours','kitchen'], 20, 'approved', now(), 'c0000000-0000-4000-8000-000000000001'),

  ('aa800000-0000-4000-8000-000000000002','a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001',
   'How far in advance should I book?','Con quanto anticipo conviene prenotare?',
   'For a weekday evening a day or two is usually enough. Friday and Saturday fill up about a week ahead, and we hold a few tables for walk-ins each evening.',
   'Per una sera infrasettimanale bastano di solito uno o due giorni. Il venerdì e il sabato si riempiono circa una settimana prima, e ogni sera teniamo qualche tavolo per chi arriva senza prenotazione.',
   array['booking'], 21, 'approved', now(), 'c0000000-0000-4000-8000-000000000001'),

  ('aa800000-0000-4000-8000-000000000003','a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001',
   'Do you take large groups?','Accettate gruppi numerosi?',
   'Up to eight people we book as normal. Above that a member of the team will call you back to agree the menu and a deposit.',
   'Fino a otto persone prenotiamo normalmente. Sopra, una persona del ristorante la richiama per concordare il menù e un acconto.',
   array['groups'], 22, 'approved', now(), 'c0000000-0000-4000-8000-000000000001'),

  ('aa800000-0000-4000-8000-000000000004','a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001',
   'Do you have outdoor seating?','Avete tavoli all''aperto?',
   'There are six tables on the quay side, first come first served, and they are covered and heated until the end of October.',
   'Ci sono sei tavoli sul lato del molo, senza prenotazione, coperti e riscaldati fino a fine ottobre.',
   array['seating'], 23, 'approved', now(), 'c0000000-0000-4000-8000-000000000001'),

  ('aa800000-0000-4000-8000-000000000005','a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001',
   'Do you have gluten free pasta?','Avete pasta senza glutine?',
   'We keep a gluten free penne and cook it in a separate pot. Please mention it when you book so the kitchen is ready, and speak to a member of staff about it on the day.',
   'Teniamo una penna senza glutine e la cuociamo in una pentola separata. Lo segnali al momento della prenotazione così la cucina si organizza, e ne parli con una persona del personale il giorno stesso.',
   array['dietary','gluten'], 24, 'approved', now(), 'c0000000-0000-4000-8000-000000000001'),

  ('aa800000-0000-4000-8000-000000000006','a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001',
   'Do you have high chairs and childrens portions?','Avete seggioloni e porzioni per bambini?',
   'Yes, three high chairs and a small pasta portion for children at eight euro. There is a changing table in the accessible toilet.',
   'Sì, tre seggioloni e una porzione piccola di pasta per bambini a otto euro. C''è un fasciatoio nel bagno accessibile.',
   array['children'], 25, 'approved', now(), 'c0000000-0000-4000-8000-000000000001'),

  ('aa800000-0000-4000-8000-000000000007','a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001',
   'Do you charge corkage?','Si può portare il vino da fuori?',
   'Yes, ten euro a bottle, and we ask that it is not something already on our wine list.',
   'Sì, dieci euro a bottiglia, e chiediamo che non sia un vino già presente nella nostra carta.',
   array['wine'], 26, 'approved', now(), 'c0000000-0000-4000-8000-000000000001'),

  ('aa800000-0000-4000-8000-000000000008','a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001',
   'Do you add a service charge?','Aggiungete il coperto o il servizio?',
   'There is no cover charge. A ten per cent service charge is added for tables of six or more, and it is optional.',
   'Non c''è coperto. Per i tavoli da sei persone in su viene aggiunto un servizio del dieci per cento, ed è facoltativo.',
   array['payment'], 27, 'approved', now(), 'c0000000-0000-4000-8000-000000000001'),

  ('aa800000-0000-4000-8000-000000000009','a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001',
   'What is the nearest public transport?','Qual è il mezzo pubblico più vicino?',
   'Grand Canal Dock DART station is a seven minute walk, and the Luas green line at Spencer Dock is about twelve minutes.',
   'La stazione DART di Grand Canal Dock è a sette minuti a piedi, e il Luas della linea verde a Spencer Dock è a circa dodici.',
   array['directions'], 28, 'approved', now(), 'c0000000-0000-4000-8000-000000000001'),

  ('aa800000-0000-4000-8000-000000000010','a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001',
   'Do you do set menus for groups?','Fate menù fissi per gruppi?',
   'For eight or more there is a set menu at thirty eight euro a head, three courses, chosen a few days ahead.',
   'Da otto persone in su c''è un menù fisso a trentotto euro a testa, tre portate, da scegliere qualche giorno prima.',
   array['groups','menu'], 29, 'approved', now(), 'c0000000-0000-4000-8000-000000000001'),

  ('aa800000-0000-4000-8000-000000000011','a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001',
   'Are you open on bank holidays?','Siete aperti nei giorni festivi?',
   'We open for lunch on bank holiday Mondays, half past twelve to four, and stay closed in the evening.',
   'Nei lunedì festivi apriamo a pranzo, dalle dodici e mezza alle quattro, e restiamo chiusi la sera.',
   array['hours'], 30, 'approved', now(), 'c0000000-0000-4000-8000-000000000001'),

  ('aa800000-0000-4000-8000-000000000012','a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001',
   'Can I pay by card?','Si può pagare con la carta?',
   'All the usual cards, and contactless. We do not split a bill more than four ways.',
   'Tutte le carte più comuni, e il contactless. Non dividiamo un conto in più di quattro parti.',
   array['payment'], 31, 'approved', now(), 'c0000000-0000-4000-8000-000000000001')
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- Piatti nuovi
-- -----------------------------------------------------------------------------
insert into public.menu_items (
  id, organisation_id, location_id, category_id, slug, name_en, name_it,
  description_en, description_it, price_cents, currency, is_available,
  display_order, approval_status, approved_at, approved_by
) values
  ('aa900000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001','21100000-0000-4000-8000-000000000001',
   'arancini','Arancini','Arancini','Three saffron rice balls, mozzarella and beef ragù.','Tre arancini allo zafferano, mozzarella e ragù di manzo.',
   900,'EUR',true,40,'approved',now(),'c0000000-0000-4000-8000-000000000001'),

  ('aa900000-0000-4000-8000-000000000002','a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001','21100000-0000-4000-8000-000000000001',
   'vitello-tonnato','Vitello tonnato','Vitello tonnato','Thin sliced veal, tuna and caper sauce.','Fettine di vitello, salsa tonnata e capperi.',
   1350,'EUR',true,41,'approved',now(),'c0000000-0000-4000-8000-000000000001'),

  ('aa900000-0000-4000-8000-000000000003','a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001','21100000-0000-4000-8000-000000000002',
   'cacio-e-pepe','Cacio e pepe','Cacio e pepe','Tonnarelli, pecorino romano and black pepper.','Tonnarelli, pecorino romano e pepe nero.',
   1550,'EUR',true,42,'approved',now(),'c0000000-0000-4000-8000-000000000001'),

  ('aa900000-0000-4000-8000-000000000004','a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001','21100000-0000-4000-8000-000000000002',
   'lasagne-al-forno','Lasagne al forno','Lasagne al forno','Layered pasta, beef ragù and béchamel.','Pasta a strati, ragù di manzo e besciamella.',
   1750,'EUR',true,43,'approved',now(),'c0000000-0000-4000-8000-000000000001'),

  ('aa900000-0000-4000-8000-000000000005','a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001','21100000-0000-4000-8000-000000000002',
   'pasta-piccola-bambini','Small pasta for children','Pasta piccola per bambini','A small plate of pasta with tomato or butter.','Un piatto piccolo di pasta al pomodoro o al burro.',
   800,'EUR',true,44,'approved',now(),'c0000000-0000-4000-8000-000000000001'),

  ('aa900000-0000-4000-8000-000000000006','a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001','21100000-0000-4000-8000-000000000003',
   'polpo-alla-griglia','Grilled octopus','Polpo alla griglia','Grilled octopus, potato and salmoriglio.','Polpo grigliato, patate e salmoriglio.',
   2300,'EUR',true,45,'approved',now(),'c0000000-0000-4000-8000-000000000001'),

  ('aa900000-0000-4000-8000-000000000007','a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001','21100000-0000-4000-8000-000000000005',
   'affogato','Affogato','Affogato','Vanilla gelato under a shot of espresso.','Gelato alla vaniglia con un caffè espresso.',
   700,'EUR',true,46,'approved',now(),'c0000000-0000-4000-8000-000000000001')
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- Allergeni dei piatti nuovi (inventati, ristorante di fantasia)
-- -----------------------------------------------------------------------------
insert into public.menu_item_allergens (
  organisation_id, menu_item_id, allergen_id, presence, notes_en, notes_it,
  approval_status, approved_at, approved_by
) values
  -- Arancini: glutine, latte, uova
  ('a0000000-0000-4000-8000-000000000001','aa900000-0000-4000-8000-000000000001','a1100000-0000-4000-8000-000000000001','contains',null,null,'approved',now(),'c0000000-0000-4000-8000-000000000001'),
  ('a0000000-0000-4000-8000-000000000001','aa900000-0000-4000-8000-000000000001','a1100000-0000-4000-8000-000000000007','contains',null,null,'approved',now(),'c0000000-0000-4000-8000-000000000001'),
  ('a0000000-0000-4000-8000-000000000001','aa900000-0000-4000-8000-000000000001','a1100000-0000-4000-8000-000000000003','contains',null,null,'approved',now(),'c0000000-0000-4000-8000-000000000001'),
  -- Vitello tonnato: pesce, uova
  ('a0000000-0000-4000-8000-000000000001','aa900000-0000-4000-8000-000000000002','a1100000-0000-4000-8000-000000000004','contains',null,null,'approved',now(),'c0000000-0000-4000-8000-000000000001'),
  ('a0000000-0000-4000-8000-000000000001','aa900000-0000-4000-8000-000000000002','a1100000-0000-4000-8000-000000000003','contains',null,null,'approved',now(),'c0000000-0000-4000-8000-000000000001'),
  -- Cacio e pepe: glutine, latte, uova
  ('a0000000-0000-4000-8000-000000000001','aa900000-0000-4000-8000-000000000003','a1100000-0000-4000-8000-000000000001','contains',null,null,'approved',now(),'c0000000-0000-4000-8000-000000000001'),
  ('a0000000-0000-4000-8000-000000000001','aa900000-0000-4000-8000-000000000003','a1100000-0000-4000-8000-000000000007','contains',null,null,'approved',now(),'c0000000-0000-4000-8000-000000000001'),
  ('a0000000-0000-4000-8000-000000000001','aa900000-0000-4000-8000-000000000003','a1100000-0000-4000-8000-000000000003','contains',null,null,'approved',now(),'c0000000-0000-4000-8000-000000000001'),
  -- Lasagne: glutine, latte, uova, sedano
  ('a0000000-0000-4000-8000-000000000001','aa900000-0000-4000-8000-000000000004','a1100000-0000-4000-8000-000000000001','contains',null,null,'approved',now(),'c0000000-0000-4000-8000-000000000001'),
  ('a0000000-0000-4000-8000-000000000001','aa900000-0000-4000-8000-000000000004','a1100000-0000-4000-8000-000000000007','contains',null,null,'approved',now(),'c0000000-0000-4000-8000-000000000001'),
  ('a0000000-0000-4000-8000-000000000001','aa900000-0000-4000-8000-000000000004','a1100000-0000-4000-8000-000000000003','contains',null,null,'approved',now(),'c0000000-0000-4000-8000-000000000001'),
  ('a0000000-0000-4000-8000-000000000001','aa900000-0000-4000-8000-000000000004','a1100000-0000-4000-8000-000000000009','contains',null,null,'approved',now(),'c0000000-0000-4000-8000-000000000001'),
  -- Pasta bambini: glutine; puo' contenere uova
  ('a0000000-0000-4000-8000-000000000001','aa900000-0000-4000-8000-000000000005','a1100000-0000-4000-8000-000000000001','contains',null,null,'approved',now(),'c0000000-0000-4000-8000-000000000001'),
  ('a0000000-0000-4000-8000-000000000001','aa900000-0000-4000-8000-000000000005','a1100000-0000-4000-8000-000000000003','may_contain','Cooked in water shared with egg pasta.','Cotta in acqua condivisa con la pasta all''uovo.','approved',now(),'c0000000-0000-4000-8000-000000000001'),
  -- Polpo: molluschi; puo' contenere crostacei
  ('a0000000-0000-4000-8000-000000000001','aa900000-0000-4000-8000-000000000006','a1100000-0000-4000-8000-000000000014','contains',null,null,'approved',now(),'c0000000-0000-4000-8000-000000000001'),
  ('a0000000-0000-4000-8000-000000000001','aa900000-0000-4000-8000-000000000006','a1100000-0000-4000-8000-000000000002','may_contain','Handled on the same section as shellfish.','Lavorato nella stessa zona dei crostacei.','approved',now(),'c0000000-0000-4000-8000-000000000001'),
  -- Affogato: latte; puo' contenere frutta a guscio
  ('a0000000-0000-4000-8000-000000000001','aa900000-0000-4000-8000-000000000007','a1100000-0000-4000-8000-000000000007','contains',null,null,'approved',now(),'c0000000-0000-4000-8000-000000000001'),
  ('a0000000-0000-4000-8000-000000000001','aa900000-0000-4000-8000-000000000007','a1100000-0000-4000-8000-000000000008','may_contain','Scooped in a gelato cabinet shared with nut flavours.','Servito da un banco gelato condiviso con gusti alla frutta secca.','approved',now(),'c0000000-0000-4000-8000-000000000001')
on conflict do nothing;

commit;

-- Verifica
select
  (select count(*) from public.menu_items
    where location_id = 'b0000000-0000-4000-8000-000000000001'
      and approval_status = 'approved')                                as piatti_approvati,
  (select count(*) from public.frequently_asked_questions
    where location_id = 'b0000000-0000-4000-8000-000000000001'
      and approval_status = 'approved')                                as risposte_approvate,
  (select count(*) from public.business_hours
    where location_id = 'b0000000-0000-4000-8000-000000000001'
      and is_closed = false)                                           as fasce_orarie;
