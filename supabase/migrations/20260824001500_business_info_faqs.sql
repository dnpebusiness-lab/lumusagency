-- =============================================================================
-- 0015 · The approved answers reach the agent
-- =============================================================================
-- agent.approved_faqs has existed since Milestone 2, with its approval gate and
-- its row-level security, and nothing ever read it. Every question a restaurant
-- answers in its own words — what time the kitchen closes, is there parking, do
-- you have high chairs, who is the chef — was invisible to the voice agent.
--
-- Found the only way it could be: on a live call. Opening hours came back
-- correctly, because hours are structured data returned by this same function,
-- while every question answered from the FAQ table produced "I could not
-- confirm that". The data was approved, present and unreachable.
--
-- Additive: the function gains one key. Hours, address, contact and knowledge
-- articles are returned exactly as before.
-- =============================================================================

create or replace function agent.get_business_info(p_location uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'location_id', l.id,
    'name', l.name,
    'address', concat_ws(', ',
      nullif(l.address_line1, ''), nullif(l.address_line2, ''),
      nullif(l.city, ''), nullif(l.postal_code, '')),
    'directions_note', l.directions_note,
    'phone', l.phone_e164,
    'timezone', l.timezone,
    'max_party_size_auto_book', l.max_party_size_auto_book,
    'hours', coalesce((
      select jsonb_agg(jsonb_build_object(
        'day_of_week', h.day_of_week,
        'service', h.service_label,
        'opens_at', h.opens_at,
        'closes_at', h.closes_at,
        'is_closed', h.is_closed,
        'valid_from', h.valid_from,
        'valid_to', h.valid_to,
        'note', h.note
      ) order by h.day_of_week nulls last, h.opens_at)
      from public.business_hours h
      where h.location_id = l.id
    ), '[]'::jsonb),
    'articles', coalesce((
      select jsonb_agg(jsonb_build_object(
        'category', k.category,
        'title_en', k.title_en, 'title_it', k.title_it,
        'body_en', k.body_en, 'body_it', k.body_it
      ) order by k.display_order)
      from agent.approved_knowledge_articles k
      where k.location_id = l.id
    ), '[]'::jsonb),
    -- Approved answers, in the restaurant's own words. Bounded at fifty: this
    -- travels into a prompt on every call, and a knowledge base that grows
    -- without limit would quietly become a latency and cost problem on the
    -- telephone, where both are heard.
    'faqs', coalesce((
      select jsonb_agg(jsonb_build_object(
        'question_en', f.question_en, 'question_it', f.question_it,
        'answer_en', f.answer_en, 'answer_it', f.answer_it,
        'tags', f.tags
      ) order by f.display_order)
      from (
        select * from agent.approved_faqs af
        where af.location_id = l.id
        order by af.display_order
        limit 50
      ) f
    ), '[]'::jsonb)
  )
  from public.locations l
  where l.id = p_location
    and l.is_active
    and l.deleted_at is null;
$$;

comment on function agent.get_business_info(uuid) is
  'Business facts for one location: hours (structured, not approval-gated), plus approved knowledge articles and approved FAQs.';
