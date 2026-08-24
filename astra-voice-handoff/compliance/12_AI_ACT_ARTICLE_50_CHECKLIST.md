# EU AI Act Article 50 transparency checklist

Applicable date: 2 August 2026  
System: interactive AI voice receptionist

The European Commission states that people must be informed from the start of the first interaction, clearly and distinguishably, when directly interacting with AI. Astra must not rely on the voice sounding synthetic enough to make disclosure “obvious”.

## Product requirements

- [ ] First spoken turn names Astra as an **AI assistant**.
- [ ] First spoken turn identifies the restaurant/location.
- [ ] Disclosure is available in English and Italian and follows the configured opening language.
- [ ] Disclosure occurs before collecting name, booking or allergy details.
- [ ] Caller can interrupt, but interrupted disclosure is replayed/completed before substantive processing.
- [ ] Disclosure version, language, timestamp and successful completion are logged.
- [ ] Agent never claims or implies it is a human.
- [ ] If asked, agent clearly explains its AI nature and limitations.
- [ ] Human-transfer wording does not promise a person is available when none is.
- [ ] Accessibility and intelligibility are tested at telephone quality and with background noise.
- [ ] Restaurant dashboard displays the currently deployed disclosure script/version.
- [ ] Any prompt/config change that removes or delays disclosure is rejected by validation.

## Evidence

- automated prompt-builder unit test;
- webhook/call-event assertion for disclosure completion;
- English and Italian live-call recordings used only in a controlled test environment and deleted after scoring;
- signed restaurant approval of the deployed wording;
- release checklist entry with date and owner.

## Official sources

- https://digital-strategy.ec.europa.eu/en/faqs/transparency-obligations-under-article-50-ai-act
- https://digital-strategy.ec.europa.eu/en/policies/guidelines-ai-transparency-obligations

