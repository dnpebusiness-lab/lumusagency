-- =============================================================================
-- PART 2 of 4 · New call event types (must run on its own)
-- =============================================================================
-- GENERATED FILE — do not edit. Rebuild with: npm run db:bundle
--
-- Astra Voice · concatenation of the migrations in supabase/migrations/, in
-- order, for pasting into the Supabase SQL Editor when the CLI is not
-- available. The CLI path (supabase db push) remains the primary route and
-- applies the same files individually.
--
-- Run the parts IN ORDER. Part 2 exists on its own because PostgreSQL forbids
-- using an enum value in the same transaction that added it, and the SQL Editor
-- wraps a submission in one transaction.
-- =============================================================================

-- ─── 20260824001100_disclosure_recording_retention.sql ───
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
