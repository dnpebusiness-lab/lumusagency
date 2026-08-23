# PRD — Astra Voice (V1 Pilot)

> **Sintesi in italiano**
> Questo documento dice **cosa** costruiamo e **come capiamo se funziona**.
> In una frase: un receptionist telefonico AI che risponde al telefono del ristorante 24/7,
> parla inglese e italiano, risponde solo a informazioni approvate dal ristoratore,
> prende prenotazioni, manda un SMS di conferma, e passa la chiamata a una persona
> quando serve (reclami, allergie gravi, gruppi grandi, dubbio).
> Tutto finisce in una dashboard dove lo staff vede chiamate, trascrizioni e prenotazioni.
> Alla fine del documento ci sono i **criteri di accettazione**: se non sono tutti verdi, la V1 non è finita.

Version 1.0 · Milestone 1 · Owner: founder · Status: approved for build

---

## 1. Problem

Small and mid-size restaurants lose revenue on the telephone.

- Calls arrive exactly when staff are least able to answer them: service peaks.
- A missed call is usually a lost booking, and the caller phones a competitor instead.
- Answering repeats the same twelve questions (hours, address, parking, vegan options, allergens, group bookings) hundreds of times a month.
- Existing answering machines and generic call-answering services cannot check availability or take a real reservation.
- Getting an allergen answer wrong is not a customer-service problem, it is a **safety** problem.

## 2. Product summary

Astra Voice answers the restaurant's inbound calls with a natural-sounding AI receptionist that:

1. speaks **English and Italian** and follows the caller's language,
2. answers **only** from information the restaurant has entered and **approved**,
3. checks availability and creates reservations through a pluggable booking provider,
4. sends an SMS confirmation,
5. **hands the call to a human** whenever the situation requires a person,
6. records every call as searchable data: transcript, summary, intent, outcome.

The restaurant manages everything from a web dashboard. No engineer is required to change opening hours, a price, a policy, or the greeting.

## 3. Users

| User | Needs | Gets |
|---|---|---|
| **Restaurant owner** | Stop losing calls; control cost and risk | Overview metrics, billing, staff access, full settings |
| **Manager** | The agent must say the *right* thing | Knowledge base, menu & allergens with approval workflow, agent settings, escalation rules |
| **Floor / host staff** | Know who is arriving and why the phone rang | Call list, transcripts, reservation list, transfer alerts |
| **Caller (guest)** | Get an answer or a table, fast, without a robot loop | Natural conversation, ability to interrupt, ability to reach a human |
| **Platform operator (us)** | Onboard restaurants, support them safely | Multi-tenant admin, audited support access, webhook/event observability |

## 4. V1 scope — functional requirements

### FR-1 Call handling
- FR-1.1 Answer inbound PSTN calls on the location's number.
- FR-1.2 Greet with the location's configured greeting; bilingual greeting if enabled.
- FR-1.3 Continue in the caller's detected language (EN or IT) for the whole call.
- FR-1.4 Support **barge-in**: the caller can interrupt the agent at any time.
- FR-1.5 One question per turn, short spoken sentences, no written-chatbot monologues.
- FR-1.6 Graceful behaviour when a backend tool fails (never a silent hang, never a false confirmation).
- FR-1.7 Configurable behaviour when the restaurant is **closed** (still answer, still book for future dates, do not transfer).

### FR-2 Question answering (approved knowledge only)
The agent must answer from structured, approved data across these domains:
opening hours · address & directions · services · menu items · prices · dietary options · allergens · reservation policy · accessibility · parking · events & group bookings.

- FR-2.1 Every answer is grounded in a database record with `approval_status = 'approved'`.
- FR-2.2 If no approved record covers the question → the agent says it does not know and offers a human.
- FR-2.3 The agent never invents availability, dishes, prices or policies.
- FR-2.4 Knowledge-base text is treated as **untrusted input** and cannot change the agent's instructions (prompt-injection defence).

### FR-3 Reservations
- FR-3.1 Check availability through the `BookingProvider` interface.
- FR-3.2 Collect and confirm: name · phone · date · time · party size · special requirements.
- FR-3.3 **Read back** the complete reservation before creating it, and require verbal confirmation.
- FR-3.4 Create the reservation only via a tool call; report only what the tool returned.
- FR-3.5 Offer alternative slots when the requested time is unavailable.
- FR-3.6 Handle mid-call changes (caller changes date/time/party size) without re-asking everything.
- FR-3.7 Party size above the configured threshold (default 8) → escalate, never auto-book.
- FR-3.8 Ambiguous dates ("next Friday", "il 3") are disambiguated by explicit confirmation of the full date.

### FR-4 SMS
- FR-4.1 Send a confirmation SMS after a successful reservation, in the call's language.
- FR-4.2 Send a link (menu, directions, booking page) on request.
- FR-4.3 SMS failure must **not** invalidate the reservation, and must be reported honestly to the caller and logged.

### FR-5 Human transfer
Mandatory transfer triggers:
- FR-5.1 caller explicitly asks for a person
- FR-5.2 agent uncertainty / no approved answer
- FR-5.3 complaint
- FR-5.4 **serious allergy**
- FR-5.5 large event or group booking
- FR-5.6 request outside approved information
- FR-5.7 A failed transfer must be admitted to the caller, with a fallback (take a message / offer callback), and logged as `transfer_failed`.

### FR-6 Call data
Persist for every call: start & end time, duration, caller number (where legally/technically available), full transcript, summary, detected intent(s), outcome, reservation status, transfer status, failure/escalation reason.

### FR-7 Dashboard
Six areas: **Overview · Calls · Reservations · Knowledge · Agent settings · Organisation settings** (detailed in `ARCHITECTURE.md` §Dashboard).

### FR-8 Self-service configuration
An authorised manager can change greeting, hours, menu, prices, allergens, FAQs, policies, transfer number and escalation rules **without a code change or a deployment**.

## 5. Non-functional requirements

| ID | Requirement | Target |
|---|---|---|
| NFR-1 | Perceived response latency in conversation | < 1.2 s median agent first-token |
| NFR-2 | Tool endpoint latency (availability, booking) | p95 < 800 ms |
| NFR-3 | Webhook processing | idempotent, signature-verified, ≤ 2 s |
| NFR-4 | Dashboard first contentful paint | < 2 s on 4G |
| NFR-5 | Accessibility | WCAG 2.1 AA for the dashboard |
| NFR-6 | Tenancy isolation | enforced in the database (RLS), not only in application code |
| NFR-7 | Availability of tool endpoints | designed for graceful degradation; no false confirmations under failure |
| NFR-8 | Type safety | `tsc --noEmit` clean, `strict: true` |

## 6. Out of scope for V1

Phone ordering · phone payments · outbound marketing calls · loyalty programmes · delivery management · full POS integration · native mobile apps · custom voice cloning · complex enterprise analytics.

## 7. Success metrics for the pilot

| Metric | Target |
|---|---|
| Calls answered (vs. offered) | ≥ 98% |
| Calls resolved without human transfer | ≥ 60% |
| Reservation completion rate, when the caller intended to book | ≥ 70% |
| **False confirmations** (agent said "booked"/"transferred" and it was not) | **0 — hard failure** |
| **Unapproved allergen statements** | **0 — hard failure** |
| Manager edits requiring engineering help | 0 |

## 8. Acceptance criteria (V1 "done" definition)

A criterion is only green when a **test proves it**, not when the code exists.

| # | Criterion | Verified by |
|---|---|---|
| AC-01 | An inbound call is answered and produces a `call_sessions` row with start/end, transcript, summary, intent, outcome | Milestone 4 webhook fixtures + one live test call |
| AC-02 | English caller and Italian caller are each handled end-to-end in their own language | Call scenarios EN-*/IT-* |
| AC-03 | Caller interruption (barge-in) works and does not corrupt the transcript | Live test call + scenario |
| AC-04 | A reservation is created only after the tool returns success, and details are read back first | Unit + integration tests on the reservation tool |
| AC-05 | Booking-provider failure produces an honest message, a `failed` record and an escalation — never a confirmation | Fault-injection test |
| AC-06 | SMS failure does not roll back or falsify a successful reservation | Fault-injection test |
| AC-07 | Transfer failure is admitted to the caller and logged as `transfer_failed` | Fault-injection test |
| AC-08 | All six mandatory transfer triggers fire | 6 scripted scenarios |
| AC-09 | The agent refuses to answer anything not backed by an approved record | Scenario: unknown menu item |
| AC-10 | Unapproved menu/allergen rows are never returned by any tool endpoint | Integration test on the knowledge query layer |
| AC-11 | A severe-allergy mention always transfers and always logs an allergen escalation | Scenario + audit-log assertion |
| AC-12 | A prompt-injection string stored in the knowledge base does not alter agent behaviour | Injection scenario + sanitisation unit tests |
| AC-13 | A user in organisation A cannot read any row of organisation B, tested at the database level with RLS on | SQL-level RLS test suite |
| AC-14 | Webhooks reject an invalid signature and process a duplicate delivery exactly once | Webhook tests |
| AC-15 | A manager can change hours, a price and an allergen from the dashboard and the change reaches the agent without deployment | E2E test |
| AC-16 | Every allergen/menu change writes an audit-log entry with before/after and actor | E2E + DB assertion |
| AC-17 | Retention settings actually delete transcripts past the configured window | Scheduled-job test |
| AC-18 | Dashboard passes automated accessibility checks and works at 375 px width | Playwright + axe |
| AC-19 | `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` all pass with zero errors | CI |
| AC-20 | 20+ scripted call scenarios exist with expected outcomes, and results are recorded honestly including failures | `TEST_PLAN.md` results table |

## 9. Known limitations to be documented at launch

- Voice quality, latency and accent handling depend on a third-party vendor (Retell) we do not control.
- Strong regional accents and noisy dining rooms will degrade recognition; the escalation path is the mitigation, not a fix.
- The agent cannot handle simultaneous multi-party conversation or a caller switching language mid-sentence reliably.
- 🔴 Legal compliance (GDPR/DPIA/consent/DPA) is **not** delivered by this software and requires professional review.
