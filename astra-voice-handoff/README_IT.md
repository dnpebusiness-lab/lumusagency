# Astra Voice — pacchetto di passaggio a Claude Code

Data: 24 agosto 2026  
Stato: draft operativo, non parere legale

## Decisione presa

La Milestone 2 risulta completata. Non va ricostruita.

La prossima attività è una **Milestone 4A verticale**:

1. collegare e verificare il progetto Supabase Cloud;
2. ricevere una chiamata reale su un numero controllato da Astra;
3. identificare subito l'assistente come AI;
4. processare i webhook firmati e idempotenti;
5. salvare sessione, trascrizione e riepilogo con minimizzazione dei dati;
6. mostrare la chiamata in una pagina Calls minima della dashboard;
7. provare una chiamata inglese e una italiana;
8. eseguire il piano di test con accenti irlandesi e rumore.

Non si costruisce ancora l'intera Milestone 3 e non si implementano ancora prenotazione, SMS e trasferimento completi della Milestone 5.

## Blocco commerciale Retell

I Terms of Service Retell consultati il 24 agosto 2026 vietano, senza un accordo diverso, di usare il servizio come prodotto sostitutivo o livello intermedio e limitano la rivendita degli output vocali. Prima di usare Retell per clienti paganti Astra deve ottenere autorizzazione scritta o un accordo partner/reseller.

- Terms: https://www.retellai.com/legal/terms-of-service
- Partner programme: https://partners.retellai.com/
- Compliance/DPA/SCC: https://docs.retellai.com/general/compliance

Fino ad allora Retell può essere trattato esclusivamente come provider candidato per una prova interna controllata, senza onboarding di un ristorante pagante. Se Retell non autorizza il modello commerciale, il `VoiceProvider` deve consentire di sostituirlo.

## Contenuto

- `compliance/`: bozze da consegnare a solicitor/DPO e trasformare in documenti definitivi.
- `voice_qa/`: piano e casi di test per accento irlandese, rumore e sicurezza.
- `TECHNICAL_PRIVACY_REQUIREMENTS.md`: requisiti legali tradotti in controlli software.
- `CLAUDE_CODE_PROMPT_M4A.md`: prompt unico da incollare in Claude Code insieme a questo pacchetto e ai cinque documenti di progetto.

## Chi deve fare cosa

| Persona/ente | Cosa chiedere | Prima di |
|---|---|---|
| Founder | Creare Supabase in `eu-west-1`, inserire le chiavi solo in `.env.local`, creare account Twilio/Retell di test | sviluppo M4A |
| Claude Code | Validare M2 sul cloud e costruire M4A seguendo il prompt allegato | chiamata demo |
| Retell Sales/Partner team | Conferma scritta che Astra può offrire un SaaS multi-tenant a ristoranti; DPA/SCC; retention e PII controls | cliente pagante |
| Solicitor irlandese con esperienza GDPR/tech | DPIA, ruoli controller/processor, DPA, privacy notice, script, responsabilità allergeni, trasferimenti | chiamante reale esterno |
| DPO/consulente privacy | Base giuridica Art. 6 e Art. 9, retention, TIA, procedure DSR e breach | pilot live |
| Ristoratore pilota | Approvazione scritta di menu, allergeni, greeting, transfer number, notice e responsabilità operative | attivazione sede |
| Broker assicurativo | Professional indemnity/cyber e copertura per informazioni AI e incidenti allergeni | contratto pagante |
| Pen tester indipendente | Scope su tenancy, auth, webhook, PII, secrets e dashboard | produzione |

## Regola per i test

Per M4A:

- registrazione audio disabilitata;
- dati sintetici e numeri del team;
- nessun cliente pagante;
- nessuna promessa di conformità;
- nessun seed demo su un database di produzione;
- nessuna chiave incollata in chat o committata.

