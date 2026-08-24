-- =============================================================================
-- 0011 · Milestone 4A — new call event types
-- =============================================================================
-- Deliberately alone in its own migration.
--
-- PostgreSQL forbids using an enum value that was added in the *same*
-- transaction. Supabase applies each migration file in a transaction, so
-- keeping ALTER TYPE ... ADD VALUE in a file of its own is what lets migration
-- 0012 reference these values safely.
--
-- Additive only: adding a value cannot invalidate an existing row.
-- =============================================================================

alter type app.call_event_type add value if not exists 'ai_disclosure_started';
alter type app.call_event_type add value if not exists 'ai_disclosure_completed';
alter type app.call_event_type add value if not exists 'ai_disclosure_replayed';
alter type app.call_event_type add value if not exists 'tool_rate_limited';
alter type app.call_event_type add value if not exists 'recording_url_discarded';
