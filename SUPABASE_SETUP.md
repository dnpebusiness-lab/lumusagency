# SUPABASE_SETUP.md — come collegare il database

Guida passo passo, in italiano semplice. Non servono conoscenze tecniche.

> ⚠️ **Regola d'oro:** le chiavi non si incollano MAI in una chat, in uno screenshot,
> in un messaggio o dentro il codice. Vanno solo nel file `.env.local` sul tuo computer
> (che non finisce su GitHub) e nelle impostazioni di Netlify.
> Se una chiave finisce per sbaglio in una chat, va considerata compromessa: si rigenera.

Tempo necessario: circa **15 minuti**.

---

## 1. Creare il progetto Supabase gratuito

1. Vai su **https://supabase.com** e clicca su *Start your project*.
2. Registrati (va benissimo con GitHub).
3. Clicca **New project**.
4. Compila così:
   - **Name**: `astra-voice` (o quello che preferisci)
   - **Database Password**: clicca *Generate a password* e **salvala in un gestore di password**.
     Ti servirà solo per operazioni tecniche; non è la password con cui entrerai nella dashboard.
   - **Region**: vedi il punto 2 qui sotto — è importante.
   - **Pricing plan**: **Free**.
5. Clicca **Create new project** e aspetta 2-3 minuti.

## 2. Quale regione scegliere

Scegli **`eu-west-1` (Ireland)**.

Perché conta: il progetto opera in Irlanda e nell'Unione Europea, e tratteremo dati personali
(numeri di telefono, trascrizioni di telefonate). Tenere il database dentro l'UE **semplifica molto**
il quadro GDPR, perché evita un trasferimento internazionale di dati per la parte che controlliamo noi.

Se `eu-west-1 (Ireland)` non fosse disponibile, la seconda scelta è `eu-central-1 (Frankfurt)`.
Non scegliere una regione fuori dall'UE.

> Nota onesta: questo **non** rende il sistema conforme al GDPR. Retell, Twilio e Stripe restano
> fornitori con sede negli Stati Uniti. Vedi `SECURITY_AND_PRIVACY.md` §10.

## 3. Dove trovare l'URL del progetto

1. Nel progetto, in basso a sinistra, clicca l'icona **ingranaggio** (*Project Settings*).
2. Menù di sinistra → **API**.
3. In alto trovi **Project URL**. È tipo `https://abcdefghijkl.supabase.co`.
4. Clicca l'icona *copia*.

➡️ Questo valore va in `NEXT_PUBLIC_SUPABASE_URL`.

## 4. Dove trovare la chiave pubblica (anon / publishable)

Nella stessa pagina **Project Settings → API**, sezione *Project API keys*:

- La chiave chiamata **`anon` `public`** (nelle versioni più recenti si chiama **publishable key**).

➡️ Questo valore va in `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

**Questa chiave è pubblica di proposito.** Finisce nel browser ed è normale che sia così: a proteggere
i dati non è la segretezza di questa chiave, ma le regole *Row Level Security* dentro il database.

## 5. Dove trovare la chiave service_role (SEGRETA)

Sempre in **Project Settings → API**, sotto *Project API keys*:

- Clicca **Reveal** accanto a **`service_role` `secret`**.

➡️ Questo valore va in `SUPABASE_SERVICE_ROLE_KEY`.

🔴 **Questa chiave scavalca completamente tutte le protezioni del database.**
Chi la possiede può leggere e modificare i dati di *qualsiasi* ristorante.

- Non deve MAI stare in una variabile che inizia con `NEXT_PUBLIC_`.
- Non deve MAI comparire nel browser, in un log, in una chat o in uno screenshot.
- Nel nostro codice viene usata solo dai webhook, dagli strumenti dell'agente vocale e dal
  lavoro programmato di cancellazione dati.

## 6. Dove va ogni valore

Sul tuo computer, nella cartella del progetto:

```bash
cp .env.example .env.local
```

Poi apri `.env.local` con un editor di testo e riempi:

| Variabile | Valore | Dove si trova |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | lo scrivi tu |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL | Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | chiave `anon` / publishable | Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | chiave `service_role` | Settings → API (clicca *Reveal*) |
| `SUPABASE_DB_URL` | stringa di connessione | Settings → Database → *Connection string* → **URI** |

`.env.local` è già escluso da Git (`.gitignore`), quindi non finirà mai su GitHub.

**In produzione** gli stessi valori si incollano in Netlify:
*Site configuration → Environment variables → Add a variable*.

## 7. Collegare il repository a Supabase

Serve la **Supabase CLI**. Installala una volta sola:

```bash
npm install -g supabase
supabase login          # si apre il browser, autorizzi, torni al terminale
```

Poi, dentro la cartella del progetto:

```bash
supabase link --project-ref IL_TUO_PROJECT_REF
```

Il `project-ref` è la parte centrale dell'URL del progetto: se l'URL è
`https://abcdefghijkl.supabase.co`, il ref è **`abcdefghijkl`**.
Lo trovi anche in *Project Settings → General → Reference ID*.

Ti chiederà la **Database Password** salvata al punto 1.

## 8. Applicare le migrazioni (creare le tabelle)

Ci sono due strade. Il risultato è identico: le stesse istruzioni SQL, nello stesso ordine.

### Strada A — con la CLI (consigliata se hai già fatto il punto 7)

```bash
supabase db push
```

Esegue, in ordine, i **quattordici** file in `supabase/migrations/` e ne registra lo storico,
così i prossimi aggiornamenti applicano solo le novità.

### Strada B — senza installare niente, dal browser

Se non vuoi installare la CLI, apri *Supabase → SQL Editor* e incolla **quattro file già pronti**,
uno alla volta, **in questo ordine**:

| Ordine | File | Cosa fa |
|---|---|---|
| 1 | `supabase/dist/01_schema.sql` | tabelle, ruoli, regole di sicurezza |
| 2 | `supabase/dist/02_event_types.sql` | nuovi tipi di evento (deve stare da solo) |
| 3 | `supabase/dist/03_voice.sql` | privacy, strumenti vocali, salvataggio chiamate |
| 4 | `supabase/dist/04_demo_data.sql` | dati dimostrativi — **solo su un progetto di prova** (vedi punto 9) |

Aspetta il `Success` prima di passare al file successivo.
Il file 2 è separato per un motivo tecnico preciso: PostgreSQL non permette di *usare* un nuovo
valore di elenco nella stessa transazione in cui lo si aggiunge, e l'editor SQL esegue tutto ciò
che incolli come una sola transazione. Uniti, i file 2 e 3 darebbero errore.

Questi quattro file sono **generati** dagli stessi file di `supabase/migrations/`
(`npm run db:bundle`) e un test automatico fallisce se qualcuno li lascia indietro: non possono
diventare una versione vecchia del database.

### In entrambi i casi

Al termine il database avrà **26 tabelle**, **71 regole di sicurezza (RLS)** e i controlli di integrità.

Per controllare che sia andato tutto bene:
*Supabase → Table Editor*: devi vedere `organisations`, `locations`, `menu_items`, `call_sessions`, ecc.

## 9. Caricare i dati dimostrativi

🔴 **Solo su un progetto di prova.** Il seed crea account demo con una password nota
(`AstraDemo!2026`) e un ristorante inventato. Non caricarlo mai su un progetto con clienti veri.

```bash
psql "$SUPABASE_DB_URL" -f supabase/seed.sql
```

Se non hai `psql`: apri *Supabase → SQL Editor* e incolla `supabase/dist/04_demo_data.sql`
(è lo stesso contenuto di `supabase/seed.sql`, già pronto per l'editor).

Dopo il caricamento puoi entrare nella dashboard con:

| Email | Ruolo | Cosa può fare |
|---|---|---|
| `owner.demo@example.com` | Titolare | tutto |
| `admin.demo@example.com` | Amministratore | tutto tranne cedere la proprietà |
| `manager.demo@example.com` | Responsabile sede | menu, allergeni, approvazioni |
| `staff.demo@example.com` | Personale | vede chiamate, aggiorna prenotazioni |
| `viewer.demo@example.com` | Sola lettura | vede e basta |

Password per tutti: `AstraDemo!2026`

## 10. Verificare che la sicurezza (RLS) sia attiva

Apri **Supabase → SQL Editor**, incolla questo ed esegui:

```sql
-- Deve restituire ZERO righe. Ogni riga sarebbe una tabella non protetta.
select c.relname as tabella_non_protetta
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity;
```

Poi controlla che le regole esistano davvero:

```sql
-- Deve restituire circa 50 politiche, distribuite su tutte le tabelle.
select tablename, count(*) as politiche
from pg_policies where schemaname = 'public'
group by tablename order by tablename;
```

E infine la prova più importante — che un ristorante non possa vedere i dati di un altro:

```bash
# Sul tuo computer, contro il database locale:
npm run test:db
```

Questo esegue 100+ test, fra cui il controllo che percorre **ogni tabella** con l'identità del
proprietario di un ristorante e verifica che veda **zero** righe dell'altro ristorante.

---

## Sviluppo locale senza Supabase Cloud

Non serve il progetto remoto per lavorare sul database.

**Se hai Docker:**
```bash
npm run db:start     # avvia Supabase in locale
npm run db:reset     # migrazioni + dati demo
```

**Se NON hai Docker** (come nell'ambiente in cui è stata sviluppata la Milestone 2), basta un
PostgreSQL normale:
```bash
scripts/db-local.sh reset    # crea il database, applica le migrazioni, carica il seed
scripts/db-local.sh psql     # apre una console SQL
```

Lo script usa `supabase/local/00_supabase_shim.sql`, che ricrea in locale la piccola parte di
Supabase da cui dipendono le migrazioni (lo schema `auth`, la funzione `auth.uid()` e i ruoli
`anon` / `authenticated` / `service_role`). **Quel file non va mai eseguito su un progetto vero**
e lo script si rifiuta di collegarsi a un host che non sia locale.

---

## Limiti noti di questa milestone

Cose che non ho potuto verificare in questo ambiente e che vanno controllate quando il progetto
remoto esisterà. Le elenco perché è più utile saperlo che scoprirlo dopo.

1. **Le migrazioni non sono ancora state eseguite su Supabase Cloud.** Sono state applicate da zero,
   ripetutamente, su PostgreSQL 16.13 reale, e i test girano contro quel database. Supabase Cloud usa
   PostgreSQL 15 o 17: non uso funzionalità legate alla versione, ma il primo `supabase db push` va
   guardato.
2. **`npm run db:types` richiede Docker**, che qui non c'è. Gli enum TypeScript sono quindi scritti a
   mano in `src/lib/db/enums.ts`, **con un test che li confronta con il database** e fallisce a ogni
   divergenza (`tests/database/enums.test.ts`). Quando avrai il progetto collegato, esegui
   `npm run db:types` e i tipi generati diventeranno la fonte di verità.
3. **I flussi di autenticazione via email** (conferma registrazione, reset password) non sono stati
   provati end-to-end, perché serve un vero server email di Supabase. Il codice è scritto e passa
   type-check, lint e build, ma finché non lo proviamo va considerato **non testato**.
4. **Il trigger su `auth.users`** che crea automaticamente il profilo è testato in locale contro lo
   shim. Su Supabase va confermato che il ruolo delle migrazioni possa creare trigger su `auth.users`
   (è il pattern standard, ma non l'ho potuto eseguire).
5. **`FORCE ROW LEVEL SECURITY` non è attivo** — solo `ENABLE`. La ragione tecnica è spiegata in cima
   a `supabase/migrations/20260824000800_row_level_security.sql`: forzarlo bloccherebbe anche il
   proprietario delle tabelle, cioè lo stesso ruolo che esegue migrazioni, trigger di audit e seed.
   Valutarlo sul progetto reale è un punto della checklist di Milestone 8.
